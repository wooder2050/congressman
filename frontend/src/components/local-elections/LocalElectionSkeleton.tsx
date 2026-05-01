export default function LocalElectionSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* 헤더 */}
      <div className="space-y-3">
        <div className="h-8 w-64 rounded-lg bg-(--color-bg-tertiary)" />
        <div className="h-5 w-48 rounded-lg bg-(--color-bg-tertiary)" />
        <div className="h-4 w-full rounded-lg bg-(--color-bg-tertiary)" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-7 w-20 rounded-full bg-(--color-bg-tertiary)" />
          ))}
        </div>
      </div>

      {/* 선거유형 카드 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="space-y-3 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4"
          >
            <div className="h-5 w-24 rounded bg-(--color-bg-tertiary)" />
            <div className="h-8 w-16 rounded bg-(--color-bg-tertiary)" />
          </div>
        ))}
      </div>

      {/* 지역 그리드 */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 17 }).map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary)"
          />
        ))}
      </div>
    </div>
  );
}
