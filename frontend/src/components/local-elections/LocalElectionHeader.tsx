import type { LocalElectionOverview } from "@/types";
import { ELECTION_TYPES } from "@/constants/local-elections";

function getDDay(dateStr: string): string {
  const target = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff > 0) return `D-${diff}`;
  if (diff === 0) return "D-Day";
  return `D+${Math.abs(diff)}`;
}

const STATUS_LABEL: Record<string, { text: string; className: string }> = {
  upcoming: {
    text: "예정",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  active: {
    text: "진행 중",
    className: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  },
  completed: {
    text: "완료",
    className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  },
};

export default function LocalElectionHeader({ election }: { election: LocalElectionOverview }) {
  const dday = getDDay(election.electionDate);
  const status = STATUS_LABEL[election.status] ?? STATUS_LABEL.upcoming;

  const isCompleted = election.status === "completed";

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${status.className}`}>
          {status.text}
        </span>
        {/* 개표 완료 후에는 D-day가 의미 없으므로 숨김 */}
        {!isCompleted && (
          <span className="rounded-md bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
            {dday}
          </span>
        )}
      </div>

      <h1 className="text-2xl font-bold sm:text-3xl sm:font-extrabold sm:tracking-tight">
        {election.name}
      </h1>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-(--color-text-secondary)">
        <span>투표일 {election.electionDate}</span>
        <span>·</span>
        <span>후보 {election.totalCandidates.toLocaleString()}명</span>
      </div>

      {election.description && (
        <p className="text-sm leading-relaxed text-(--color-text-tertiary)">
          {election.description}
        </p>
      )}

      {/* 유형별 요약 */}
      <div className="flex flex-wrap gap-2 pt-1">
        {ELECTION_TYPES.map((t) => {
          const count = election.raceCounts[t.id] ?? 0;
          if (count === 0) return null;
          return (
            <span
              key={t.id}
              className="rounded-full bg-(--color-bg-secondary) px-3 py-1 text-xs font-medium text-(--color-text-secondary)"
            >
              {t.label} {count}
            </span>
          );
        })}
      </div>
    </section>
  );
}
