"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { MEMBER_VOTE_RESULT_MAP } from "@/lib/constants";
import PartyVoteGroup from "./PartyVoteGroup";
import type { VoteMemberResult, MemberVoteResult } from "@/types";

interface PartyVoteGridProps {
  memberVotes: VoteMemberResult[];
  termId: number;
}

const resultFilters: { id: MemberVoteResult | "all"; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "yes", label: "찬성" },
  { id: "no", label: "반대" },
  { id: "abstain", label: "기권" },
  { id: "absent", label: "불참" },
];

const legendItems = Object.entries(MEMBER_VOTE_RESULT_MAP).map(([key, info]) => ({
  key: key as MemberVoteResult,
  ...info,
}));

export default function PartyVoteGrid({ memberVotes, termId }: PartyVoteGridProps) {
  const [selectedFilter, setSelectedFilter] = useState<MemberVoteResult | "all">("all");

  const partyGroups = useMemo(() => {
    const groupMap = new Map<
      string,
      { partyName: string; partyColor: string; members: VoteMemberResult[] }
    >();

    for (const mv of memberVotes) {
      if (!groupMap.has(mv.partyName)) {
        groupMap.set(mv.partyName, {
          partyName: mv.partyName,
          partyColor: mv.partyColor,
          members: [],
        });
      }
      groupMap.get(mv.partyName)!.members.push(mv);
    }

    return Array.from(groupMap.values()).sort((a, b) => b.members.length - a.members.length);
  }, [memberVotes]);

  const filteredGroups = useMemo(() => {
    if (selectedFilter === "all") return partyGroups;
    return partyGroups
      .map((g) => ({
        ...g,
        members: g.members.filter((m) => m.result === selectedFilter),
      }))
      .filter((g) => g.members.length > 0);
  }, [partyGroups, selectedFilter]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">정당별 투표 현황</h2>

      {/* 필터 + 범례 */}
      <div className="flex flex-wrap items-center gap-2">
        {resultFilters.map((opt) => (
          <Button
            key={opt.id}
            variant={selectedFilter === opt.id ? "chipActive" : "chip"}
            size="sm"
            onClick={() => setSelectedFilter(opt.id)}
            className="rounded-full px-4 text-sm font-semibold"
          >
            {opt.label}
            {opt.id !== "all" && (
              <span className="ml-1 opacity-60">
                {memberVotes.filter((mv) => mv.result === opt.id).length}
              </span>
            )}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-(--color-text-tertiary)">
        {legendItems.map((item) => (
          <span key={item.key} className="flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </span>
        ))}
      </div>

      {/* 정당 그룹 */}
      <div className="space-y-3">
        {filteredGroups.map((group, index) => (
          <PartyVoteGroup
            key={group.partyName}
            partyName={group.partyName}
            partyColor={group.partyColor}
            members={group.members}
            termId={termId}
            defaultExpanded={index < 2}
          />
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <p className="py-8 text-center text-sm text-(--color-text-tertiary)">
          해당 투표 결과가 없습니다.
        </p>
      )}
    </div>
  );
}
