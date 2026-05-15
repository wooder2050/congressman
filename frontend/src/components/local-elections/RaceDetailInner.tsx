"use client";

import Link from "next/link";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getLocalElectionRace } from "@/lib/api";
import { electionTypeLabel, sidoToShort } from "@/constants/local-elections";
import LocalCandidateCard from "./LocalCandidateCard";

interface Props {
  electionId: string;
  raceId: number;
}

/** electionId "local-2026" → "2026" */
function parseYear(electionId: string): string {
  return electionId.replace(/^local-/, "");
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

  const year = parseYear(electionId);
  const sidoShort = sidoToShort(race.sido);
  const regionHref = race.sido
    ? `/local-elections/${year}/regions/${encodeURIComponent(race.sido)}${
        race.sigungu ? `?sigungu=${encodeURIComponent(race.sigungu)}` : ""
      }`
    : `/local-elections/${year}`;

  return (
    <div className="space-y-6">
      {/* Breadcrumb — 사용자가 한 단계 위(시도)·두 단계 위(메인)로 돌아갈 수 있도록 */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-xs text-(--color-text-tertiary)"
      >
        <Link
          href={`/local-elections/${year}`}
          className="hover:text-(--color-primary) hover:underline"
        >
          제9회 전국동시지방선거
        </Link>
        {race.sido && (
          <>
            <span aria-hidden="true">›</span>
            <Link href={regionHref} className="hover:text-(--color-primary) hover:underline">
              {sidoShort}
              {race.sigungu ? ` · ${race.sigungu}` : ""}
            </Link>
          </>
        )}
        <span aria-hidden="true">›</span>
        <span className="text-(--color-text-secondary)">{race.displayName}</span>
      </nav>

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

      {/* 시도 페이지로 돌아가기 — 모바일에서 페이지 하단 액션으로도 노출 */}
      <section className="border-t border-(--color-border-primary) pt-4">
        <Link
          href={regionHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-(--color-primary) hover:underline"
        >
          ← {sidoShort}
          {race.sigungu ? ` ${race.sigungu}` : ""} 선거구 목록으로 돌아가기
        </Link>
      </section>
    </div>
  );
}
