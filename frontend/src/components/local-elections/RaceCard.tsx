import Link from "next/link";
import type { LocalElectionRaceSummary } from "@/types";
import { electionTypeLabel } from "@/constants/local-elections";

interface Props {
  race: LocalElectionRaceSummary;
  year: string;
}

export default function RaceCard({ race, year }: Props) {
  return (
    <Link
      href={`/local-elections/${year}/races/${race.id}`}
      className="block rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 transition-colors hover:border-(--color-primary) hover:bg-(--color-bg-secondary)"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="mb-1 inline-block rounded bg-(--color-bg-tertiary) px-1.5 py-0.5 text-[11px] font-medium text-(--color-text-tertiary)">
            {electionTypeLabel(race.electionType)}
          </span>
          <h3 className="truncate text-sm font-bold text-(--color-text-primary)">
            {race.displayName}
          </h3>
        </div>
        {race.candidateCount > 0 ? (
          <span className="shrink-0 text-xs text-(--color-text-tertiary)">
            {race.candidateCount}명
          </span>
        ) : (
          <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            등록 전
          </span>
        )}
      </div>

      {race.topCandidates.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {race.topCandidates.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: c.party?.color ? `${c.party.color}18` : "var(--color-bg-tertiary)",
                color: c.party?.color ?? "var(--color-text-secondary)",
              }}
            >
              {c.candidateNumber != null && <span className="font-bold">{c.candidateNumber}</span>}
              {c.name}
            </span>
          ))}
          {race.candidateCount > race.topCandidates.length && (
            <span className="text-xs text-(--color-text-tertiary)">
              외 {race.candidateCount - race.topCandidates.length}명
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
