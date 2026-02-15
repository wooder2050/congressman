export default function MemberDetailSkeleton() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse space-y-6">
      <div className="h-4 w-20 rounded bg-(--color-bg-tertiary)" />

      {/* 프로필 */}
      <div className="flex items-start gap-4">
        <div className="h-20 w-20 shrink-0 rounded-full bg-(--color-bg-tertiary)" />
        <div className="flex-1 space-y-2">
          <div className="h-7 w-28 rounded bg-(--color-bg-tertiary)" />
          <div className="h-5 w-40 rounded bg-(--color-bg-tertiary)" />
          <div className="h-4 w-32 rounded bg-(--color-bg-tertiary)" />
        </div>
      </div>

      {/* 위원회 */}
      <div className="space-y-2">
        <div className="h-4 w-20 rounded bg-(--color-bg-tertiary)" />
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-8 w-28 rounded-lg bg-(--color-bg-tertiary)" />
          ))}
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-4 border-b border-(--color-bg-tertiary)">
        <div className="h-10 w-16 rounded bg-(--color-bg-tertiary)" />
        <div className="h-10 w-16 rounded bg-(--color-bg-tertiary)" />
      </div>

      {/* 출석 내용 */}
      <div className="flex items-center gap-6">
        <div className="h-32 w-32 rounded-full bg-(--color-bg-tertiary)" />
        <div className="space-y-2">
          <div className="h-8 w-20 rounded bg-(--color-bg-tertiary)" />
          <div className="h-4 w-12 rounded bg-(--color-bg-tertiary)" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-(--color-bg-tertiary)" />
        ))}
      </div>
    </div>
  );
}
