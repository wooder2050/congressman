"use client";

import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getHomeStats } from "@/lib/api";
import VoteListItem from "@/components/votes/VoteListItem";

interface RejectedVotesProps {
  termId: number;
}

export default function RejectedVotes({ termId }: RejectedVotesProps) {
  const { data } = useCongressSuspenseQuery(getHomeStats, termId);

  if (!data.rejectedVotes?.length) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-(--color-text-primary)">최근 부결된 표결</h3>
      <p className="text-sm text-(--color-text-tertiary)">최근 본회의에서 부결된 안건입니다</p>
      <div className="space-y-3">
        {data.rejectedVotes.map((vote) => (
          <VoteListItem key={vote.id} vote={vote} />
        ))}
      </div>
    </div>
  );
}
