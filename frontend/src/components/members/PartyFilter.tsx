"use client";

import { Button } from "@/components/ui/button";
import type { Party } from "@/types";

interface PartyFilterProps {
  parties: Party[];
  selected: string | null;
  onChange: (partyId: string | null) => void;
}

export default function PartyFilter({ parties, selected, onChange }: PartyFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selected === null ? "default" : "secondary"}
        size="sm"
        onClick={() => onChange(null)}
        className="rounded-full px-4 text-sm font-semibold"
      >
        전체
      </Button>
      {parties.map((party) => (
        <Button
          key={party.id}
          variant={selected === party.id ? "default" : "secondary"}
          size="sm"
          onClick={() => onChange(party.id)}
          className="rounded-full px-4 text-sm font-semibold"
          style={selected === party.id ? { backgroundColor: party.color } : undefined}
        >
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: party.color }}
          />
          {party.shortName}
        </Button>
      ))}
    </div>
  );
}
