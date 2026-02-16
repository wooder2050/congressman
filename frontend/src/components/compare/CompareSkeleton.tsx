export default function CompareSkeleton() {
  return (
    <div className="space-y-4">
      {/* Search bar skeleton */}
      <div className="h-12 animate-pulse rounded-xl bg-(--color-bg-tertiary)" />

      {/* Cards skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-2 rounded-xl border border-(--color-border-primary) p-4"
          >
            <div className="h-16 w-16 animate-pulse rounded-full bg-(--color-bg-tertiary)" />
            <div className="h-4 w-16 animate-pulse rounded bg-(--color-bg-tertiary)" />
            <div className="h-3 w-12 animate-pulse rounded bg-(--color-bg-tertiary)" />
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="h-48 animate-pulse rounded-xl bg-(--color-bg-tertiary)" />
    </div>
  );
}
