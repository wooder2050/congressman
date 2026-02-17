export default function AttendanceDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse space-y-6">
      <div className="h-4 w-20 rounded bg-(--color-bg-tertiary)" />

      <div className="space-y-1">
        <div className="h-7 w-36 rounded bg-(--color-bg-tertiary)" />
        <div className="h-4 w-24 rounded bg-(--color-bg-tertiary)" />
      </div>

      {/* 도넛 + 요약 */}
      <div className="flex items-center gap-6">
        <div className="h-[180px] w-[180px] shrink-0 rounded-full bg-(--color-bg-tertiary)" />
        <div className="space-y-2">
          <div className="h-8 w-20 rounded bg-(--color-bg-tertiary)" />
          <div className="h-4 w-12 rounded bg-(--color-bg-tertiary)" />
        </div>
      </div>

      {/* 요약 그리드 */}
      <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-(--color-border-primary) sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-3">
            <div className="mx-auto mb-1 h-6 w-10 rounded bg-(--color-bg-tertiary)" />
            <div className="mx-auto h-3 w-14 rounded bg-(--color-bg-tertiary)" />
          </div>
        ))}
      </div>

      {/* 월별 차트 */}
      <div>
        <div className="mb-3 h-4 w-24 rounded bg-(--color-bg-tertiary)" />
        <div className="h-[200px] rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary)" />
      </div>

      {/* 필터 버튼 */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-16 rounded-full bg-(--color-bg-tertiary)" />
        ))}
      </div>

      {/* 카드 목록 */}
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-(--color-border-primary) p-4">
            <div className="mb-2 h-5 w-3/4 rounded bg-(--color-bg-tertiary)" />
            <div className="flex gap-2">
              <div className="h-4 w-16 rounded bg-(--color-bg-tertiary)" />
              <div className="h-4 w-12 rounded bg-(--color-bg-tertiary)" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
