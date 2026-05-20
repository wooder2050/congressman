"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getLocalElectionRace } from "@/lib/api";
import { electionTypeLabel, sidoToShort } from "@/constants/local-elections";
import type { LocalElectionCandidateDetail, LocalElectionType } from "@/types";
import LocalCandidateCard from "./LocalCandidateCard";

interface Props {
  electionId: string;
  raceId: number;
}

/** electionId "local-2026" → "2026" */
function parseYear(electionId: string): string {
  return electionId.replace(/^local-/, "");
}

const PROPORTIONAL_TYPES = new Set<LocalElectionType>(["metro-proportional", "local-proportional"]);

interface PartyBucket {
  partyId: string;
  partyName: string;
  partyShortName: string;
  partyColor: string;
  candidates: LocalElectionCandidateDetail[];
}

function groupByParty(candidates: LocalElectionCandidateDetail[]): PartyBucket[] {
  const map = new Map<string, PartyBucket>();
  for (const c of candidates) {
    const id = c.party?.id ?? "independent";
    const existing = map.get(id);
    if (existing) {
      existing.candidates.push(c);
    } else {
      map.set(id, {
        partyId: id,
        partyName: c.party?.name ?? "무소속",
        partyShortName: c.party?.shortName ?? c.party?.name ?? "무소속",
        partyColor: c.party?.color ?? "#999999",
        candidates: [c],
      });
    }
  }
  // 정당별로 추천순위(candidateNumber) 오름차순 정렬, 그룹은 후보 수 내림차순
  for (const bucket of map.values()) {
    bucket.candidates.sort((a, b) => {
      const an = a.candidateNumber ?? 999;
      const bn = b.candidateNumber ?? 999;
      if (an !== bn) return an - bn;
      return a.name.localeCompare(b.name, "ko");
    });
  }
  return Array.from(map.values()).sort((a, b) => b.candidates.length - a.candidates.length);
}

export default function RaceDetailInner({ electionId, raceId }: Props) {
  const { data: race } = useCongressSuspenseQuery(getLocalElectionRace, {
    id: electionId,
    raceId,
  });

  const partyBuckets = useMemo(() => {
    if (!race || !PROPORTIONAL_TYPES.has(race.electionType)) return null;
    return groupByParty(race.candidates);
  }, [race]);

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
  const isProportional = partyBuckets !== null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb — 사용자가 한 단계 위(시도)·두 단계 위(메인)로 돌아갈 수 있도록 */}
      {/* inline 렌더링: flex로 묶으면 [구분자+텍스트] 단위가 wrap되며 구분자가 다음 줄 앞에 떨어져 어색해진다. */}
      <nav aria-label="Breadcrumb" className="text-xs leading-relaxed text-(--color-text-tertiary)">
        <Link
          href={`/local-elections/${year}`}
          className="hover:text-(--color-primary) hover:underline"
        >
          제9회 전국동시지방선거
        </Link>
        {race.sido && (
          <>
            <span aria-hidden="true" className="mx-1.5">
              ›
            </span>
            <Link href={regionHref} className="hover:text-(--color-primary) hover:underline">
              {sidoShort}
              {race.sigungu ? ` · ${race.sigungu}` : ""}
            </Link>
          </>
        )}
        <span aria-hidden="true" className="mx-1.5">
          ›
        </span>
        <span className="text-(--color-text-secondary)">{race.displayName}</span>
      </nav>

      {/* 헤더 */}
      <section className="space-y-2">
        <span className="inline-block rounded bg-(--color-bg-tertiary) px-2 py-0.5 text-xs font-medium text-(--color-text-tertiary)">
          {electionTypeLabel(race.electionType)}
        </span>
        <h1 className="text-2xl font-bold text-(--color-text-primary)">{race.displayName}</h1>
        <p className="text-sm text-(--color-text-secondary)">
          {isProportional
            ? `${partyBuckets.length}개 정당 · 명부 후보 ${race.candidates.length}명`
            : `후보 ${race.candidates.length}명${race.seatCount > 1 ? ` · ${race.seatCount}석 선출` : ""}`}
        </p>
        {isProportional && (
          <p className="text-xs text-(--color-text-tertiary)">
            정당별 비례대표 명부입니다. 번호는 정당 안에서의 추천순위이며, 사용자는 정당에
            투표합니다.
          </p>
        )}
      </section>

      {/* 후보자 목록 */}
      {isProportional ? (
        <div className="space-y-6">
          {partyBuckets.map((bucket) => (
            <section
              key={bucket.partyId}
              className="overflow-hidden rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary)"
            >
              <header
                className="flex items-center gap-2 border-b border-(--color-border-primary) px-4 py-3"
                style={{ borderLeft: `4px solid ${bucket.partyColor}` }}
              >
                <h2 className="text-base font-bold text-(--color-text-primary)">
                  {bucket.partyName}
                </h2>
                <span className="text-xs text-(--color-text-tertiary)">
                  명부 {bucket.candidates.length}명
                </span>
              </header>
              <div className="grid gap-3 p-4 sm:grid-cols-2">
                {bucket.candidates.map((c) => (
                  <LocalCandidateCard key={c.id} candidate={c} year={year} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <section>
          <div className="grid gap-4 sm:grid-cols-2">
            {race.candidates.map((c) => (
              <LocalCandidateCard key={c.id} candidate={c} year={year} />
            ))}
          </div>
        </section>
      )}

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
