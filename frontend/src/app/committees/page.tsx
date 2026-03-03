import type { Metadata } from "next";
import CongressWrapper from "@/common/CongressWrapper";
import PageIntro from "@/components/ui/page-intro";
import CommitteeListInner from "@/components/committees/CommitteeListInner";
import CommitteeListSkeleton from "@/components/skeletons/CommitteeListSkeleton";

export const metadata: Metadata = {
  title: "위원회 현황",
  description:
    "국회 상임위원회별 법안 처리 현황, 소속 위원, 회의 일정을 확인하세요. 위원회는 법안 심사의 핵심 기관입니다.",
};

interface CommitteesPageProps {
  searchParams: Promise<{ term?: string }>;
}

export default async function CommitteesPage({ searchParams }: CommitteesPageProps) {
  const params = await searchParams;
  const termId = Number(params.term) || 22;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-4 space-y-3">
        <h1 className="text-2xl font-bold">위원회 현황</h1>
        <PageIntro
          description="국회에는 각 분야를 전문적으로 다루는 상임위원회가 있습니다. 상임위원회는 법안이 본회의에 올라가기 전에 내용을 검토하고 수정하는 핵심 기관으로, 사실상 국회 입법 활동의 중심입니다. 모든 법안은 반드시 소관 상임위원회의 심사를 거쳐야 본회의에 상정될 수 있습니다."
          details={[
            "위원회별 법안 처리 현황: 접수된 법안 수, 처리율, 계류 건수를 비교할 수 있습니다.",
            "소속 위원 목록과 위원장·간사 정보를 확인하고, 각 위원의 프로필로 이동할 수 있습니다.",
            "위원회별 다음 회의 일정과 안건을 미리 확인할 수 있습니다.",
          ]}
        />
      </div>
      <CongressWrapper key={termId} fallback={<CommitteeListSkeleton />}>
        <CommitteeListInner termId={termId} />
      </CongressWrapper>
    </div>
  );
}
