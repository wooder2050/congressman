export default function MapSkeleton() {
  return (
    <div className="flex h-[calc(100dvh-13rem)] flex-col overflow-hidden">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 px-4 py-3">
        <div className="h-4 w-10 animate-pulse rounded bg-(--color-bg-tertiary)" />
      </div>

      {/* Map area skeleton */}
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-(--color-primary) border-t-transparent" />
          <span className="text-sm text-(--color-text-tertiary)">
            지도를 불러오는 중...
          </span>
        </div>
      </div>

      {/* Legend skeleton */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-(--color-border-primary) px-4 py-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="h-3 w-3 animate-pulse rounded-full bg-(--color-bg-tertiary)" />
            <div
              className="h-3 animate-pulse rounded bg-(--color-bg-tertiary)"
              style={{ width: `${40 + i * 8}px` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
