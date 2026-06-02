"use client";

import { useState } from "react";

/**
 * 사전투표율 요약 배너 — 지방선거/재보궐 랜딩 최상단에 노출한다.
 *
 * 기본은 전체 사전투표율만 접힌 상태로 보여주고, 지역별 수치가 있으면
 * "지역별 보기"를 펼쳐 시·도별 막대를 노출한다.
 *
 * 사전투표(5/29~30)는 이미 종료돼 최종 수치가 확정된 정적 콘텐츠다.
 * 본투표 종료(6/3 18시) 이후에는 의미가 옅어지므로 자동으로 숨긴다.
 */

const HIDE_AFTER = new Date(2026, 5, 3, 18, 0, 0); // 6/3 18시 본투표 종료

interface RegionTurnout {
  region: string;
  rate: number;
}

interface Props {
  /** 최종 사전투표율 (%) */
  rate: number;
  /** 직전 동종 선거 대비 증감 설명 */
  comparison: string;
  /** 보조 설명 (참여 인원 등) */
  detail: string;
  /** 상·하위 지역 막대 (선택) */
  regions?: RegionTurnout[];
  /** 라벨 (예: "지방선거" / "재보궐선거 14곳") */
  scopeLabel: string;
}

export default function EarlyVoteTurnoutBanner({
  rate,
  comparison,
  detail,
  regions,
  scopeLabel,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  if (new Date() > HIDE_AFTER) return null;

  const hasRegions = regions != null && regions.length > 0;
  const max = hasRegions ? Math.max(...regions.map((r) => r.rate)) : 1;

  return (
    <section className="overflow-hidden rounded-xl border border-(--color-primary) bg-blue-50 dark:bg-blue-950/30">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-(--color-primary)/30 px-4 py-2.5 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-(--color-primary) px-2 py-0.5 text-xs font-bold text-white">
            사전투표 종료
          </span>
          <h2 className="text-sm font-bold text-(--color-text-primary)">{scopeLabel} 사전투표율</h2>
        </div>
        <span className="text-xs font-medium text-(--color-text-tertiary)">본투표 6/3(수)</span>
      </div>

      <div className="flex flex-wrap items-end gap-x-4 gap-y-1 px-4 py-3 sm:px-5">
        <span className="text-3xl font-extrabold text-(--color-primary) sm:text-4xl">
          {rate.toFixed(2)}%
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-(--color-text-primary)">{comparison}</span>
          <span className="text-xs text-(--color-text-secondary)">{detail}</span>
        </div>
      </div>

      {hasRegions && (
        <div className="px-4 pb-2 sm:px-5">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="flex w-full items-center justify-between rounded-lg border border-(--color-primary)/30 bg-(--color-bg-primary)/60 px-3 py-2 text-xs font-medium text-(--color-text-secondary) transition-colors hover:bg-(--color-bg-primary)"
          >
            <span>지역별 사전투표율 {expanded ? "접기" : "보기"}</span>
            <span
              className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              aria-hidden="true"
            >
              ▾
            </span>
          </button>

          {expanded && (
            <ul className="mt-2 space-y-1.5">
              {regions.map((r) => (
                <li key={r.region} className="flex items-center gap-2.5">
                  <span className="w-12 shrink-0 text-xs font-medium text-(--color-text-secondary)">
                    {r.region}
                  </span>
                  <div className="relative h-3.5 flex-1 overflow-hidden rounded bg-(--color-bg-tertiary)">
                    <div
                      className="absolute inset-y-0 left-0 rounded bg-(--color-primary)/70"
                      style={{ width: `${(r.rate / max) * 100}%` }}
                      aria-hidden="true"
                    />
                  </div>
                  <span className="w-12 shrink-0 text-right text-xs font-bold text-(--color-text-primary)">
                    {r.rate.toFixed(2)}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <p className="border-t border-(--color-primary)/20 px-4 py-2 text-[11px] text-(--color-text-tertiary) sm:px-5">
        ※ 중앙선거관리위원회 최종 집계(5/30 18시 마감) 기준
      </p>
    </section>
  );
}
