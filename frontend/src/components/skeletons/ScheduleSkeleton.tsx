export function UpcomingSchedulesSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-7 w-32 animate-pulse rounded bg-(--color-bg-tertiary)" />
        <div className="h-4 w-16 animate-pulse rounded bg-(--color-bg-tertiary)" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4"
          >
            <div className="mb-2 h-5 w-16 rounded-full bg-(--color-bg-tertiary)" />
            <div className="h-5 w-3/4 rounded bg-(--color-bg-tertiary)" />
            <div className="mt-1 h-4 w-1/2 rounded bg-(--color-bg-tertiary)" />
            <div className="mt-2 h-4 w-full rounded bg-(--color-bg-tertiary)" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ScheduleListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4"
        >
          <div className="flex items-center gap-2">
            <div className="h-5 w-16 rounded-full bg-(--color-bg-tertiary)" />
            <div className="h-4 w-32 rounded bg-(--color-bg-tertiary)" />
          </div>
          <div className="mt-2 h-5 w-3/4 rounded bg-(--color-bg-tertiary)" />
          <div className="mt-2 h-4 w-full rounded bg-(--color-bg-tertiary)" />
        </div>
      ))}
    </div>
  );
}
