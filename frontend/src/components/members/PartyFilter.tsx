"use client";

import type { Party } from "@/types";

interface PartyFilterProps {
  parties: Party[];
  selected: string | null;
  onChange: (partyId: string | null) => void;
}

export default function PartyFilter({ parties, selected, onChange }: PartyFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
          selected === null
            ? "bg-(--color-primary) text-(--color-text-inverse)"
            : "bg-(--color-bg-secondary) text-(--color-text-secondary)"
        }`}
      >
        전체
      </button>
      {parties.map((party) => (
        <button
          key={party.id}
          onClick={() => onChange(party.id)}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            selected === party.id
              ? "text-(--color-text-inverse)"
              : "bg-(--color-bg-secondary) text-(--color-text-secondary)"
          }`}
          style={selected === party.id ? { backgroundColor: party.color } : undefined}
        >
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: party.color }}
          />
          {party.shortName}
        </button>
      ))}
    </div>
  );
}
