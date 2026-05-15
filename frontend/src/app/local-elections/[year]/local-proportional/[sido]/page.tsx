import type { Metadata } from "next";
import CongressWrapper from "@/common/CongressWrapper";
import LocalElectionBreadcrumb from "@/components/local-elections/LocalElectionBreadcrumb";
import LocalElectionSkeleton from "@/components/local-elections/LocalElectionSkeleton";
import LocalProportionalNotice from "@/components/local-elections/LocalProportionalNotice";
import RaceListInner from "@/components/local-elections/RaceListInner";
import JsonLd from "@/components/seo/JsonLd";
import { sidoToShort } from "@/constants/local-elections";

interface Props {
  params: Promise<{ year: string; sido: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year, sido: rawSido } = await params;
  const sido = decodeURIComponent(rawSido);
  const short = sidoToShort(sido);

  return {
    title: `${short} 기초의원 비례대표 — NEC Open API 미제공 안내`,
    description: `${year}년 ${sido} 기초의원 비례대표 후보자 명부는 중앙선관위 공공데이터 OpenAPI에서 제공되지 않습니다. NEC 선거통계시스템·선거공보 도서관에서 확인하세요.`,
    robots: { index: false, follow: true },
    alternates: {
      canonical: `https://www.lawmake.kr/local-elections/${year}/local-proportional/${encodeURIComponent(sido)}`,
    },
  };
}

export default async function LocalProportionalSidoPage({ params }: Props) {
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
              name: "기초의원 비례",
              item: `https://www.lawmake.kr/local-elections/${year}/local-proportional`,
            },
            {
              "@type": "ListItem",
              position: 4,
              name: short,
              item: `https://www.lawmake.kr/local-elections/${year}/local-proportional/${encodeURIComponent(sido)}`,
            },
          ],
        }}
      />

      <LocalElectionBreadcrumb
        items={[
          { label: "제9회 전국동시지방선거", href: `/local-elections/${year}` },
          { label: "기초의원 비례", href: `/local-elections/${year}/local-proportional` },
          { label: short },
        ]}
      />

      <h1 className="text-2xl font-bold">{short} 기초의원 비례대표</h1>

      <LocalProportionalNotice sido={sido} />

      <CongressWrapper fallback={<LocalElectionSkeleton />}>
        <RaceListInner
          year={year}
          electionId={`local-${year}`}
          initialType="local-proportional"
          sido={sido}
        />
      </CongressWrapper>
    </div>
  );
}
