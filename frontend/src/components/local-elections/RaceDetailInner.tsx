"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getLocalElectionRace } from "@/lib/api";
import { electionTypeLabel, sidoToShort } from "@/constants/local-elections";
import type { LocalElectionCandidateDetail, LocalElectionType } from "@/types";
import { isElectionMode, isRaceTallied, sortByResult } from "@/lib/local-election-result";
import LocalCandidateCard from "./LocalCandidateCard";
import LocalResultCandidateRow from "./LocalResultCandidateRow";
import RacePollTimeseries from "@/components/polls/RacePollTimeseries";

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

  // 개표 모드: 전역(election.status === "completed") + race별 개표 여부
  const resultMode = isElectionMode(race?.electionStatus);
  const tallied = race ? isRaceTallied(race.candidates) : false;
  const showResults = resultMode && tallied;

  const partyBuckets = useMemo(() => {
    if (!race || !PROPORTIONAL_TYPES.has(race.electionType)) return null;
    return groupByParty(race.candidates);
  }, [race]);

  // 개표 완료 시 비례 외 후보는 득표순(당선자 우선) 정렬
  const orderedCandidates = useMemo(() => {
    if (!race) return [];
    return showResults ? sortByResult(race.candidates) : race.candidates;
  }, [race, showResults]);

  // 개표 결과 요약: 최다 득표(바 정규화 기준)와 1·2위 격차
  const resultSummary = useMemo(() => {
    if (!showResults || orderedCandidates.length === 0) return null;
    const top = orderedCandidates[0];
    const runnerUp = orderedCandidates[1];
    const maxVoteCount = top.voteCount ?? 0;
    const gapRate =
      top.voteRate != null && runnerUp?.voteRate != null ? top.voteRate - runnerUp.voteRate : null;
    const gapVotes =
      top.voteCount != null && runnerUp?.voteCount != null
        ? top.voteCount - runnerUp.voteCount
        : null;
    return { winner: top.isWinner ? top : null, maxVoteCount, gapRate, gapVotes };
  }, [showResults, orderedCandidates]);

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
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-(--color-text-tertiary)">
            {electionTypeLabel(race.electionType)}
          </span>
          {resultMode && (
            <>
              <span aria-hidden="true" className="text-(--color-text-tertiary)">
                ·
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-(--color-text-secondary)">
                <span
                  className={`size-1.5 rounded-full ${showResults ? "bg-(--color-text-secondary)" : "animate-pulse bg-(--color-text-tertiary)"}`}
                  aria-hidden="true"
                />
                {showResults ? "개표 완료" : "개표 진행 중"}
              </span>
            </>
          )}
        </div>
        <h1 className="text-2xl font-bold text-(--color-text-primary)">{race.displayName}</h1>
        <p className="text-sm text-(--color-text-secondary)">
          {isProportional
            ? `${partyBuckets.length}개 정당 · 명부 후보 ${race.candidates.length}명`
            : `후보 ${race.candidates.length}명${race.seatCount > 1 ? ` · ${race.seatCount}석 선출` : ""}`}
        </p>
        {resultMode && !showResults && (
          <p className="text-xs text-(--color-text-tertiary)">
            개표가 진행 중입니다. 득표 결과는 NEC 당선인 정보가 이관되는 대로 자동 반영됩니다.
          </p>
        )}
        {isProportional && !resultMode && (
          <p className="text-xs text-(--color-text-tertiary)">
            정당별 비례대표 명부입니다. 번호는 정당 안에서의 추천순위이며, 사용자는 정당에
            투표합니다.
          </p>
        )}
      </section>

      {/* 개표 결과 — 당선자 헤드라인 한 줄 + 득표율 구분선 리스트 (에디토리얼 톤) */}
      {showResults && !isProportional ? (
        <section className="rounded-lg border border-(--color-border-primary)">
          {/* 당선자 헤드라인 — 상단 정당색 키라인 */}
          {resultSummary?.winner && (
            <div
              className="border-b border-(--color-border-primary) px-4 py-3.5"
              style={{
                boxShadow: `inset 3px 0 0 ${resultSummary.winner.party?.color ?? "var(--color-text-secondary)"}`,
              }}
            >
              <p className="text-xs font-semibold tracking-wide text-(--color-text-tertiary)">
                당선
              </p>
              <p className="mt-0.5 flex items-baseline gap-2">
                <span className="text-lg font-bold text-(--color-text-primary)">
                  {resultSummary.winner.name}
                </span>
                <span className="text-sm text-(--color-text-secondary)">
                  {resultSummary.winner.party?.name ?? "무소속"}
                </span>
                {resultSummary.winner.voteRate != null && (
                  <span className="ml-auto text-lg font-bold text-(--color-text-primary) tabular-nums">
                    {resultSummary.winner.voteRate.toFixed(1)}%
                  </span>
                )}
              </p>
              {resultSummary.gapRate != null && (
                <p className="mt-0.5 text-xs text-(--color-text-tertiary)">
                  2위와 {resultSummary.gapRate.toFixed(1)}%p
                  {resultSummary.gapVotes != null
                    ? ` · ${resultSummary.gapVotes.toLocaleString()}표`
                    : ""}{" "}
                  차이
                </p>
              )}
            </div>
          )}

          {/* 전체 순위 리스트 */}
          <ul className="divide-y divide-(--color-border-primary) px-4">
            {orderedCandidates.map((c, i) => (
              <LocalResultCandidateRow
                key={c.id}
                candidate={c}
                rank={i + 1}
                maxVoteCount={resultSummary?.maxVoteCount ?? 0}
              />
            ))}
          </ul>
        </section>
      ) : isProportional ? (
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
                {(showResults ? sortByResult(bucket.candidates) : bucket.candidates).map((c) => (
                  <LocalCandidateCard
                    key={c.id}
                    candidate={c}
                    year={year}
                    resultMode={showResults}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <section>
          <div className="grid gap-4 sm:grid-cols-2">
            {orderedCandidates.map((c) => (
              <LocalCandidateCard key={c.id} candidate={c} year={year} resultMode={showResults} />
            ))}
          </div>
        </section>
      )}

      {/* 여론조사 시계열 추이 — 개표 완료 후에는 결과가 우선이므로 노출하지 않음 */}
      {!showResults && (
        <div className="border-t border-(--color-border-primary) pt-6">
          <RacePollTimeseries raceId={race.id} />
        </div>
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
