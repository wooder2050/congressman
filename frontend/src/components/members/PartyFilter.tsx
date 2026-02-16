"use client";

import { Button } from "@/components/ui/button";
import { getContrastColor } from "@/lib/utils";
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
        variant={selected === null ? "default" : "outline"}
        size="sm"
        onClick={() => onChange(null)}
        className="rounded-full px-4 text-sm font-semibold"
      >
        전체
      </Button>
      {parties.map((party) => (
        <Button
          key={party.id}
          variant={selected === party.id ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(party.id)}
          className="rounded-full px-4 text-sm font-semibold"
          style={selected === party.id ? { backgroundColor: party.color } : undefined}
        >
          <span
            className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[0.625rem] leading-none font-bold"
            style={{
              backgroundColor: party.color,
              color: getContrastColor(party.color),
            }}
          >
            {party.shortName[0]}
          </span>
          {party.shortName}
        </Button>
      ))}
    </div>
  );
}
