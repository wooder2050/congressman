import type { Metadata } from "next";
import CongressWrapper from "@/common/CongressWrapper";
import LocalElectionBreadcrumb from "@/components/local-elections/LocalElectionBreadcrumb";
import LocalElectionSkeleton from "@/components/local-elections/LocalElectionSkeleton";
import PollListInner from "@/components/polls/PollListInner";
import JsonLd from "@/components/seo/JsonLd";

export const revalidate = 600; // 10min
export const dynamicParams = true;

interface Props {
  params: Promise<{ year: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year } = await params;
  return {
    title: `${year} 지방선거 여론조사 — 중앙선거여론조사심의위원회 등록 자료`,
    description: `${year}년 전국동시지방선거 + 재보궐선거 관련 NESDC 등록 여론조사를 조사기관·지역별로 모아보세요.`,
    alternates: {
      canonical: `https://www.lawmake.kr/local-elections/${year}/polls`,
    },
  };
}

export default async function PollsPage({ params }: Props) {
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
              name: "여론조사",
              item: `https://www.lawmake.kr/local-elections/${year}/polls`,
            },
          ],
        }}
      />

      <LocalElectionBreadcrumb
        items={[
          { label: "제9회 전국동시지방선거", href: `/local-elections/${year}` },
          { label: "여론조사" },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold">여론조사</h1>
        <p className="mt-2 text-sm text-(--color-text-secondary)">
          중앙선거여론조사심의위원회(NESDC)에 등록된 {year}년 지방선거 · 재보궐선거 관련 여론조사를
          조사기관 · 지역별로 모았습니다. 카드를 누르면 상세 메타와 첨부 자료(설문지 · 결과표)
          링크를 확인할 수 있습니다.
        </p>
      </div>

      <CongressWrapper fallback={<LocalElectionSkeleton />}>
        <PollListInner year={year} />
      </CongressWrapper>
    </div>
  );
}
