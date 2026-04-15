export default function ElectionSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* 헤더 */}
      <div className="space-y-3">
        <div className="h-8 w-64 rounded-lg bg-(--color-bg-tertiary)" />
        <div className="h-5 w-48 rounded-lg bg-(--color-bg-tertiary)" />
        <div className="h-4 w-full rounded-lg bg-(--color-bg-tertiary)" />
      </div>

      {/* 선거구 카드 */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="space-y-4 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5"
        >
          <div className="h-6 w-40 rounded-lg bg-(--color-bg-tertiary)" />
          <div className="h-4 w-60 rounded-lg bg-(--color-bg-tertiary)" />
          <div className="h-20 rounded-lg bg-(--color-bg-tertiary)" />
        </div>
      ))}
    </div>
  );
}
