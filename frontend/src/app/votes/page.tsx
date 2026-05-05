import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import CongressWrapper from "@/common/CongressWrapper";
import PageIntro from "@/components/ui/page-intro";
import VoteListInner from "@/components/votes/VoteListInner";
import VoteListSkeleton from "@/components/skeletons/VoteListSkeleton";

export const metadata: Metadata = {
  title: "국회 본회의 표결 — 의원별·정당별 찬반 기록 | 22대 국회",
  description:
    "22대 국회 표결 결과 1,370건+를 한눈에. 의원별 찬반 기록, 정당별 투표 성향, 찬반 팽팽한 법안까지 투명하게 확인하세요. 본회의 표결 가결·부결·수정안 결과 검색.",
  alternates: { canonical: "https://www.lawmake.kr/votes" },
  openGraph: {
    title: "국회 본회의 표결 — 의원별·정당별 찬반 기록",
    description: "22대 국회 본회의 표결 1,370건+의 의원별·정당별 찬반 기록을 투명하게 확인하세요.",
    url: "https://www.lawmake.kr/votes",
  },
};

interface VotesPageProps {
  searchParams: Promise<{ term?: string }>;
}

export default async function VotesPage({ searchParams }: VotesPageProps) {
  const params = await searchParams;
  const termId = Number(params.term) || 22;

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Dataset",
          name: "22대 국회 본회의 표결 데이터",
          description:
            "제22대 대한민국 국회(2024년 5월 30일 개원)의 본회의 표결 1,370건 이상의 결과를 포함하는 데이터셋입니다. 안건명, 표결 일시, 결과(원안가결·수정가결·부결)와 의원별 찬성·반대·기권·불참 내역, 정당별 투표 성향과 표결 참여율 통계를 제공합니다. 국회사무처 공공 데이터를 기반으로 매일 자동 동기화되어 갱신됩니다.",
          url: "https://www.lawmake.kr/votes",
          keywords: ["표결", "본회의", "국회", "찬반투표", "가결", "부결"],
          license: "https://www.data.go.kr/ugs/selectPublicDataUseGuide.do",
          temporalCoverage: "2024-05-30/..",
          creator: {
            "@type": "Organization",
            name: "lawmake.kr",
            url: "https://www.lawmake.kr",
          },
        }}
      />
      <div className="mb-4 space-y-3">
        <h1 className="text-2xl font-bold sm:text-3xl sm:font-extrabold sm:tracking-tight">
          표결 현황
        </h1>
        <PageIntro
          collapsible
          description="국회 본회의에서 진행된 표결 결과를 확인할 수 있습니다. 본회의 표결은 위원회 심사를 마친 법안이 국회의원 전체 회의에서 최종 결정되는 절차입니다. 재적의원 과반수 출석에 출석의원 과반수 찬성으로 법안이 통과(가결)됩니다."
          details={[
            "원안가결(수정 없이 통과), 수정가결(일부 수정 후 통과), 부결(반대 다수로 미통과) 등 결과를 확인하세요.",
            "각 표결을 클릭하면 의원별 찬성·반대·기권·불참 내역을 투명하게 확인할 수 있습니다.",
            "표결 참여율과 정당별 투표 성향을 통해 국회의 의사결정 과정을 살펴보세요.",
          ]}
        />
      </div>

      {/* 본회의 표결 안내 */}
      <section className="mb-4 space-y-4 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
        <h2 className="text-lg font-bold">본회의 표결의 의미와 중요성</h2>
        <div className="space-y-3 text-sm leading-relaxed text-(--color-text-secondary)">
          <p>
            본회의 표결은 대한민국 국회의 최종 의사결정 절차입니다. 위원회 심사를 통과한 법안이
            국회의원 전원이 참석하는 본회의에서 찬반을 가려 최종 확정됩니다. 헌법 제49조에 따라
            재적의원 과반수의 출석과 출석의원 과반수의 찬성으로 의결되며, 헌법 개정안 등 특별한
            사안은 가중 의결 정족수가 적용됩니다.
          </p>
          <p>
            국회의원의 표결은 전자투표 방식으로 진행되며, 찬성·반대·기권으로 의사를 표시합니다.
            표결에 불참한 의원은 &apos;불참&apos;으로 기록됩니다. 22대 국회에서는 현재까지 1,370건
            이상의 본회의 표결이 진행되었으며, 표결 결과는 원안가결, 수정가결, 부결 등으로
            구분됩니다.
          </p>
          <p>
            각 의원의 표결 내역은 공개 원칙에 따라 누구나 확인할 수 있습니다. 정당별 투표 성향을
            분석하면 여야 간 정책적 차이를 이해할 수 있으며, 찬반이 팽팽했던 표결은 사회적으로
            논란이 큰 쟁점법안인 경우가 많습니다. 이러한 투명한 정보 공개는 민주주의의 핵심 가치인
            국민의 알 권리를 보장합니다.
          </p>
        </div>
      </section>

      <CongressWrapper key={termId} fallback={<VoteListSkeleton />}>
        <VoteListInner termId={termId} />
      </CongressWrapper>
    </div>
  );
}
