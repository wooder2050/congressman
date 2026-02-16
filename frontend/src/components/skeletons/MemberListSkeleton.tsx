export function SkeletonCard() {
  return (
    <div className="flex animate-pulse items-center gap-4 rounded-xl border border-l-4 border-(--color-border-primary) bg-(--color-bg-primary) p-4">
      <div className="h-16 w-16 shrink-0 rounded-full bg-(--color-bg-tertiary)" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-5 w-24 rounded bg-(--color-bg-tertiary)" />
        <div className="h-4 w-32 rounded bg-(--color-bg-tertiary)" />
        <div className="h-3 w-16 rounded bg-(--color-bg-tertiary)" />
      </div>
    </div>
  );
}

export default function MemberListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-12 rounded-xl bg-(--color-bg-tertiary)" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 w-20 animate-pulse rounded-full bg-(--color-bg-tertiary)" />
        ))}
      </div>
      <div className="h-4 w-16 rounded bg-(--color-bg-tertiary)" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
