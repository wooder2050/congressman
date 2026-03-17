import type { Metadata } from "next";
import CongressWrapper from "@/common/CongressWrapper";
import PageIntro from "@/components/ui/page-intro";
import VoteListInner from "@/components/votes/VoteListInner";
import VoteListSkeleton from "@/components/skeletons/VoteListSkeleton";

export const metadata: Metadata = {
  title: "국회 표결 결과 - 22대 본회의 법안 투표 현황",
  description:
    "국회 본회의 표결 결과를 실시간으로 확인하세요. 22대 국회 1,286건의 법안별 찬성·반대·기권·불참 투표 내역과 의원별 표결 기록을 투명하게 공개합니다.",
  alternates: { canonical: "https://www.lawmake.kr/votes" },
};

interface VotesPageProps {
  searchParams: Promise<{ term?: string }>;
}

export default async function VotesPage({ searchParams }: VotesPageProps) {
  const params = await searchParams;
  const termId = Number(params.term) || 22;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-4 space-y-3">
        <h1 className="text-2xl font-bold">표결 현황</h1>
        <PageIntro
          description="국회 본회의에서 진행된 표결 결과를 확인할 수 있습니다. 본회의 표결은 위원회 심사를 마친 법안이 국회의원 전체 회의에서 최종 결정되는 절차입니다. 재적의원 과반수 출석에 출석의원 과반수 찬성으로 법안이 통과(가결)됩니다."
          details={[
            "원안가결(수정 없이 통과), 수정가결(일부 수정 후 통과), 부결(반대 다수로 미통과) 등 결과를 확인하세요.",
            "각 표결을 클릭하면 의원별 찬성·반대·기권·불참 내역을 투명하게 확인할 수 있습니다.",
            "표결 참여율과 정당별 투표 성향을 통해 국회의 의사결정 과정을 살펴보세요.",
          ]}
        />
      </div>
      <CongressWrapper key={termId} fallback={<VoteListSkeleton />}>
        <VoteListInner termId={termId} />
      </CongressWrapper>
    </div>
  );
}
