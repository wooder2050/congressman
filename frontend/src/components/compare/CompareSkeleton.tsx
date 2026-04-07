export default function CompareSkeleton() {
  return (
    <div className="space-y-4">
      {/* 검색창 */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <div className="h-10 animate-pulse rounded-xl bg-(--color-bg-tertiary)" />
        <div className="h-10 animate-pulse rounded-xl bg-(--color-bg-tertiary)" />
      </div>

      {/* 패널 */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1 sm:gap-3">
        <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-(--color-border-primary) px-3 py-8 sm:px-6 sm:py-14">
          <div className="aspect-square w-4/5 max-w-56 animate-pulse rounded-full bg-(--color-bg-tertiary) sm:w-3/4 sm:max-w-64" />
          <div className="h-5 w-14 animate-pulse rounded bg-(--color-bg-tertiary) sm:w-20" />
          <div className="h-4 w-10 animate-pulse rounded bg-(--color-bg-tertiary) sm:w-16" />
        </div>

        <div className="flex size-9 items-center justify-center rounded-full bg-(--color-bg-tertiary) sm:size-12">
          <span className="text-xs font-black text-(--color-text-tertiary) sm:text-base">VS</span>
        </div>

        <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-(--color-border-primary) px-3 py-8 sm:px-6 sm:py-14">
          <div className="aspect-square w-4/5 max-w-56 animate-pulse rounded-full bg-(--color-bg-tertiary) sm:w-3/4 sm:max-w-64" />
          <div className="h-5 w-14 animate-pulse rounded bg-(--color-bg-tertiary) sm:w-20" />
          <div className="h-4 w-10 animate-pulse rounded bg-(--color-bg-tertiary) sm:w-16" />
        </div>
      </div>
    </div>
  );
}
