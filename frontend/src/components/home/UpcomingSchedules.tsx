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
        // TODO(2026-06-06): 22대 후반기 의장단 본회의(6/5 금)가 끝나고 daily sync로 국회
        // 일정이 다시 채워지면 이 임시 안내 카드를 제거하고 원래 빈 메시지로 되돌릴 것.
        // 임시 안내는 5/29~6/4 국회 휴지기 구간에서만 유효함.
        <div className="rounded-xl border border-(--color-primary) bg-blue-50 p-4 sm:p-5 dark:bg-blue-950/30">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-(--color-primary) px-2 py-0.5 text-xs font-bold text-white">
              국회 휴지기
            </span>
            <span className="text-xs font-semibold text-(--color-text-secondary)">
              22대 전반기 종료(5/29) · 6·3 지방선거 주간
            </span>
          </div>
          <h3 className="mt-2.5 text-base font-bold text-(--color-text-primary) sm:text-lg">
            🏛️ 6/5(금) 22대 국회 후반기 의장단 선출 본회의부터 일정 재개
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-(--color-text-secondary)">
            6월 5일 오후 2시 본회의에서 조정식 신임 국회의장(민주, 6선)과 부의장 남인순(민주,
            4선)·박덕흠(국힘, 4선)이 정식 선출됩니다. 6·3 지방선거 결과 발표 직후 후반기 입법 활동이
            본격화되며, 국회 일정이 등록되는 대로 자동으로 표시됩니다.
          </p>
        </div>
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
