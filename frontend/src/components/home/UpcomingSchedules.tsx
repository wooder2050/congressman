"use client";

import Link from "next/link";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getUpcomingSchedules } from "@/lib/api";
import { formatDate } from "@/lib/utils";

interface UpcomingSchedulesProps {
  termId: number;
}

export default function UpcomingSchedules({ termId }: UpcomingSchedulesProps) {
  const { data: schedules } = useCongressSuspenseQuery(getUpcomingSchedules, termId);

  if (!schedules) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">다가오는 일정</h2>
        <Link
          href={`/schedule?term=${termId}`}
          className="text-sm font-semibold text-(--color-primary) no-underline"
        >
          전체 보기 →
        </Link>
      </div>

      {schedules.length === 0 ? (
        <p className="flex min-h-30 items-center justify-center text-center text-sm text-(--color-text-tertiary)">
          예정된 일정이 없습니다.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    schedule.type === "plenary"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                  }`}
                >
                  {schedule.type === "plenary" ? "본회의" : schedule.committeeName || "위원회"}
                </span>
              </div>
              <h3 className="line-clamp-1 text-sm font-semibold text-(--color-text-primary)">
                {schedule.title}
              </h3>
              <p className="mt-1 text-xs text-(--color-text-tertiary)">
                {formatDate(schedule.meetingDate)}
                {schedule.meetingTime && ` ${schedule.meetingTime}`}
              </p>
              {schedule.agenda && (
                <p className="mt-2 line-clamp-2 text-xs text-(--color-text-secondary)">
                  {schedule.agenda}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
