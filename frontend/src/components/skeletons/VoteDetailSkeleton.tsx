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

      {/* 정당별 투표 그리드 스켈레톤 */}
      <div className="space-y-4">
        <div className="h-6 w-40 rounded bg-(--color-bg-tertiary)" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-16 rounded-full bg-(--color-bg-tertiary)" />
          ))}
        </div>
        <div className="space-y-3">
          {[20, 12, 6].map((count, i) => (
            <div
              key={i}
              className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-(--color-bg-tertiary)" />
                <div className="h-5 w-24 rounded bg-(--color-bg-tertiary)" />
                <div className="h-4 w-12 rounded bg-(--color-bg-tertiary)" />
              </div>
              <div className="mb-3 h-2 w-full rounded-full bg-(--color-bg-tertiary)" />
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10">
                {Array.from({ length: count }).map((_, j) => (
                  <div key={j} className="h-7 rounded bg-(--color-bg-tertiary)" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
