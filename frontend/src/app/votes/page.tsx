import type { Metadata } from "next";
import CongressWrapper from "@/common/CongressWrapper";
import VoteListInner from "@/components/votes/VoteListInner";
import VoteListSkeleton from "@/components/skeletons/VoteListSkeleton";

export const metadata: Metadata = {
  title: "표결 현황",
  description: "대수별 본회의 표결 현황을 확인하세요.",
};

interface VotesPageProps {
  searchParams: Promise<{ term?: string }>;
}

export default async function VotesPage({ searchParams }: VotesPageProps) {
  const params = await searchParams;
  const termId = Number(params.term) || 22;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">표결 현황</h1>
        <p className="mt-1 text-sm text-(--color-text-tertiary)">본회의 표결 결과를 확인하세요.</p>
      </div>
      <CongressWrapper key={termId} fallback={<VoteListSkeleton />}>
        <VoteListInner termId={termId} />
      </CongressWrapper>
    </div>
  );
}
