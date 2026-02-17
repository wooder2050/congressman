"use client";

import { useState, useMemo } from "react";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getMembers } from "@/lib/api";
import { Button } from "@/components/ui/button";
import MemberSearch from "./MemberSearch";
import PartyFilter from "./PartyFilter";
import MemberGrid from "./MemberGrid";
import type { Party } from "@/types";

interface MemberListInnerProps {
  termId: number;
}

export default function MemberListInner({ termId }: MemberListInnerProps) {
  const { data: members } = useCongressSuspenseQuery(getMembers, termId);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const [selectedCommittee, setSelectedCommittee] = useState<string | null>(null);

  const parties = useMemo(() => {
    const map = new Map<string, Party>();
    for (const m of members) {
      if (!map.has(m.term.party.id)) {
        map.set(m.term.party.id, m.term.party);
      }
    }
    return Array.from(map.values());
  }, [members]);

  const committees = useMemo(() => {
    const countMap = new Map<string, number>();
    for (const m of members) {
      for (const c of m.term.committees) {
        if (!c.includes("특별위원회")) {
          countMap.set(c, (countMap.get(c) || 0) + 1);
        }
      }
    }
    return Array.from(countMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [members]);

  const filtered = useMemo(() => {
    let result = members;
    if (selectedParty) {
      result = result.filter((m) => m.term.party.id === selectedParty);
    }
    if (selectedCommittee) {
      result = result.filter((m) => m.term.committees.includes(selectedCommittee));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (m) => m.name.toLowerCase().includes(q) || m.term.district.toLowerCase().includes(q),
      );
    }
    return result;
  }, [members, selectedParty, selectedCommittee, searchQuery]);

  return (
    <div className="space-y-4">
      <MemberSearch value={searchQuery} onChange={setSearchQuery} />
      <PartyFilter parties={parties} selected={selectedParty} onChange={setSelectedParty} />

      {/* 위원회 필터 */}
      <div className="scrollbar-none flex gap-1.5 overflow-x-auto">
        <Button
          variant={selectedCommittee === null ? "chipActive" : "chip"}
          size="xs"
          onClick={() => setSelectedCommittee(null)}
          className="shrink-0 rounded-full px-3 text-xs font-semibold"
        >
          전체
        </Button>
        {committees.map((c) => (
          <Button
            key={c.name}
            variant={selectedCommittee === c.name ? "chipActive" : "chip"}
            size="xs"
            onClick={() => setSelectedCommittee(c.name)}
            className="shrink-0 rounded-full px-3 text-xs font-semibold"
          >
            {c.name.replace("위원회", "")}
          </Button>
        ))}
      </div>

      <p className="text-sm text-(--color-text-tertiary)">총 {filtered.length}명</p>
      <MemberGrid
        key={`${selectedParty ?? "all"}-${selectedCommittee ?? "all"}-${searchQuery}`}
        members={filtered}
      />
    </div>
  );
}
