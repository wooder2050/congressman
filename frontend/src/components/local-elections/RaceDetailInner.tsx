"use client";

import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getLocalElectionRace } from "@/lib/api";
import { electionTypeLabel } from "@/constants/local-elections";
import LocalCandidateCard from "./LocalCandidateCard";

interface Props {
  electionId: string;
  raceId: number;
}

export default function RaceDetailInner({ electionId, raceId }: Props) {
  const { data: race } = useCongressSuspenseQuery(getLocalElectionRace, {
    id: electionId,
    raceId,
  });

  if (!race) {
    return (
      <div className="py-12 text-center text-(--color-text-tertiary)">
        선거구 정보를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <section className="space-y-2">
        <span className="inline-block rounded bg-(--color-bg-tertiary) px-2 py-0.5 text-xs font-medium text-(--color-text-tertiary)">
          {electionTypeLabel(race.electionType)}
        </span>
        <h1 className="text-2xl font-bold text-(--color-text-primary)">{race.displayName}</h1>
        <p className="text-sm text-(--color-text-secondary)">
          후보 {race.candidates.length}명{race.seatCount > 1 && ` · ${race.seatCount}석 선출`}
        </p>
      </section>

      {/* 후보자 목록 */}
      <section>
        <div className="grid gap-4 sm:grid-cols-2">
          {race.candidates.map((c) => (
            <LocalCandidateCard key={c.id} candidate={c} />
          ))}
        </div>
      </section>
    </div>
  );
}
