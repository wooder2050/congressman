export default function HistorySkeleton() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse space-y-6">
      <div className="h-4 w-20 rounded bg-(--color-bg-tertiary)" />

      <div className="space-y-1">
        <div className="h-7 w-28 rounded bg-(--color-bg-tertiary)" />
        <div className="h-4 w-36 rounded bg-(--color-bg-tertiary)" />
      </div>

      {/* 차트 영역 */}
      <div className="space-y-8">
        <div>
          <div className="mb-3 h-5 w-24 rounded bg-(--color-bg-tertiary)" />
          <div className="h-48 rounded-lg bg-(--color-bg-tertiary)" />
        </div>
        <div>
          <div className="mb-3 h-5 w-28 rounded bg-(--color-bg-tertiary)" />
          <div className="h-48 rounded-lg bg-(--color-bg-tertiary)" />
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="space-y-3">
        <div className="mb-3 h-5 w-20 rounded bg-(--color-bg-tertiary)" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-(--color-bg-tertiary) p-4">
            <div className="mb-2 h-6 w-16 rounded bg-(--color-bg-tertiary)" />
            <div className="mb-2 h-4 w-24 rounded bg-(--color-bg-tertiary)" />
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-14 rounded-lg bg-(--color-bg-secondary)" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
