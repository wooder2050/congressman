export default function TabContentSkeleton() {
  return (
    <div className="animate-pulse space-y-4 py-4">
      <div className="flex items-center gap-6">
        <div className="h-32 w-32 rounded-full bg-(--color-bg-tertiary)" />
        <div className="space-y-2">
          <div className="h-8 w-20 rounded bg-(--color-bg-tertiary)" />
          <div className="h-4 w-12 rounded bg-(--color-bg-tertiary)" />
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-y divide-(--color-border-primary) overflow-hidden rounded-xl border border-(--color-border-primary) sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 bg-(--color-bg-primary)" />
        ))}
      </div>
    </div>
  );
}
