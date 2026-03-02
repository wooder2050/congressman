import type { Metadata } from "next";
import CongressWrapper from "@/common/CongressWrapper";
import CommitteeListInner from "@/components/committees/CommitteeListInner";
import CommitteeListSkeleton from "@/components/skeletons/CommitteeListSkeleton";

export const metadata: Metadata = {
  title: "위원회 현황",
  description: "국회 상임위원회별 법안 처리 현황, 소속 위원, 다음 일정을 확인하세요.",
};

interface CommitteesPageProps {
  searchParams: Promise<{ term?: string }>;
}

export default async function CommitteesPage({ searchParams }: CommitteesPageProps) {
  const params = await searchParams;
  const termId = Number(params.term) || 22;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">위원회 현황</h1>
        <p className="mt-1 text-sm text-(--color-text-tertiary)">
          상임위원회별 법안 처리 현황과 소속 위원 정보를 확인하세요.
        </p>
      </div>
      <CongressWrapper key={termId} fallback={<CommitteeListSkeleton />}>
        <CommitteeListInner termId={termId} />
      </CongressWrapper>
    </div>
  );
}
