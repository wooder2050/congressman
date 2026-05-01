"use client";

const MILESTONES = [
  { label: "후보등록", date: "5/14~15", key: "registration" },
  { label: "선거운동", date: "5/21~", key: "campaign" },
  { label: "사전투표", date: "5/29~30", key: "early" },
  { label: "본투표", date: "6/3", key: "election" },
];

function getActiveStep(): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dates = [
    new Date(2026, 4, 14),
    new Date(2026, 4, 21),
    new Date(2026, 4, 29),
    new Date(2026, 5, 3),
  ];
  for (let i = dates.length - 1; i >= 0; i--) {
    if (now >= dates[i]) return i;
  }
  return -1;
}

export default function ElectionTimeline() {
  const active = getActiveStep();

  return (
    <div className="flex items-center justify-between gap-1 overflow-x-auto rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4">
      {MILESTONES.map((m, i) => {
        const isPast = i <= active;
        const isCurrent = i === active;
        return (
          <div key={m.key} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                isCurrent
                  ? "bg-(--color-primary) text-white ring-2 ring-(--color-primary) ring-offset-2"
                  : isPast
                    ? "bg-(--color-primary) text-white"
                    : "bg-(--color-bg-tertiary) text-(--color-text-tertiary)"
              }`}
            >
              {isPast ? "✓" : i + 1}
            </div>
            <span
              className={`text-center text-xs font-medium ${
                isCurrent ? "text-(--color-primary)" : "text-(--color-text-secondary)"
              }`}
            >
              {m.label}
            </span>
            <span className="text-center text-xs text-(--color-text-tertiary)">{m.date}</span>
          </div>
        );
      })}
    </div>
  );
}
