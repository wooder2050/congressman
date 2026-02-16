"use client";

import { useState, useEffect, useDeferredValue, useRef } from "react";
import { SearchIcon } from "lucide-react";
import { useCongressInfiniteQuery, useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getBills, getBillSummary } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BillSummaryCard from "./BillSummaryCard";
import BillListItem from "./BillListItem";
import { BILL_STATUS_MAP } from "@/lib/constants";
import { SkeletonBillItem } from "@/components/skeletons/BillListSkeleton";

interface BillListInnerProps {
  termId: number;
}

const SKELETON_COUNT = 4;

const statusOptions = [
  { id: null, label: "전체" },
  ...Object.entries(BILL_STATUS_MAP).map(([id, info]) => ({ id, label: info.label })),
];

export default function BillListInner({ termId }: BillListInnerProps) {
  const { data: summary } = useCongressSuspenseQuery(getBillSummary, termId);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDeferredValue(searchInput);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const queryParams = {
    termId,
    ...(selectedStatus ? { status: selectedStatus } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
    useCongressInfiniteQuery(getBills, queryParams, {
      limit: 30,
      getItemCount: (page) => page.bills.length,
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

  const allBills = data?.pages.flatMap((page) => page.bills) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  if (isError) {
    throw error;
  }

  return (
    <div className="space-y-4">
      <BillSummaryCard summary={summary} />

      {/* 검색 */}
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-(--color-text-tertiary)" />
        <Input
          placeholder="법안 제목 검색"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="법안 검색"
          className="h-12 rounded-xl border border-(--color-border-primary) pl-10 text-base"
        />
      </div>

      {/* 상태 필터 */}
      <div className="flex flex-wrap gap-2">
        {statusOptions.map((opt) => (
          <Button
            key={opt.id ?? "all"}
            variant={selectedStatus === opt.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedStatus(opt.id)}
            className="rounded-full px-4 text-sm font-semibold"
          >
            {opt.label}
          </Button>
        ))}
      </div>

      <p className="text-sm text-(--color-text-tertiary)">
        {isLoading ? "\u00A0" : `총 ${total.toLocaleString()}건`}
      </p>

      {/* 법안 목록 */}
      {!isLoading && allBills.length === 0 ? (
        <div className="py-8 text-center text-(--color-text-tertiary)">해당 법안이 없습니다.</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {allBills.map((bill) => (
            <BillListItem key={bill.id} bill={bill} />
          ))}
        </div>
      )}

      {/* Sentinel + 로딩 스켈레톤 */}
      {(isLoading || hasNextPage) && (
        <div ref={sentinelRef} className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {(isLoading || isFetchingNextPage) &&
            Array.from({ length: SKELETON_COUNT }).map((_, i) => <SkeletonBillItem key={i} />)}
        </div>
      )}
    </div>
  );
}
