"use client";

import { useState, useMemo } from "react";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getVotes, getVoteSummary } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { VOTE_RESULT_MAP } from "@/lib/constants";
import VoteSummaryCard from "./VoteSummaryCard";
import VoteListItem from "./VoteListItem";

interface VoteListInnerProps {
  termId: number;
}

const resultOptions = [
  { id: null, label: "전체" },
  ...Object.entries(VOTE_RESULT_MAP).map(([id, info]) => ({ id, label: info.label })),
];

export default function VoteListInner({ termId }: VoteListInnerProps) {
  const { data } = useCongressSuspenseQuery(getVotes, { termId });
  const { data: summary } = useCongressSuspenseQuery(getVoteSummary, termId);
  const [selectedResult, setSelectedResult] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!selectedResult) return data.votes;
    return data.votes.filter((v) => v.resultCode === selectedResult);
  }, [data.votes, selectedResult]);

  return (
    <div className="space-y-4">
      <VoteSummaryCard summary={summary} />

      {/* 결과 필터 */}
      <div className="flex flex-wrap gap-2">
        {resultOptions.map((opt) => (
          <Button
            key={opt.id ?? "all"}
            variant={selectedResult === opt.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedResult(opt.id)}
            className="rounded-full px-4 text-sm font-semibold"
          >
            {opt.label}
          </Button>
        ))}
      </div>

      <p className="text-sm text-(--color-text-tertiary)">총 {filtered.length}건</p>

      {/* 표결 목록 */}
      {filtered.length === 0 ? (
        <div className="py-8 text-center text-(--color-text-tertiary)">표결 데이터가 없습니다.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((vote) => (
            <VoteListItem key={vote.id} vote={vote} />
          ))}
        </div>
      )}
    </div>
  );
}
