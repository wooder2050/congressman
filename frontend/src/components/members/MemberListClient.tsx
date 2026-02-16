"use client";

import { useState, useMemo } from "react";
import MemberSearch from "./MemberSearch";
import PartyFilter from "./PartyFilter";
import MemberGrid from "./MemberGrid";
import type { MemberWithTerm, Party } from "@/types";

interface MemberListClientProps {
  members: MemberWithTerm[];
}

export default function MemberListClient({ members }: MemberListClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParty, setSelectedParty] = useState<string | null>(null);

  const parties = useMemo(() => {
    const map = new Map<string, Party>();
    for (const m of members) {
      if (!map.has(m.term.party.id)) {
        map.set(m.term.party.id, m.term.party);
      }
    }
    return Array.from(map.values());
  }, [members]);

  const filtered = useMemo(() => {
    let result = members;
    if (selectedParty) {
      result = result.filter((m) => m.term.party.id === selectedParty);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (m) => m.name.toLowerCase().includes(q) || m.term.district.toLowerCase().includes(q),
      );
    }
    return result;
  }, [members, selectedParty, searchQuery]);

  return (
    <div className="space-y-4">
      <MemberSearch value={searchQuery} onChange={setSearchQuery} />
      <PartyFilter parties={parties} selected={selectedParty} onChange={setSelectedParty} />
      <p className="text-sm text-(--color-text-tertiary)">총 {filtered.length}명</p>
      <MemberGrid key={`${selectedParty ?? "all"}-${searchQuery}`} members={filtered} />
    </div>
  );
}
