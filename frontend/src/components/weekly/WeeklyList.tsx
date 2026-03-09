"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import type { WeeklyArticle } from "@/data/weekly/types";
import { SkeletonWeeklyItem } from "@/components/skeletons/WeeklyListSkeleton";

const PAGE_SIZE = 6;

interface WeeklyListProps {
  articles: WeeklyArticle[];
}

/** id("2026-03-w1") → "2026-03" */
function getYearMonth(id: string) {
  return id.slice(0, 7);
}

function formatMonthLabel(ym: string) {
  const [year, month] = ym.split("-");
  return `${year}년 ${parseInt(month)}월`;
}

export default function WeeklyList({ articles }: WeeklyListProps) {
  const months = [...new Set(articles.map((a) => getYearMonth(a.id)))];
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filtered = selectedMonth
    ? articles.filter((a) => getYearMonth(a.id) === selectedMonth)
    : articles;

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // 월 필터 변경 시 페이지 리셋
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedMonth]);

  // IntersectionObserver로 무한 스크롤
  const observerCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0]?.isIntersecting && hasMore) {
        setVisibleCount((prev) => prev + PAGE_SIZE);
      }
    },
    [hasMore],
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: "200px",
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [observerCallback]);

  return (
    <>
      {/* 월별 필터 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedMonth(null)}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
            selectedMonth === null
              ? "bg-(--color-text-primary) text-(--color-bg-primary)"
              : "bg-(--color-bg-secondary) text-(--color-text-secondary) hover:bg-(--color-bg-hover)"
          }`}
        >
          전체
        </button>
        {months.map((ym) => (
          <button
            key={ym}
            onClick={() => setSelectedMonth(ym)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              selectedMonth === ym
                ? "bg-(--color-text-primary) text-(--color-bg-primary)"
                : "bg-(--color-bg-secondary) text-(--color-text-secondary) hover:bg-(--color-bg-hover)"
            }`}
          >
            {formatMonthLabel(ym)}
          </button>
        ))}
      </div>

      {/* 아티클 목록 */}
      <section className="space-y-4">
        {visible.map((article) => (
          <Link
            key={article.id}
            href={`/weekly/${article.id}`}
            className="block rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5 no-underline transition-colors hover:bg-(--color-bg-hover)"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-(--color-text-primary)">
                    {article.title}
                  </h2>
                  <span className="shrink-0 text-xs text-(--color-text-tertiary)">
                    {article.period}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-(--color-text-secondary)">
                  {article.summary}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {article.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-(--color-bg-secondary) px-2.5 py-0.5 text-xs text-(--color-text-secondary)"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              {article.stats && (
                <div className="hidden shrink-0 text-right sm:block">
                  {article.stats.billsPassed != null && (
                    <p className="text-sm text-(--color-text-tertiary)">
                      법안 통과{" "}
                      <span className="font-bold text-(--color-text-primary)">
                        {article.stats.billsPassed}건
                      </span>
                    </p>
                  )}
                  {article.stats.votesHeld != null && (
                    <p className="mt-1 text-sm text-(--color-text-tertiary)">
                      표결{" "}
                      <span className="font-bold text-(--color-text-primary)">
                        {article.stats.votesHeld}건
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </Link>
        ))}

        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-(--color-text-tertiary)">
            해당 월에 발행된 주간 뉴스가 없습니다.
          </p>
        )}

        {/* 무한 스크롤 센티널 + 스켈레톤 */}
        {hasMore && (
          <div ref={sentinelRef} className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <SkeletonWeeklyItem key={i} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
