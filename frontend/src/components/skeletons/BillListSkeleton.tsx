function SkeletonBillItem() {
  return (
    <div className="animate-pulse rounded-xl border border-(--color-bg-tertiary) bg-(--color-bg-primary) p-4 shadow-(--shadow-card)">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="h-5 flex-1 rounded bg-(--color-bg-tertiary)" />
        <div className="h-5 w-14 shrink-0 rounded-full bg-(--color-bg-tertiary)" />
      </div>
      <div className="flex gap-3">
        <div className="h-3 w-24 rounded bg-(--color-bg-tertiary)" />
        <div className="h-3 w-20 rounded bg-(--color-bg-tertiary)" />
      </div>
    </div>
  );
}

export default function BillListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 w-16 animate-pulse rounded-full bg-(--color-bg-tertiary)" />
        ))}
      </div>
      <div className="h-4 w-16 rounded bg-(--color-bg-tertiary)" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBillItem key={i} />
        ))}
      </div>
    </div>
  );
}
