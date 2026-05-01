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
    title: `${year} 기초단체장 선거 — 시장·군수·구청장 후보자 비교`,
    description: `${year}년 전국동시지방선거 기초단체장(시장·군수·구청장) 후보자를 비교하세요.`,
    alternates: {
      canonical: `https://www.lawmake.kr/local-elections/${year}/mayor`,
    },
  };
}

export default async function MayorListPage({ params }: Props) {
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
              name: "기초단체장",
              item: `https://www.lawmake.kr/local-elections/${year}/mayor`,
            },
          ],
        }}
      />

      <h1 className="text-2xl font-bold">기초단체장 (시장·군수·구청장)</h1>

      <CongressWrapper fallback={<LocalElectionSkeleton />}>
        <RaceListInner year={year} electionId={`local-${year}`} initialType="mayor" />
      </CongressWrapper>
    </div>
  );
}
