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
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-4 text-2xl font-bold">표결 현황</h1>
      <CongressWrapper fallback={<VoteListSkeleton />}>
        <VoteListInner termId={termId} />
      </CongressWrapper>
    </div>
  );
}
