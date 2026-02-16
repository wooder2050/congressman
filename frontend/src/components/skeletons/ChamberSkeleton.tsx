export default function ChamberSkeleton() {
  return (
    <div className="flex h-[calc(100dvh-13rem)] flex-col overflow-hidden">
      {/* Vote selector skeleton */}
      <div className="px-4 py-3">
        <div className="h-10 w-full animate-pulse rounded-lg bg-(--color-bg-tertiary)" />
      </div>

      {/* SVG area skeleton */}
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-(--color-primary) border-t-transparent" />
          <span className="text-sm text-(--color-text-tertiary)">좌석 배치도를 불러오는 중...</span>
        </div>
      </div>

      {/* Legend skeleton */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-(--color-border-primary) px-4 py-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="h-3 w-3 animate-pulse rounded-full bg-(--color-bg-tertiary)" />
            <div
              className="h-3 animate-pulse rounded bg-(--color-bg-tertiary)"
              style={{ width: `${36 + i * 6}px` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
