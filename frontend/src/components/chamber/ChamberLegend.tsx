"use client";

import { MEMBER_VOTE_RESULT_MAP } from "@/lib/constants";
import type { AssignedSeat } from "@/lib/chamber/seat-assignment";
import type { VoteWithMemberVotes } from "@/types";

interface ChamberLegendProps {
  seats: AssignedSeat[];
  isVoteMode: boolean;
  voteData?: VoteWithMemberVotes | null;
}

export default function ChamberLegend({ seats, isVoteMode, voteData }: ChamberLegendProps) {
  if (isVoteMode && voteData) {
    const counts = {
      yes: voteData.vote.yesCount,
      no: voteData.vote.noCount,
      abstain: voteData.vote.abstainCount,
      absent: voteData.vote.memberTotal - voteData.vote.voteTotal,
    };

    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-(--color-border-primary) px-4 py-2.5">
        {(Object.keys(MEMBER_VOTE_RESULT_MAP) as Array<keyof typeof MEMBER_VOTE_RESULT_MAP>).map(
          (key) => (
            <div key={key} className="flex items-center gap-1.5">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: MEMBER_VOTE_RESULT_MAP[key].color }}
              />
              <span className="text-xs text-(--color-text-secondary)">
                {MEMBER_VOTE_RESULT_MAP[key].label} {counts[key]}
              </span>
            </div>
          ),
        )}
      </div>
    );
  }

  // Party mode: group seats by party and count
  const partyCounts = new Map<string, { name: string; color: string; count: number }>();
  for (const seat of seats) {
    if (!seat.memberId) continue;
    const existing = partyCounts.get(seat.partyId);
    if (existing) {
      existing.count++;
    } else {
      partyCounts.set(seat.partyId, {
        name: seat.partyName,
        color: seat.partyColor,
        count: 1,
      });
    }
  }

  const sortedParties = [...partyCounts.entries()].sort((a, b) => b[1].count - a[1].count);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-(--color-border-primary) px-4 py-2.5">
      {sortedParties.map(([id, party]) => (
        <div key={id} className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: party.color }} />
          <span className="text-xs text-(--color-text-secondary)">
            {party.name} {party.count}
          </span>
        </div>
      ))}
    </div>
  );
}
