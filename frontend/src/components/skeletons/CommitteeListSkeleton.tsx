function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4">
      <div className="h-5 w-32 rounded bg-(--color-bg-tertiary)" />
      <div className="mt-3 flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-(--color-bg-tertiary)" />
        <div className="h-4 w-24 rounded bg-(--color-bg-tertiary)" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="h-6 w-10 rounded bg-(--color-bg-tertiary)" />
            <div className="h-3 w-12 rounded bg-(--color-bg-tertiary)" />
          </div>
        ))}
      </div>
      <div className="mt-3 h-1.5 w-full rounded-full bg-(--color-bg-tertiary)" />
    </div>
  );
}

export default function CommitteeListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-4 w-28 rounded bg-(--color-bg-tertiary)" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
