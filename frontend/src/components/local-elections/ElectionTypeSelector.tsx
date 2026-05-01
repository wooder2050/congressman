"use client";

import type { LocalElectionType } from "@/types";
import { ELECTION_TYPES } from "@/constants/local-elections";

interface Props {
  selected: LocalElectionType | null;
  onChange: (type: LocalElectionType | null) => void;
  raceCounts?: Record<string, number>;
}

export default function ElectionTypeSelector({ selected, onChange, raceCounts }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
          selected === null
            ? "bg-(--color-primary) text-(--color-text-inverse)"
            : "bg-(--color-bg-secondary) text-(--color-text-secondary) hover:bg-(--color-bg-tertiary)"
        }`}
      >
        전체
      </button>
      {ELECTION_TYPES.map((t) => {
        const count = raceCounts?.[t.id];
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              selected === t.id
                ? "bg-(--color-primary) text-(--color-text-inverse)"
                : "bg-(--color-bg-secondary) text-(--color-text-secondary) hover:bg-(--color-bg-tertiary)"
            }`}
          >
            {t.label}
            {count != null && count > 0 && <span className="ml-1 text-xs opacity-70">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
