export default function VoteDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse space-y-6">
      <div className="h-4 w-24 rounded bg-(--color-bg-tertiary)" />

      <div className="space-y-4 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="h-7 flex-1 rounded bg-(--color-bg-tertiary)" />
          <div className="h-6 w-16 shrink-0 rounded-full bg-(--color-bg-tertiary)" />
        </div>
        <div className="flex gap-4">
          <div className="h-4 w-24 rounded bg-(--color-bg-tertiary)" />
          <div className="h-4 w-32 rounded bg-(--color-bg-tertiary)" />
        </div>
        <div className="h-3 w-full rounded-full bg-(--color-bg-tertiary)" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-(--color-bg-secondary)" />
          ))}
        </div>
      </div>

      <div className="h-6 w-40 rounded bg-(--color-bg-tertiary)" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-16 rounded-full bg-(--color-bg-tertiary)" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary)"
          />
        ))}
      </div>
    </div>
  );
}
