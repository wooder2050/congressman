import type { Metadata } from "next";
import CongressWrapper from "@/common/CongressWrapper";
import LocalElectionBreadcrumb from "@/components/local-elections/LocalElectionBreadcrumb";
import LocalElectionSkeleton from "@/components/local-elections/LocalElectionSkeleton";
import RaceListInner from "@/components/local-elections/RaceListInner";
import JsonLd from "@/components/seo/JsonLd";

export const revalidate = 2592000; // 30d — 개표 종료(6/4) 후 DB 무변경(최종 2026-06-06). 봇 재크롤링마다 재생성돼 ISR Write가 과다해 상향
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

interface Props {
  params: Promise<{ year: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year } = await params;
  return {
    title: `${year} 교육감 선거 — 후보자 비교`,
    description: `${year}년 전국동시지방선거 17개 시도 교육감 후보자를 비교하세요.`,
    alternates: {
      canonical: `https://www.lawmake.kr/local-elections/${year}/superintendent`,
    },
  };
}

export default async function SuperintendentListPage({ params }: Props) {
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
              name: "교육감",
              item: `https://www.lawmake.kr/local-elections/${year}/superintendent`,
            },
          ],
        }}
      />

      <LocalElectionBreadcrumb
        items={[
          { label: "제9회 전국동시지방선거", href: `/local-elections/${year}` },
          { label: "교육감" },
        ]}
      />

      <h1 className="text-2xl font-bold">교육감</h1>

      <CongressWrapper fallback={<LocalElectionSkeleton />}>
        <RaceListInner year={year} electionId={`local-${year}`} initialType="superintendent" />
      </CongressWrapper>
    </div>
  );
}
