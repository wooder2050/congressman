export function SkeletonWeeklyItem() {
  return (
    <div className="animate-pulse rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="h-5 w-28 rounded bg-(--color-bg-tertiary)" />
            <div className="h-3.5 w-36 rounded bg-(--color-bg-tertiary)" />
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="h-3.5 w-full rounded bg-(--color-bg-tertiary)" />
            <div className="h-3.5 w-3/4 rounded bg-(--color-bg-tertiary)" />
          </div>
          <div className="mt-3 flex gap-1.5">
            <div className="h-5 w-16 rounded-full bg-(--color-bg-tertiary)" />
            <div className="h-5 w-20 rounded-full bg-(--color-bg-tertiary)" />
            <div className="h-5 w-14 rounded-full bg-(--color-bg-tertiary)" />
          </div>
        </div>
        <div className="hidden shrink-0 space-y-2 sm:block">
          <div className="h-3.5 w-20 rounded bg-(--color-bg-tertiary)" />
          <div className="h-3.5 w-16 rounded bg-(--color-bg-tertiary)" />
        </div>
      </div>
    </div>
  );
}

export default function WeeklyListSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* 제목 */}
      <div>
        <div className="h-9 w-48 rounded bg-(--color-bg-tertiary)" />
        <div className="mt-3 h-4 w-full max-w-md rounded bg-(--color-bg-tertiary)" />
      </div>

      {/* 월별 필터 */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-(--color-bg-tertiary)" />
        ))}
      </div>

      {/* 카드 목록 */}
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonWeeklyItem key={i} />
        ))}
      </div>
    </div>
  );
}
