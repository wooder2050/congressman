export function SkeletonVoteItem() {
  return (
    <div className="animate-pulse rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="h-5 flex-1 rounded bg-(--color-bg-tertiary)" />
        <div className="h-5 w-16 shrink-0 rounded-full bg-(--color-bg-tertiary)" />
      </div>
      <div className="mb-2 h-3 w-full rounded-full bg-(--color-bg-tertiary)" />
      <div className="flex gap-3">
        <div className="h-3 w-16 rounded bg-(--color-bg-tertiary)" />
        <div className="h-3 w-16 rounded bg-(--color-bg-tertiary)" />
        <div className="h-3 w-16 rounded bg-(--color-bg-tertiary)" />
      </div>
    </div>
  );
}

export default function VoteListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Summary skeleton */}
      <div className="animate-pulse rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4">
        <div className="flex items-center gap-6">
          <div className="h-[140px] w-[140px] rounded-full bg-(--color-bg-tertiary)" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 w-24 rounded bg-(--color-bg-tertiary)" />
            ))}
          </div>
        </div>
      </div>
      {/* Filter buttons skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 w-16 animate-pulse rounded-full bg-(--color-bg-tertiary)" />
        ))}
      </div>
      <div className="h-4 w-16 rounded bg-(--color-bg-tertiary)" />
      {/* Vote items skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonVoteItem key={i} />
        ))}
      </div>
    </div>
  );
}
