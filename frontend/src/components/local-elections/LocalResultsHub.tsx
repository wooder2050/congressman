"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCongressQuery, useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getElection, getLocalElection, getLocalElectionRaces } from "@/lib/api";
import type { LocalElectionRaceSummary, LocalElectionType } from "@/types";
import { SIDO_LIST } from "@/constants/local-elections";
import LiveTurnoutBanner from "@/components/elections/LiveTurnoutBanner";
import ExitPollSection from "@/components/elections/ExitPollSection";
import ByElectionResults from "@/components/elections/ByElectionResults";
import LocalResultSummary from "./LocalResultSummary";
import LocalRaceResults from "./LocalRaceResults";

// 개표 데이터가 없는(또는 비례·의원) 유형은 상세 페이지로 — 바로가기
const OTHER_TYPES = [
  { route: "metro-council", label: "광역의원" },
  { route: "local-council", label: "기초의원" },
  { route: "metro-proportional", label: "광역 비례" },
  { route: "local-proportional", label: "기초 비례" },
];

type TabId = "governor" | "mayor" | "by-election";

/** 폴링 공통 옵션 — 60초마다 갱신, 항상 fresh */
const POLL = { staleTime: 0, refetchInterval: 60_000, refetchOnWindowFocus: true } as const;

function useRaces(electionId: string, type: LocalElectionType, limit: number) {
  return useCongressQuery(getLocalElectionRaces, { id: electionId, type, limit }, POLL);
}

/** 탭 라벨의 "개표 N곳" 뱃지용 — 득표 들어온 race 수 */
function talliedCount(races?: LocalElectionRaceSummary[]): number {
  if (!races) return 0;
  return races.filter((r) => r.topCandidates.some((c) => c.voteCount != null)).length;
}

/** 시도지사 (광역단체장) — 교육감은 개표 수집 대상이 아니라 제외 */
function GovernorTab({ electionId }: { electionId: string }) {
  const { data } = useRaces(electionId, "governor", 30);

  if (!data || talliedCount(data.races) === 0) return <EmptyState />;

  return <LocalRaceResults electionId={electionId} title="시도지사 개표" races={data.races} />;
}

/** 기초단체장 — 시도별 필터(기본 전체) */
function MayorTab({ electionId }: { electionId: string }) {
  const { data } = useRaces(electionId, "mayor", 300);
  const [sido, setSido] = useState<string>("");

  const races = useMemo(() => data?.races ?? [], [data]);
  // 데이터에 실제로 존재하는 시도만, SIDO_LIST 순서로 필터 칩 구성 (칩은 short, 매칭은 full id)
  const sidoChips = useMemo(() => {
    const present = new Set(races.map((r) => r.sido));
    return SIDO_LIST.filter((s) => present.has(s.id));
  }, [races]);

  const filtered = sido ? races.filter((r) => r.sido === sido) : races;
  const selectedShort = SIDO_LIST.find((s) => s.id === sido)?.short;

  if (talliedCount(races) === 0) return <EmptyState />;

  return (
    <div className="space-y-3">
      {/* 시도 필터 — 처음엔 "전체" 선택 */}
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="시도별 필터">
        <FilterChip label="전체" selected={sido === ""} onClick={() => setSido("")} />
        {sidoChips.map((s) => (
          <FilterChip
            key={s.id}
            label={s.short}
            selected={sido === s.id}
            onClick={() => setSido(s.id)}
          />
        ))}
      </div>
      <LocalRaceResults
        electionId={electionId}
        title={selectedShort ? `${selectedShort} 기초단체장 개표` : "기초단체장 개표"}
        races={filtered}
      />
    </div>
  );
}

/** 국회의원 재보궐 — 기존 ByElectionResults 재사용 */
function ByElectionTab() {
  const { data } = useCongressQuery(getElection, "2026-06-03", POLL);
  const tallied =
    data?.districts.some((d) => d.candidates.some((c) => c.voteCount != null)) ?? false;

  if (!data || !tallied) return <EmptyState />;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-(--color-text-primary)">
          국회의원 재보궐선거 개표
        </h2>
        <Link
          href="/elections/2026-06-03"
          className="text-sm text-(--color-primary) hover:underline"
        >
          전체 보기 →
        </Link>
      </div>
      <ByElectionResults districts={data.districts} />
    </section>
  );
}

function FilterChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={
        selected
          ? "rounded-full bg-(--color-primary) px-3 py-1 text-xs font-bold text-white"
          : "rounded-full border border-(--color-border-primary) px-3 py-1 text-xs font-medium text-(--color-text-secondary) transition-colors hover:bg-(--color-bg-hover)"
      }
    >
      {label}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) py-10 text-center text-sm text-(--color-text-tertiary)">
      아직 개표가 시작되지 않았습니다. 개표가 진행되면 자동으로 표시됩니다.
    </div>
  );
}

export default function LocalResultsHub({ year }: { year: string }) {
  const { data: election } = useCongressSuspenseQuery(getLocalElection, `local-${year}`);
  const [tab, setTab] = useState<TabId>("governor");

  if (!election) {
    return (
      <div className="py-12 text-center text-(--color-text-tertiary)">
        선거 정보를 찾을 수 없습니다.
      </div>
    );
  }

  const TABS: { id: TabId; label: string }[] = [
    { id: "governor", label: "시도지사" },
    { id: "mayor", label: "기초단체장" },
    { id: "by-election", label: "재보궐선거" },
  ];

  return (
    <div className="space-y-8">
      {/* 실시간/최종 투표율 — Supabase ElectionTurnout 직접 조회(데이터 있을 때만 노출, 마감 여부는 배너가 자동 판단) */}
      <LiveTurnoutBanner scope="local" scopeLabel="6·3 지방선거" />

      {/* 출구조사 — 18시 마감 직후 방송 3사 공동 출구조사(18시 전 자동 숨김) */}
      <ExitPollSection scope="governor" title="시도지사 출구조사" />

      {/* 정당별 당선 수 요약 — 당선 확정이 들어오면 노출 */}
      <LocalResultSummary electionId={election.id} />

      {/* 개표 결과 탭 */}
      <div className="space-y-4">
        <div
          className="flex gap-1.5 overflow-x-auto"
          role="tablist"
          aria-label="개표 결과 선거 종류"
        >
          {TABS.map((t) => {
            const selected = tab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(t.id)}
                className={
                  selected
                    ? "shrink-0 rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-bold text-white"
                    : "shrink-0 rounded-lg border border-(--color-border-primary) px-4 py-2 text-sm font-medium text-(--color-text-secondary) transition-colors hover:bg-(--color-bg-hover)"
                }
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === "governor" && <GovernorTab electionId={election.id} />}
        {tab === "mayor" && <MayorTab electionId={election.id} />}
        {tab === "by-election" && <ByElectionTab />}
      </div>

      {/* 광역의원·기초의원·비례 — 선거구가 많아 유형 페이지에서 상세 확인 */}
      <section>
        <h2 className="mb-3 text-base font-bold text-(--color-text-primary)">
          광역·기초의원 / 비례대표
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {OTHER_TYPES.map((t) => (
            <Link
              key={t.route}
              href={`/local-elections/${year}/${t.route}`}
              className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) px-4 py-3 text-center text-sm font-medium text-(--color-text-secondary) transition-colors hover:border-(--color-primary) hover:bg-(--color-bg-secondary)"
            >
              {t.label}
            </Link>
          ))}
        </div>
      </section>

      <div className="text-center">
        <Link
          href={`/local-elections/${year}`}
          className="text-sm text-(--color-primary) hover:underline"
        >
          ← 지방선거 메인으로
        </Link>
      </div>
    </div>
  );
}
