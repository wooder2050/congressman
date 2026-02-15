"use client";

import Link from "next/link";
import VoteSummaryCard from "@/components/votes/VoteSummaryCard";
import VoteListItem from "@/components/votes/VoteListItem";
import type { Vote, VoteSummary } from "@/types";

interface VotesTabProps {
  summary: VoteSummary;
  recentVotes: Vote[];
  termId: number;
}

export default function VotesTab({ summary, recentVotes, termId }: VotesTabProps) {
  if (summary.total === 0) {
    return (
      <div className="py-8 text-center text-(--color-text-tertiary)">표결 데이터가 없습니다.</div>
    );
  }

  return (
    <div className="space-y-4 py-4" role="tabpanel">
      <p className="text-sm text-(--color-text-tertiary)">
        제{termId}대 본회의 표결 현황 (총 {summary.total}건)
      </p>

      <VoteSummaryCard summary={summary} />

      {recentVotes.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-(--color-text-tertiary)">
            최근 표결 ({recentVotes.length}건)
          </h3>
          <div className="space-y-3">
            {recentVotes.map((vote) => (
              <VoteListItem key={vote.id} vote={vote} />
            ))}
          </div>
        </div>
      )}

      <Link
        href={`/votes?term=${termId}`}
        className="inline-flex items-center gap-1 rounded-lg bg-(--color-bg-secondary) px-4 py-3 text-base font-semibold text-(--color-primary) no-underline transition-colors hover:bg-(--color-bg-tertiary)"
      >
        전체 표결 보기 →
      </Link>
    </div>
  );
}
