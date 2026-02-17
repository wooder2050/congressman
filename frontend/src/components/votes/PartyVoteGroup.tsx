"use client";

import { useState, useMemo } from "react";
import { ChevronDownIcon } from "lucide-react";
import MemberVotePill from "./MemberVotePill";
import type { VoteMemberResult, MemberVoteResult } from "@/types";

interface PartyVoteGroupProps {
  partyName: string;
  partyColor: string;
  members: VoteMemberResult[];
  termId: number;
  defaultExpanded: boolean;
}

const RESULT_ORDER: Record<MemberVoteResult, number> = {
  yes: 0,
  no: 1,
  abstain: 2,
  absent: 3,
};

export default function PartyVoteGroup({
  partyName,
  partyColor,
  members,
  termId,
  defaultExpanded,
}: PartyVoteGroupProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const sortedMembers = useMemo(
    () => [...members].sort((a, b) => RESULT_ORDER[a.result] - RESULT_ORDER[b.result]),
    [members],
  );

  const counts = useMemo(() => {
    const c = { yes: 0, no: 0, abstain: 0, absent: 0 };
    for (const m of members) c[m.result]++;
    return c;
  }, [members]);

  const total = members.length;

  return (
    <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4">
      {/* 헤더 */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2 text-left sm:cursor-default"
      >
        <span
          className="inline-block h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: partyColor }}
        />
        <span className="font-semibold text-(--color-text-primary)">{partyName}</span>
        <span className="text-sm text-(--color-text-tertiary)">{total}명</span>
        <ChevronDownIcon
          className={`ml-auto h-4 w-4 text-(--color-text-tertiary) transition-transform sm:hidden ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* 투표 수치 */}
      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-(--color-text-tertiary)">
        <span>
          찬성 <strong className="text-(--color-vote-yes)">{counts.yes}</strong>
        </span>
        <span>
          반대 <strong className="text-(--color-vote-no)">{counts.no}</strong>
        </span>
        <span>
          기권 <strong className="text-(--color-vote-abstain)">{counts.abstain}</strong>
        </span>
        <span>
          불참 <strong className="text-(--color-vote-absent)">{counts.absent}</strong>
        </span>
      </div>

      {/* 스택 바 */}
      <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-(--color-bg-tertiary)">
        {total > 0 && (
          <>
            {counts.yes > 0 && (
              <div
                className="bg-(--color-vote-yes)"
                style={{ width: `${(counts.yes / total) * 100}%` }}
              />
            )}
            {counts.no > 0 && (
              <div
                className="bg-(--color-vote-no)"
                style={{ width: `${(counts.no / total) * 100}%` }}
              />
            )}
            {counts.abstain > 0 && (
              <div
                className="bg-(--color-vote-abstain)"
                style={{ width: `${(counts.abstain / total) * 100}%` }}
              />
            )}
            {counts.absent > 0 && (
              <div
                className="bg-(--color-vote-absent)"
                style={{ width: `${(counts.absent / total) * 100}%` }}
              />
            )}
          </>
        )}
      </div>

      {/* 멤버 그리드 — 모바일에서 접힘 가능 */}
      <div className={`mt-3 ${expanded ? "block" : "hidden"} sm:block`}>
        <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10">
          {sortedMembers.map((m) => (
            <MemberVotePill
              key={m.memberId}
              memberId={m.memberId}
              memberName={m.memberName}
              result={m.result}
              termId={termId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
