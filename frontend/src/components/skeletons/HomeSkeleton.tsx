export function HomeStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 text-center"
        >
          <div className="mx-auto h-8 w-20 rounded bg-(--color-bg-tertiary)" />
          <div className="mx-auto mt-2 h-4 w-16 rounded bg-(--color-bg-tertiary)" />
        </div>
      ))}
    </div>
  );
}

export function DistrictFinderSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="h-12 animate-pulse rounded-xl bg-(--color-bg-tertiary)" />
        <div className="h-12 animate-pulse rounded-xl bg-(--color-bg-tertiary)" />
      </div>
    </div>
  );
}

export function RecentActivitySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {Array.from({ length: 2 }).map((_, col) => (
        <div key={col} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-6 w-24 animate-pulse rounded bg-(--color-bg-tertiary)" />
            <div className="h-4 w-16 animate-pulse rounded bg-(--color-bg-tertiary)" />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4"
            >
              <div className="mb-2 h-5 w-3/4 rounded bg-(--color-bg-tertiary)" />
              <div className="h-4 w-1/2 rounded bg-(--color-bg-tertiary)" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function ActivityHighlightsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* TopProposers skeleton */}
      <div className="space-y-3">
        <div className="h-6 w-32 animate-pulse rounded bg-(--color-bg-tertiary)" />
        <div className="h-4 w-48 animate-pulse rounded bg-(--color-bg-tertiary)" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex animate-pulse items-center gap-3 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-3"
          >
            <div className="h-6 w-6 rounded bg-(--color-bg-tertiary)" />
            <div className="h-10 w-10 rounded-full bg-(--color-bg-tertiary)" />
            <div className="flex-1">
              <div className="h-4 w-20 rounded bg-(--color-bg-tertiary)" />
            </div>
            <div className="h-6 w-12 rounded bg-(--color-bg-tertiary)" />
          </div>
        ))}
      </div>
      {/* CloseVotes + RejectedVotes skeleton */}
      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, section) => (
          <div key={section} className="space-y-3">
            <div className="h-6 w-36 animate-pulse rounded bg-(--color-bg-tertiary)" />
            <div className="h-4 w-56 animate-pulse rounded bg-(--color-bg-tertiary)" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4"
              >
                <div className="mb-2 h-5 w-3/4 rounded bg-(--color-bg-tertiary)" />
                <div className="h-3 w-full rounded-full bg-(--color-bg-tertiary)" />
                <div className="mt-2 h-4 w-1/2 rounded bg-(--color-bg-tertiary)" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
