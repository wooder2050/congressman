import type { Metadata } from "next";
import CongressWrapper from "@/common/CongressWrapper";
import LocalElectionBreadcrumb from "@/components/local-elections/LocalElectionBreadcrumb";
import LocalElectionSkeleton from "@/components/local-elections/LocalElectionSkeleton";
import RaceListInner from "@/components/local-elections/RaceListInner";
import JsonLd from "@/components/seo/JsonLd";
import { sidoToShort } from "@/constants/local-elections";

export const revalidate = 600; // 10min

interface Props {
  params: Promise<{ year: string; sido: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year, sido: rawSido } = await params;
  const sido = decodeURIComponent(rawSido);
  const short = sidoToShort(sido);

  return {
    title: `${short} 광역의원 비례대표 — ${year} 지방선거`,
    description: `${year}년 ${sido} 광역의원 비례대표 정당 명부와 후보자를 확인하세요.`,
    alternates: {
      canonical: `https://www.lawmake.kr/local-elections/${year}/metro-proportional/${encodeURIComponent(sido)}`,
    },
  };
}

export default async function MetroProportionalSidoPage({ params }: Props) {
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
              name: "광역의원 비례",
              item: `https://www.lawmake.kr/local-elections/${year}/metro-proportional`,
            },
            {
              "@type": "ListItem",
              position: 4,
              name: short,
              item: `https://www.lawmake.kr/local-elections/${year}/metro-proportional/${encodeURIComponent(sido)}`,
            },
          ],
        }}
      />

      <LocalElectionBreadcrumb
        items={[
          { label: "제9회 전국동시지방선거", href: `/local-elections/${year}` },
          { label: "광역의원 비례", href: `/local-elections/${year}/metro-proportional` },
          { label: short },
        ]}
      />

      <h1 className="text-2xl font-bold">{short} 광역의원 비례대표</h1>

      <CongressWrapper fallback={<LocalElectionSkeleton />}>
        <RaceListInner
          year={year}
          electionId={`local-${year}`}
          initialType="metro-proportional"
          sido={sido}
        />
      </CongressWrapper>
    </div>
  );
}
