"use client";

import { useState } from "react";
import { useCongressQuery } from "@/hooks/useCongressQuery";
import { getVotes } from "@/lib/api";

interface VoteSelectorProps {
  termId: number;
  selectedVoteId: string | null;
  onSelect: (voteId: string | null) => void;
}

export default function VoteSelector({ termId, selectedVoteId, onSelect }: VoteSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data } = useCongressQuery(getVotes, { termId, limit: 50 });

  const votes = data?.votes ?? [];
  const selectedVote = votes.find((v) => v.id === selectedVoteId);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-(--color-border-primary) bg-(--color-bg-primary) px-3 py-2.5 text-left text-sm"
      >
        <span
          className={selectedVote ? "text-(--color-text-primary)" : "text-(--color-text-tertiary)"}
        >
          {selectedVote
            ? `${selectedVote.billName} (${selectedVote.procDate})`
            : "표결을 선택하면 의원별 투표 결과를 확인할 수 있습니다"}
        </span>
        <svg width={16} height={16} viewBox="0 0 16 16" fill="none" className="ml-2 shrink-0">
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 left-0 z-50 mt-1 max-h-64 overflow-y-auto rounded-lg border border-(--color-border-primary) bg-(--color-bg-primary) shadow-lg">
            <button
              onClick={() => {
                onSelect(null);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2.5 text-left text-sm hover:bg-(--color-bg-secondary) ${
                !selectedVoteId
                  ? "font-semibold text-(--color-primary)"
                  : "text-(--color-text-primary)"
              }`}
            >
              정당별 좌석 (기본)
            </button>
            {votes.map((vote) => (
              <button
                key={vote.id}
                onClick={() => {
                  onSelect(vote.id);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2.5 text-left text-sm hover:bg-(--color-bg-secondary) ${
                  vote.id === selectedVoteId
                    ? "font-semibold text-(--color-primary)"
                    : "text-(--color-text-primary)"
                }`}
              >
                <span className="line-clamp-1">{vote.billName}</span>
                <span className="text-xs text-(--color-text-tertiary)">
                  {vote.procDate} · {vote.procResult}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
