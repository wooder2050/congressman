export default function MapSkeleton() {
  return (
    <div className="flex h-[calc(100vh-120px)] flex-col">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 px-4 py-3">
        <div className="h-4 w-12 animate-pulse rounded bg-(--color-bg-tertiary)" />
      </div>
      {/* Map skeleton */}
      <div className="flex flex-1 items-center justify-center">
        <div className="h-[70vw] max-h-[500px] w-[80vw] max-w-[600px] animate-pulse rounded-2xl bg-(--color-bg-tertiary)" />
      </div>
      {/* Legend skeleton */}
      <div className="flex flex-wrap gap-2 px-4 py-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-6 w-20 animate-pulse rounded-full bg-(--color-bg-tertiary)" />
        ))}
      </div>
    </div>
  );
}
