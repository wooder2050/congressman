"use client";

import { useState } from "react";
import { useCongressQuery } from "@/hooks/useCongressQuery";
import { getExitPoll, type ExitPollScope, type ExitPollRace } from "@/lib/exit-poll";

/**
 * 출구조사 예측 결과 — Supabase `ExitPoll`을 직접 조회해 표시한다.
 *
 * 투표 마감(6/3 18시) 직후 발표되는 방송사 출구조사 예측치를 레이스별 카드로
 * 보여준다. 출처(방송3사 공동 / JTBC 등)가 여러 개면 상단 탭으로 전환하고,
 * 하나뿐이면 탭을 숨긴다. 데이터가 없으면(아직 미발표) 렌더하지 않아 자연히
 * 숨겨지며, SQL UPSERT만으로 배포 없이 갱신된다. 60초마다 자동 재조회한다.
 *
 * 출구조사는 18시 이후에만 의미가 있으므로 그 전에는 표시하지 않는다.
 */

const SHOW_AFTER = new Date(2026, 5, 3, 18, 0, 0); // 6/3 18시 투표 마감

interface Props {
  scope: ExitPollScope;
  /** 섹션 제목 (예: "시도지사 출구조사") */
  title: string;
  /** 기본 노출할 레이스 수 (나머지는 "더 보기"로 펼침) */
  initialCount?: number;
}

function formatRate(low: number, high: number): string {
  if (Math.abs(low - high) < 0.05) return `${low.toFixed(1)}%`;
  return `${low.toFixed(1)}~${high.toFixed(1)}%`;
}

function RaceCard({ race }: { race: ExitPollRace }) {
  // 막대 길이 기준은 레이스 내 최고 예측치
  const max = Math.max(...race.candidates.map((c) => c.rateHigh), 1);

  return (
    <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 sm:p-5">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-bold text-(--color-text-primary)">{race.raceLabel}</h3>
        {race.region && (
          <span className="rounded bg-(--color-bg-tertiary) px-1.5 py-0.5 text-[10px] font-medium text-(--color-text-tertiary)">
            {race.region}
          </span>
        )}
      </div>

      <ul className="space-y-2.5">
        {race.candidates.map((c) => {
          const width = (c.rateHigh / max) * 100;
          return (
            <li key={c.candidate}>
              <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: c.partyColor }}
                    role="img"
                    aria-label={c.party || "무소속"}
                  />
                  <span className="truncate font-semibold text-(--color-text-primary)">
                    {c.candidate}
                  </span>
                  {c.party && (
                    <span className="shrink-0 text-(--color-text-tertiary)">{c.party}</span>
                  )}
                  {c.isLeading && (
                    <span className="shrink-0 rounded bg-(--color-primary)/10 px-1.5 py-0.5 text-[10px] font-bold text-(--color-primary)">
                      유력
                    </span>
                  )}
                </div>
                <span className="shrink-0 font-bold text-(--color-text-primary)">
                  {formatRate(c.rateLow, c.rateHigh)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-(--color-bg-tertiary)">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{ width: `${width}%`, backgroundColor: c.partyColor }}
                />
              </div>
              {c.note && (
                <p className="mt-0.5 text-[10px] text-(--color-text-tertiary)">{c.note}</p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function ExitPollSection({ scope, title, initialCount = 6 }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [activeSource, setActiveSource] = useState(0);
  const { data: sources } = useCongressQuery(getExitPoll, scope, {
    staleTime: 0,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  if (new Date() < SHOW_AFTER) return null;
  if (!sources || sources.length === 0) return null;

  // 폴링으로 출처 수가 줄어들 수 있으니 인덱스를 클램프
  const idx = Math.min(activeSource, sources.length - 1);
  const current = sources[idx];
  const races = current.races;
  if (races.length === 0) return null;

  const hasTabs = sources.length > 1;
  const asOf = races[0]?.asOf || "";
  const visible = expanded ? races : races.slice(0, initialCount);
  const hasMore = races.length > initialCount;

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-(--color-primary) px-2 py-0.5 text-xs font-bold text-white">
            출구조사
          </span>
          <h2 className="text-base font-bold text-(--color-text-primary)">{title}</h2>
        </div>
        {asOf && <span className="text-xs text-(--color-text-tertiary)">{asOf}</span>}
      </div>

      {/* 출처 탭 — 출처가 둘 이상일 때만 */}
      {hasTabs && (
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label={`${title} 출처 선택`}>
          {sources.map((s, i) => {
            const selected = i === idx;
            return (
              <button
                key={s.source}
                role="tab"
                aria-selected={selected}
                onClick={() => {
                  setActiveSource(i);
                  setExpanded(false);
                }}
                className={
                  selected
                    ? "rounded-full bg-(--color-primary) px-3 py-1 text-xs font-bold text-white"
                    : "rounded-full border border-(--color-border-primary) px-3 py-1 text-xs font-medium text-(--color-text-secondary) transition-colors hover:bg-(--color-bg-hover)"
                }
              >
                {s.source}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {visible.map((race) => (
          <RaceCard key={race.raceKey} race={race} />
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full rounded-lg border border-(--color-border-primary) py-2 text-xs font-medium text-(--color-text-secondary) transition-colors hover:bg-(--color-bg-hover)"
        >
          {expanded ? "접기" : `전체 ${races.length}곳 보기`}
        </button>
      )}

      <p className="text-[10px] text-(--color-text-tertiary)">
        {hasTabs
          ? "방송사별 출구조사 예측치이며 실제 개표 결과와 다를 수 있습니다."
          : "지상파 방송 3사(KBS·MBC·SBS) 공동 출구조사 예측치이며 실제 개표 결과와 다를 수 있습니다."}
      </p>
    </section>
  );
}
