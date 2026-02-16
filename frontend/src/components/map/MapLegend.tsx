"use client";

import { useMemo } from "react";
import { PARTIES } from "@/lib/constants";
import type { MemberWithTerm } from "@/types";

interface MapLegendProps {
  members: MemberWithTerm[];
}

export default function MapLegend({ members }: MapLegendProps) {
  const partyStats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of members) {
      if (m.term.proportional) continue;
      const partyId = m.term.party.id;
      counts[partyId] = (counts[partyId] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([id, count]) => ({
        id,
        name: PARTIES[id]?.shortName ?? id,
        color: PARTIES[id]?.color ?? "#D1D5DB",
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [members]);

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-(--color-border-primary) px-4 py-3">
      {partyStats.map((party) => (
        <div key={party.id} className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: party.color }}
          />
          <span className="text-xs text-(--color-text-secondary)">
            {party.name} {party.count}
          </span>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <span className="inline-block h-3 w-3 rounded-full bg-[#D1D5DB]" />
        <span className="text-xs text-(--color-text-secondary)">공석</span>
      </div>
    </div>
  );
}
