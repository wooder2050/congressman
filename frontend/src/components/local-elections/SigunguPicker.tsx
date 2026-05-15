"use client";

import { useEffect, useMemo, useState } from "react";
import type { LocalElectionSigunguOption } from "@/types";

interface Props {
  sido: string;
  sigunguList: LocalElectionSigunguOption[];
  selected: string | null;
  onSelect: (sigungu: string | null) => void;
  recent: string[];
}

const COLLAPSED_LIMIT = 12;

export default function SigunguPicker({ sido, sigunguList, selected, onSelect, recent }: Props) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);

  // 검색어 변경 시 collapse 무시하고 결과 모두 노출
  const isSearching = query.trim().length > 0;

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return sigunguList;
    return sigunguList.filter((s) => s.name.includes(q));
  }, [query, sigunguList]);

  const visibleChips = useMemo(() => {
    if (isSearching || expanded) return filtered;
    return filtered.slice(0, COLLAPSED_LIMIT);
  }, [filtered, isSearching, expanded]);

  const hasMoreChips = !isSearching && !expanded && filtered.length > COLLAPSED_LIMIT;

  // 시군구가 1개 이하인 시도(세종/제주)는 picker를 노출할 필요 없음
  if (sigunguList.length <= 1) return null;

  const recentVisible = recent.filter((s) => sigunguList.some((opt) => opt.name === s)).slice(0, 5);

  return (
    <section className="space-y-3 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 sm:p-5">
      <div>
        <h2 className="text-base font-bold text-(--color-text-primary)">내 동네 선거구 찾기</h2>
        <p className="mt-1 text-xs text-(--color-text-secondary)">
          시·군·구를 선택하면 해당 지역의 선거 7개(시·도지사, 교육감, 광역의원, 광역 비례,
          기초단체장, 기초의원, 기초 비례)를 모두 보여드립니다.
        </p>
      </div>

      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`${sido} 시·군·구 검색`}
          className="w-full rounded-lg border border-(--color-border-primary) bg-(--color-bg-secondary) px-3 py-2 text-sm placeholder:text-(--color-text-tertiary) focus:border-(--color-primary) focus:outline-none"
          aria-label="시군구 검색"
        />
      </div>

      {recentVisible.length > 0 && !isSearching && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-(--color-text-tertiary)">최근 본 지역</p>
          <div className="flex flex-wrap gap-1.5">
            {recentVisible.map((name) => (
              <button
                key={`recent-${name}`}
                onClick={() => onSelect(name)}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                  selected === name
                    ? "border-(--color-primary) bg-(--color-primary) text-white"
                    : "border-(--color-border-primary) bg-(--color-bg-secondary) text-(--color-text-secondary) hover:border-(--color-primary)"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex flex-wrap gap-1.5">
          {visibleChips.map((opt) => {
            const isSelected = selected === opt.name;
            return (
              <button
                key={opt.name}
                onClick={() => onSelect(isSelected ? null : opt.name)}
                className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                  isSelected
                    ? "border-(--color-primary) bg-(--color-primary) text-white"
                    : "border-(--color-border-primary) bg-(--color-bg-secondary) text-(--color-text-secondary) hover:border-(--color-primary)"
                }`}
                aria-pressed={isSelected}
              >
                <span>{opt.name}</span>
                <span
                  className={`text-[10px] ${isSelected ? "text-white/80" : "text-(--color-text-tertiary)"}`}
                >
                  {opt.raceCount}
                </span>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-xs text-(--color-text-tertiary)">
              &ldquo;{query}&rdquo;에 해당하는 시·군·구가 없습니다.
            </p>
          )}
        </div>

        {hasMoreChips && (
          <button
            onClick={() => setExpanded(true)}
            className="mt-2 text-xs font-medium text-(--color-primary) hover:underline"
          >
            전체 {filtered.length}개 시·군·구 보기 →
          </button>
        )}
        {expanded && !isSearching && (
          <button
            onClick={() => setExpanded(false)}
            className="mt-2 text-xs font-medium text-(--color-text-tertiary) hover:underline"
          >
            접기
          </button>
        )}
      </div>

      {selected && (
        <div className="flex items-center justify-between rounded-lg bg-(--color-bg-secondary) px-3 py-2 text-xs">
          <span className="text-(--color-text-secondary)">
            <strong className="font-semibold text-(--color-text-primary)">{selected}</strong>{" "}
            기준으로 표시 중
          </span>
          <button
            onClick={() => onSelect(null)}
            className="font-medium text-(--color-primary) hover:underline"
          >
            전체 보기
          </button>
        </div>
      )}
    </section>
  );
}

/** localStorage 키 (스키마 변경 시 v숫자를 올림) */
export const RECENT_SIGUNGU_KEY = "election:recentSigungu:v1";
export const LAST_SIGUNGU_KEY = "election:lastSigungu:v1";

/** localStorage 읽기/쓰기 헬퍼. SSR 환경에서는 안전하게 빈 값을 반환. */
export function readRecentSigungu(sido: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_SIGUNGU_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Record<string, string[]>;
    return parsed[sido] ?? [];
  } catch {
    return [];
  }
}

export function pushRecentSigungu(sido: string, sigungu: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(RECENT_SIGUNGU_KEY);
    const parsed = (raw ? (JSON.parse(raw) as Record<string, string[]>) : {}) ?? {};
    const list = (parsed[sido] ?? []).filter((s) => s !== sigungu);
    list.unshift(sigungu);
    parsed[sido] = list.slice(0, 5);
    window.localStorage.setItem(RECENT_SIGUNGU_KEY, JSON.stringify(parsed));
    window.localStorage.setItem(LAST_SIGUNGU_KEY, JSON.stringify({ sido, sigungu }));
  } catch {
    // localStorage 쓰기 실패는 silent
  }
}

export function readLastSigungu(sido: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LAST_SIGUNGU_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { sido: string; sigungu: string };
    return parsed.sido === sido ? parsed.sigungu : null;
  } catch {
    return null;
  }
}

/** 컴포넌트 외부에서 마운트 후 recent를 읽기 위한 훅 */
export function useRecentSigungu(sido: string): string[] {
  const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => {
    setRecent(readRecentSigungu(sido));
  }, [sido]);
  return recent;
}
