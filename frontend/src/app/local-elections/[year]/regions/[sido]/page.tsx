import type { Metadata } from "next";
import CongressWrapper from "@/common/CongressWrapper";
import LocalElectionBreadcrumb from "@/components/local-elections/LocalElectionBreadcrumb";
import LocalElectionSkeleton from "@/components/local-elections/LocalElectionSkeleton";
import RegionDetailInner from "@/components/local-elections/RegionDetailInner";
import JsonLd from "@/components/seo/JsonLd";
import { sidoToShort } from "@/constants/local-elections";

export const revalidate = 600; // 10min (개표일 빠른 갱신 필요)

interface Props {
  params: Promise<{ year: string; sido: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year, sido: rawSido } = await params;
  const sido = decodeURIComponent(rawSido);
  const short = sidoToShort(sido);

  return {
    title: `${short} 지방선거 — ${year} 전체 선거 현황`,
    description: `${year}년 ${sido} 지방선거 전체 선거구 현황을 확인하세요. 광역단체장·기초단체장·교육감·광역의원·기초의원 후보자 정보.`,
    alternates: {
      canonical: `https://www.lawmake.kr/local-elections/${year}/regions/${encodeURIComponent(sido)}`,
    },
  };
}

export default async function RegionSidoPage({ params }: Props) {
  const { year, sido: rawSido } = await params;
  const sido = decodeURIComponent(rawSido);
  const short = sidoToShort(sido);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "홈", item: "https://www.lawmake.kr" },
            {
              "@type": "ListItem",
              position: 2,
              name: "지방선거",
              item: `https://www.lawmake.kr/local-elections/${year}`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: "지역별",
              item: `https://www.lawmake.kr/local-elections/${year}/regions`,
            },
            {
              "@type": "ListItem",
              position: 4,
              name: short,
              item: `https://www.lawmake.kr/local-elections/${year}/regions/${encodeURIComponent(sido)}`,
            },
          ],
        }}
      />

      <LocalElectionBreadcrumb
        items={[
          { label: "제9회 전국동시지방선거", href: `/local-elections/${year}` },
          { label: "지역별 현황", href: `/local-elections/${year}/regions` },
          { label: short },
        ]}
      />

      <h1 className="text-2xl font-bold">{short} 지방선거</h1>

      <CongressWrapper fallback={<LocalElectionSkeleton />}>
        <RegionDetailInner year={year} electionId={`local-${year}`} sido={sido} />
      </CongressWrapper>
    </div>
  );
}
