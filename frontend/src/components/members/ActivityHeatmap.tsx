"use client";

import { useState, useMemo, useCallback } from "react";
import { useCongressQuery } from "@/hooks/useCongressQuery";
import { getActivityHeatmap } from "@/lib/api";
import type { ActivityHeatmapDay } from "@/types";

const CELL_SIZE = 14;
const CELL_GAP = 3;
const CELL_RADIUS = 2;
const DAYS = 7;

const DAY_LABELS = ["", "월", "", "수", "", "금", ""] as const;
const MONTH_NAMES = [
  "",
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
];

/** hex 색상에서 투명도를 적용한 색상 배열 생성 */
function buildLevelColors(hex: string): string[] {
  return [
    "var(--color-bg-tertiary)", // level 0: no activity
    `color-mix(in srgb, ${hex} 20%, var(--color-bg-tertiary))`, // level 1
    `color-mix(in srgb, ${hex} 45%, var(--color-bg-tertiary))`, // level 2
    `color-mix(in srgb, ${hex} 70%, var(--color-bg-tertiary))`, // level 3
    hex, // level 4
  ];
}

function getLevel(score: number): number {
  if (score === 0) return 0;
  if (score <= 2) return 1;
  if (score <= 5) return 2;
  if (score <= 10) return 3;
  return 4;
}

function getScore(day: ActivityHeatmapDay): number {
  return day.representativeBills * 3 + day.votes * 2 + day.coBills * 1;
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildGrid(start: Date, end: Date, data: ActivityHeatmapDay[]) {
  const dataMap = new Map<string, ActivityHeatmapDay>();
  for (const d of data) {
    dataMap.set(d.date, d);
  }

  const startDow = start.getDay();
  const grid: (ActivityHeatmapDay | null)[][] = [];
  let currentWeek: (ActivityHeatmapDay | null)[] = [];

  // 첫 주의 빈 칸 채우기
  for (let i = 0; i < startDow; i++) {
    currentWeek.push(null);
  }

  const current = new Date(start);
  while (current <= end) {
    const dateStr = toDateStr(current);
    const dayData = dataMap.get(dateStr) ?? {
      date: dateStr,
      representativeBills: 0,
      coBills: 0,
      votes: 0,
    };
    currentWeek.push(dayData);

    if (currentWeek.length === 7) {
      grid.push(currentWeek);
      currentWeek = [];
    }

    current.setDate(current.getDate() + 1);
  }

  // 마지막 주의 빈 칸 채우기
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    grid.push(currentWeek);
  }

  return grid;
}

function getMonthLabels(grid: (ActivityHeatmapDay | null)[][], isMultiYear: boolean) {
  const labels: { label: string; weekIndex: number }[] = [];
  let lastKey = "";

  for (let w = 0; w < grid.length; w++) {
    for (const cell of grid[w]) {
      if (cell) {
        const [yearStr, monthStr] = cell.date.split("-");
        const month = parseInt(monthStr, 10);
        const key = `${yearStr}-${monthStr}`;
        if (key !== lastKey) {
          // 멀티이어 모드에서는 1월에 연도 표시, 나머지 월은 간격이 충분할 때만
          if (isMultiYear) {
            if (month === 1) {
              labels.push({ label: `${yearStr}`, weekIndex: w });
            } else if (month % 3 === 1) {
              // 4월, 7월, 10월
              labels.push({ label: MONTH_NAMES[month], weekIndex: w });
            }
          } else {
            labels.push({ label: MONTH_NAMES[month], weekIndex: w });
          }
          lastKey = key;
        }
        break;
      }
    }
  }

  return labels;
}

/** "최근 1년" 모드의 날짜 범위 계산 (오늘 기준 52주 전 일요일 ~ 오늘) */
function getRecentYearRange(): { start: Date; end: Date; startDate: string; endDate: string } {
  const today = new Date();
  // 오늘이 속한 주의 토요일까지 (현재 주 끝)
  const end = new Date(today);

  // 52주 + 현재 주 시작(일요일)까지 되돌림
  const start = new Date(today);
  start.setDate(start.getDate() - start.getDay() - 52 * 7);

  return {
    start,
    end,
    startDate: toDateStr(start),
    endDate: toDateStr(end),
  };
}

/** 전체 임기 모드의 날짜 범위 */
function getFullTermRange(
  startYear: number,
  endYear: number,
): { start: Date; end: Date; startDate: string; endDate: string } {
  const now = new Date();
  const end = endYear > now.getFullYear() ? now : new Date(endYear, 11, 31);
  return {
    start: new Date(startYear, 0, 1),
    end,
    startDate: `${startYear}-01-01`,
    endDate: toDateStr(end),
  };
}

/** 특정 연도 모드의 날짜 범위 (현재 연도면 오늘까지) */
function getYearRange(year: number): {
  start: Date;
  end: Date;
  startDate: string;
  endDate: string;
} {
  const now = new Date();
  const end = year === now.getFullYear() ? now : new Date(year, 11, 31);
  return {
    start: new Date(year, 0, 1),
    end,
    startDate: `${year}-01-01`,
    endDate: toDateStr(end),
  };
}

interface TooltipData {
  x: number;
  y: number;
  day: ActivityHeatmapDay;
  direction: "up" | "down";
}

// "recent" = 최근 1년, "full" = 전체 임기, number = 특정 연도
type ViewMode = "recent" | "full" | number;

/** 대수별 임기 기간 */
const TERM_PERIOD: Record<number, { startYear: number; endYear: number }> = {
  20: { startYear: 2016, endYear: 2020 },
  21: { startYear: 2020, endYear: 2024 },
  22: { startYear: 2024, endYear: 2028 },
};

interface ActivityHeatmapProps {
  memberId: string;
  termId?: number;
  partyColor?: string;
}

export default function ActivityHeatmap({
  memberId,
  termId = 22,
  partyColor = "#1b56db",
}: ActivityHeatmapProps) {
  const currentYear = new Date().getFullYear();
  const period = TERM_PERIOD[termId] ?? { startYear: 2024, endYear: 2028 };
  // 종료연도는 현재연도와 임기 종료연도 중 작은 값
  const lastYear = Math.min(currentYear, period.endYear);

  const years = useMemo(() => {
    const result: number[] = [];
    for (let y = lastYear; y >= period.startYear; y--) {
      result.push(y);
    }
    return result;
  }, [lastYear, period.startYear]);

  // 현재 진행 중인 대수면 "최근 1년", 과거 대수면 "전체 임기"
  const isCurrent = period.endYear >= currentYear;
  const [viewMode, setViewMode] = useState<ViewMode>(isCurrent ? "recent" : "full");
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const levelColors = useMemo(() => buildLevelColors(partyColor), [partyColor]);

  const range = useMemo(() => {
    if (viewMode === "recent") return getRecentYearRange();
    if (viewMode === "full") return getFullTermRange(period.startYear, period.endYear);
    return getYearRange(viewMode);
  }, [viewMode, period.startYear, period.endYear]);

  const { data, isLoading } = useCongressQuery(getActivityHeatmap, {
    memberId,
    termId,
    startDate: range.startDate,
    endDate: range.endDate,
  });

  const grid = useMemo(() => buildGrid(range.start, range.end, data ?? []), [range, data]);
  const isMultiYear = viewMode === "full";
  const monthLabels = useMemo(() => getMonthLabels(grid, isMultiYear), [grid, isMultiYear]);

  const totalScore = useMemo(() => {
    if (!data) return 0;
    return data.reduce((sum, d) => sum + d.representativeBills + d.coBills + d.votes, 0);
  }, [data]);

  const headerLabel =
    viewMode === "recent"
      ? "최근 1년 의정활동"
      : viewMode === "full"
        ? `제${termId}대 의정활동`
        : `${viewMode}년 의정활동`;

  const handleCellEnter = useCallback(
    (e: React.MouseEvent | React.TouchEvent, day: ActivityHeatmapDay, dayIndex: number) => {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const container = (e.target as HTMLElement)
        .closest("[data-heatmap-container]")
        ?.getBoundingClientRect();
      if (!container) return;
      const direction = dayIndex <= 1 ? "down" : "up";
      setTooltip({
        x: rect.left - container.left + rect.width / 2,
        y: direction === "up" ? rect.top - container.top : rect.bottom - container.top,
        day,
        direction,
      });
    },
    [],
  );

  const handleCellLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  const labelWidth = 28;
  const gridWidth = grid.length * (CELL_SIZE + CELL_GAP) - CELL_GAP;
  const svgWidth = labelWidth + gridWidth;
  const monthLabelHeight = 20;
  const svgHeight = monthLabelHeight + DAYS * (CELL_SIZE + CELL_GAP) - CELL_GAP;

  return (
    <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 sm:p-5">
      {/* 헤더 */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-bold text-(--color-text-primary)">
          {headerLabel}
          {!isLoading && (
            <span className="ml-2 text-sm font-normal text-(--color-text-tertiary)">
              총 {totalScore.toLocaleString()}건
            </span>
          )}
        </h3>
        {/* 연도 탭 */}
        <div className="flex gap-1">
          {isCurrent ? (
            <button
              onClick={() => setViewMode("recent")}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                viewMode === "recent"
                  ? "bg-(--color-member-accent) text-white"
                  : "bg-(--color-bg-secondary) text-(--color-text-secondary) hover:bg-(--color-bg-tertiary)"
              }`}
            >
              최근 1년
            </button>
          ) : (
            <button
              onClick={() => setViewMode("full")}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                viewMode === "full"
                  ? "bg-(--color-member-accent) text-white"
                  : "bg-(--color-bg-secondary) text-(--color-text-secondary) hover:bg-(--color-bg-tertiary)"
              }`}
            >
              전체 임기
            </button>
          )}
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setViewMode(y)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                viewMode === y
                  ? "bg-(--color-member-accent) text-white"
                  : "bg-(--color-bg-secondary) text-(--color-text-secondary) hover:bg-(--color-bg-tertiary)"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* 히트맵 */}
      {isLoading ? (
        <div className="flex h-35 items-center justify-center">
          <div className="text-sm text-(--color-text-tertiary)">불러오는 중...</div>
        </div>
      ) : (
        <div className="relative overflow-x-auto" data-heatmap-container>
          <svg
            width={svgWidth}
            height={svgHeight}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="block"
            role="img"
            aria-label={`${headerLabel}: 의정활동 히트맵`}
          >
            {/* 월 라벨 */}
            {monthLabels.map(({ label, weekIndex }) => (
              <text
                key={`${label}-${weekIndex}`}
                x={labelWidth + weekIndex * (CELL_SIZE + CELL_GAP)}
                y={12}
                fontSize={11}
                fill="var(--color-text-tertiary)"
              >
                {label}
              </text>
            ))}

            {/* 요일 라벨 */}
            {DAY_LABELS.map((label, i) =>
              label ? (
                <text
                  key={i}
                  x={0}
                  y={monthLabelHeight + i * (CELL_SIZE + CELL_GAP) + CELL_SIZE - 2}
                  fontSize={11}
                  fill="var(--color-text-tertiary)"
                >
                  {label}
                </text>
              ) : null,
            )}

            {/* 셀 그리드 */}
            {grid.map((week, w) =>
              week.map((day, d) => {
                if (!day) return null;
                const score = getScore(day);
                const level = getLevel(score);
                const x = labelWidth + w * (CELL_SIZE + CELL_GAP);
                const y = monthLabelHeight + d * (CELL_SIZE + CELL_GAP);

                return (
                  <rect
                    key={day.date}
                    x={x}
                    y={y}
                    width={CELL_SIZE}
                    height={CELL_SIZE}
                    rx={CELL_RADIUS}
                    fill={levelColors[level]}
                    className="cursor-pointer outline-none focus-visible:stroke-(--color-text-primary) focus-visible:stroke-2"
                    tabIndex={score > 0 ? 0 : -1}
                    role={score > 0 ? "button" : undefined}
                    aria-label={
                      score > 0
                        ? `${day.date}: 대표발의 ${day.representativeBills}건, 공동발의 ${day.coBills}건, 표결참여 ${day.votes}건`
                        : `${day.date}: 활동 없음`
                    }
                    onMouseEnter={(e) => handleCellEnter(e, day, d)}
                    onMouseLeave={handleCellLeave}
                    onTouchStart={(e) => handleCellEnter(e, day, d)}
                    onTouchEnd={handleCellLeave}
                    onFocus={(e) => handleCellEnter(e as unknown as React.MouseEvent, day, d)}
                    onBlur={handleCellLeave}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleCellEnter(e as unknown as React.MouseEvent, day, d);
                      }
                      if (e.key === "Escape") handleCellLeave();
                    }}
                  />
                );
              }),
            )}
          </svg>

          {/* 툴팁 */}
          {tooltip && (
            <div
              className={`pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg bg-(--color-text-primary) px-3 py-2 text-xs whitespace-nowrap text-(--color-text-inverse) shadow-lg ${
                tooltip.direction === "up" ? "-translate-y-full" : ""
              }`}
              style={{
                left: tooltip.x,
                top: tooltip.direction === "up" ? tooltip.y - 6 : tooltip.y + 6,
              }}
            >
              <div className="mb-1 font-semibold">{formatDate(tooltip.day.date)}</div>
              {getScore(tooltip.day) === 0 ? (
                <div className="text-(--color-text-inverse)/70">활동 없음</div>
              ) : (
                <div className="space-y-0.5">
                  {tooltip.day.representativeBills > 0 && (
                    <div>대표발의 {tooltip.day.representativeBills}건</div>
                  )}
                  {tooltip.day.coBills > 0 && <div>공동발의 {tooltip.day.coBills}건</div>}
                  {tooltip.day.votes > 0 && <div>표결참여 {tooltip.day.votes}건</div>}
                </div>
              )}
              {tooltip.direction === "up" ? (
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-(--color-text-primary)" />
              ) : (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-(--color-text-primary)" />
              )}
            </div>
          )}
        </div>
      )}

      {/* 범례 */}
      <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-(--color-text-tertiary)">
        <span>적음</span>
        {levelColors.map((color, i) => (
          <div
            key={i}
            className="rounded-sm"
            style={{
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              backgroundColor: color,
            }}
          />
        ))}
        <span>많음</span>
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일`;
}
