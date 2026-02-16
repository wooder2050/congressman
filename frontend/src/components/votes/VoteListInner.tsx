"use client";

import { useState, useEffect, useDeferredValue, useRef } from "react";
import { SearchIcon } from "lucide-react";
import { useCongressInfiniteQuery, useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getVotes, getVoteSummary } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VOTE_RESULT_MAP } from "@/lib/constants";
import VoteSummaryCard from "./VoteSummaryCard";
import VoteListItem from "./VoteListItem";
import { SkeletonVoteItem } from "@/components/skeletons/VoteListSkeleton";

interface VoteListInnerProps {
  termId: number;
}

const SKELETON_COUNT = 4;

const resultOptions = [
  { id: null, label: "전체" },
  ...Object.entries(VOTE_RESULT_MAP).map(([id, info]) => ({ id, label: info.label })),
];

export default function VoteListInner({ termId }: VoteListInnerProps) {
  const { data: summary } = useCongressSuspenseQuery(getVoteSummary, termId);
  const [selectedResult, setSelectedResult] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDeferredValue(searchInput);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const queryParams = {
    termId,
    ...(selectedResult ? { resultCode: selectedResult } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
    useCongressInfiniteQuery(getVotes, queryParams, {
      limit: 30,
      getItemCount: (page) => page.votes.length,
    });

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const allVotes = data?.pages.flatMap((page) => page.votes) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  if (isError) {
    throw error;
  }

  return (
    <div className="space-y-4">
      <VoteSummaryCard summary={summary} />

      {/* 검색 */}
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-(--color-text-tertiary)" />
        <Input
          placeholder="표결 검색"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="표결 검색"
          className="h-12 rounded-xl border border-(--color-border-primary) pl-10 text-base"
        />
      </div>

      {/* 결과 필터 */}
      <div className="flex flex-wrap gap-2">
        {resultOptions.map((opt) => (
          <Button
            key={opt.id ?? "all"}
            variant={selectedResult === opt.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedResult(opt.id)}
            className="rounded-full px-4 text-sm font-semibold"
          >
            {opt.label}
          </Button>
        ))}
      </div>

      <p className="text-sm text-(--color-text-tertiary)">
        {isLoading ? "\u00A0" : `총 ${total.toLocaleString()}건`}
      </p>

      {/* 표결 목록 */}
      {!isLoading && allVotes.length === 0 ? (
        <div className="py-8 text-center text-(--color-text-tertiary)">표결 데이터가 없습니다.</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {allVotes.map((vote) => (
            <VoteListItem key={vote.id} vote={vote} />
          ))}
        </div>
      )}

      {/* Sentinel + 로딩 스켈레톤 */}
      {(isLoading || hasNextPage) && (
        <div ref={sentinelRef} className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {(isLoading || isFetchingNextPage) &&
            Array.from({ length: SKELETON_COUNT }).map((_, i) => <SkeletonVoteItem key={i} />)}
        </div>
      )}
    </div>
  );
}
