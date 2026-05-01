"use client";

import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getLocalElectionRegion } from "@/lib/api";
import { ELECTION_TYPES, electionTypeLabel } from "@/constants/local-elections";
import type { LocalElectionRaceSummary } from "@/types";
import RaceCard from "./RaceCard";

interface Props {
  year: string;
  electionId: string;
  sido: string;
}

export default function RegionDetailInner({ year, electionId, sido }: Props) {
  const { data } = useCongressSuspenseQuery(getLocalElectionRegion, {
    id: electionId,
    sido,
  });

  if (!data || data.races.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-(--color-text-tertiary)">
        등록된 선거구가 없습니다.
      </p>
    );
  }

  // 유형별로 그룹핑
  const grouped = new Map<string, LocalElectionRaceSummary[]>();
  for (const race of data.races) {
    const list = grouped.get(race.electionType) ?? [];
    list.push(race);
    grouped.set(race.electionType, list);
  }

  return (
    <div className="space-y-8">
      {ELECTION_TYPES.map((t) => {
        const races = grouped.get(t.id);
        if (!races || races.length === 0) return null;

        return (
          <section key={t.id}>
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-lg font-bold text-(--color-text-primary)">
                {electionTypeLabel(t.id)}
              </h2>
              <span className="text-sm text-(--color-text-tertiary)">
                {races.length}개 선거구
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {races.map((race) => (
                <RaceCard key={race.id} race={race} year={year} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
