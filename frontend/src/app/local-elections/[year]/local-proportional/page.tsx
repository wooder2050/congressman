import type { Metadata } from "next";
import CongressWrapper from "@/common/CongressWrapper";
import LocalElectionSkeleton from "@/components/local-elections/LocalElectionSkeleton";
import RaceListInner from "@/components/local-elections/RaceListInner";
import JsonLd from "@/components/seo/JsonLd";

interface Props {
  params: Promise<{ year: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year } = await params;
  return {
    title: `${year} 기초의원 비례대표 — 시군구별 정당 비례 후보자 명단`,
    description: `${year}년 전국동시지방선거 기초의원 비례대표(정당투표) 후보자를 시군구별로 확인하세요.`,
    alternates: {
      canonical: `https://www.lawmake.kr/local-elections/${year}/local-proportional`,
    },
  };
}

export default async function LocalProportionalListPage({ params }: Props) {
  const { year } = await params;

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
          ],
        }}
      />

      <div>
        <h1 className="text-2xl font-bold">기초의원 비례대표</h1>
        <p className="mt-1 text-sm text-(--color-text-secondary)">
          정당투표로 선출하는 시·군·구의회 비례대표 후보자입니다. 시군구별 정당 명부와 추천 순위를
          확인할 수 있습니다.
        </p>
      </div>

      <CongressWrapper fallback={<LocalElectionSkeleton />}>
        <RaceListInner year={year} electionId={`local-${year}`} initialType="local-proportional" />
      </CongressWrapper>
    </div>
  );
}
