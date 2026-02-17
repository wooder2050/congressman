"use client";

import { useState, useDeferredValue, useRef, useMemo, useEffect, useCallback } from "react";
import { SearchIcon, SlidersHorizontalIcon, XIcon } from "lucide-react";
import { useCongressQuery, useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getVotes, getVoteSummary } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/ui/pagination";
import { VOTE_RESULT_MAP } from "@/lib/constants";
import VoteSummaryCard from "./VoteSummaryCard";
import VoteListItem from "./VoteListItem";
import { SkeletonVoteItem } from "@/components/skeletons/VoteListSkeleton";

interface VoteListInnerProps {
  termId: number;
}

const LIMIT = 20;
const SKELETON_COUNT = 4;

const resultOptions = [
  { id: null, label: "전체" },
  ...Object.entries(VOTE_RESULT_MAP).map(([id, info]) => ({ id, label: info.label })),
];

function generateMonths(termId: number): string[] {
  const startMap: Record<number, string> = { 22: "2024-06", 21: "2020-06", 20: "2016-06" };
  const start = startMap[termId] ?? `${2024 - (22 - termId) * 4}-06`;
  const [sy, sm] = start.split("-").map(Number);
  const now = new Date();
  const months: string[] = [];
  let y = sy;
  let m = sm;
  while (y < now.getFullYear() || (y === now.getFullYear() && m <= now.getMonth() + 1)) {
    months.push(`${y}-${String(m).padStart(2, "0")}`);
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return months;
}

function formatMonthButton(yearMonth: string): string {
  const [y, m] = yearMonth.split("-");
  return `${y}.${parseInt(m, 10)}`;
}

export default function VoteListInner({ termId }: VoteListInnerProps) {
  const { data: summary } = useCongressSuspenseQuery(getVoteSummary, termId);
  const [selectedResult, setSelectedResult] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDeferredValue(searchInput);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const monthScrollRef = useRef<HTMLDivElement>(null);

  const months = useMemo(() => generateMonths(termId), [termId]);

  const handleResultChange = useCallback((v: string | null) => {
    setSelectedResult(v);
    setPage(1);
  }, []);
  const handleMonthChange = useCallback((v: string | null) => {
    setSelectedMonth(v);
    setPage(1);
  }, []);
  const handleSearchChange = useCallback((v: string) => {
    setSearchInput(v);
    setPage(1);
  }, []);

  const queryParams = {
    termId,
    page,
    limit: LIMIT,
    ...(selectedResult ? { resultCode: selectedResult } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(selectedMonth ? { month: selectedMonth } : {}),
  };

  const { data, isLoading, isError, error } = useCongressQuery(getVotes, queryParams);

  useEffect(() => {
    if (!monthScrollRef.current) return;
    const active = monthScrollRef.current.querySelector("[data-active='true']");
    if (active) active.scrollIntoView({ inline: "center", block: "nearest" });
  }, [selectedMonth]);

  const votes = data?.votes ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);

  if (isError) {
    throw error;
  }

  const activeFilterCount = selectedMonth ? 1 : 0;

  return (
    <div className="space-y-4">
      <VoteSummaryCard summary={summary} />

      {/* 검색 */}
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-(--color-text-tertiary)" />
        <Input
          placeholder="표결 검색"
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          aria-label="표결 검색"
          className="h-12 rounded-xl border border-(--color-border-primary) pl-10 text-base"
        />
      </div>

      {/* 결과 필터 (항상 노출) + 상세필터 토글 */}
      <div className="flex items-center gap-2">
        <div className="scrollbar-none flex flex-1 gap-2 overflow-x-auto">
          {resultOptions.map((opt) => (
            <Button
              key={opt.id ?? "all"}
              variant={selectedResult === opt.id ? "chipActive" : "chip"}
              size="sm"
              onClick={() => handleResultChange(opt.id)}
              className="shrink-0 rounded-full px-4 text-sm font-semibold"
            >
              {opt.label}
            </Button>
          ))}
        </div>
        <Button
          variant={showFilters ? "chipActive" : "chip"}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="relative shrink-0 rounded-full px-3"
          aria-label="상세 필터"
        >
          <SlidersHorizontalIcon className="size-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* 접이식 상세 필터 (월별) */}
      {showFilters && (
        <div className="space-y-3 rounded-xl border border-(--color-border-primary) bg-(--color-bg-secondary) p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-(--color-text-primary)">상세 필터</span>
            {activeFilterCount > 0 && (
              <button
                onClick={() => handleMonthChange(null)}
                className="flex items-center gap-1 text-xs text-(--color-text-tertiary) hover:text-(--color-text-primary)"
              >
                <XIcon className="size-3" />
                초기화
              </button>
            )}
          </div>

          {/* 월별 */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-(--color-text-tertiary)">기간</p>
            <div ref={monthScrollRef} className="scrollbar-none flex gap-1.5 overflow-x-auto">
              <Button
                variant={selectedMonth === null ? "chipActive" : "chip"}
                size="xs"
                onClick={() => handleMonthChange(null)}
                className="shrink-0 rounded-full px-3 text-xs font-semibold"
              >
                전체
              </Button>
              {months.map((m) => (
                <Button
                  key={m}
                  variant={selectedMonth === m ? "chipActive" : "chip"}
                  size="xs"
                  onClick={() => handleMonthChange(m)}
                  data-active={selectedMonth === m}
                  className="shrink-0 rounded-full px-3 text-xs font-semibold"
                >
                  {formatMonthButton(m)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="text-sm text-(--color-text-tertiary)">
        {isLoading ? "\u00A0" : `총 ${total.toLocaleString()}건`}
      </p>

      {/* 표결 목록 */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <SkeletonVoteItem key={i} />
          ))}
        </div>
      ) : votes.length === 0 ? (
        <div className="py-8 text-center text-(--color-text-tertiary)">표결 데이터가 없습니다.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {votes.map((vote) => (
              <VoteListItem key={vote.id} vote={vote} />
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
