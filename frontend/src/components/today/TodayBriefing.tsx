"use client";

import Link from "next/link";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getTodayBriefing } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Schedule, Vote } from "@/types";

interface TodayBriefingProps {
  termId: number;
}

export default function TodayBriefing({ termId }: TodayBriefingProps) {
  const { data } = useCongressSuspenseQuery(getTodayBriefing, termId);

  const hasSchedules = data.schedules.length > 0;
  const hasVotes = data.recentVotes.length > 0;
  const hasBills = data.recentBills.length > 0;
  const isEmpty = !hasSchedules && !hasVotes && !hasBills;

  if (isEmpty) {
    return (
      <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-8 text-center">
        <p className="text-base font-semibold text-(--color-text-primary)">
          최근 3일간 국회 활동이 없습니다
        </p>
        <p className="mt-1 text-sm text-(--color-text-tertiary)">
          국회 일정이 시작되면 이곳에 표시됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {hasSchedules && <ScheduleSection schedules={data.schedules} />}
      {hasVotes && <VoteSection votes={data.recentVotes} />}
      {hasBills && <BillSection bills={data.recentBills} />}
    </div>
  );
}

function ScheduleSection({ schedules }: { schedules: Schedule[] }) {
  return (
    <section className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
      <h2 className="mb-4 text-xl font-bold text-(--color-text-primary)">일정</h2>
      <div className="space-y-3">
        {schedules.map((s) => (
          <div
            key={s.id}
            className="flex items-start gap-3 rounded-lg bg-(--color-bg-secondary) p-3"
          >
            <div className="shrink-0 pt-0.5">
              <span
                className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${
                  s.type === "plenary"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                }`}
              >
                {s.type === "plenary" ? "본회의" : "위원회"}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-(--color-text-primary)">
                {s.title || s.committeeName}
              </p>
              {s.committeeName && s.title && (
                <p className="mt-0.5 text-xs text-(--color-text-tertiary)">{s.committeeName}</p>
              )}
              <div className="mt-1 flex items-center gap-2 text-xs text-(--color-text-tertiary)">
                <span>{formatDate(s.meetingDate)}</span>
                {s.meetingTime && <span>{s.meetingTime}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function VoteSection({ votes }: { votes: Vote[] }) {
  return (
    <section className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
      <h2 className="mb-4 text-xl font-bold text-(--color-text-primary)">최근 표결</h2>
      <div className="space-y-3">
        {votes.map((v) => (
          <Link
            key={v.id}
            href={`/votes/${v.id}`}
            className="block rounded-lg bg-(--color-bg-secondary) p-3 no-underline transition-colors hover:bg-(--color-bg-tertiary)"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 flex-1 text-sm font-semibold text-(--color-text-primary)">
                {v.billName}
              </p>
              <ResultBadge resultCode={v.resultCode} procResult={v.procResult} />
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs text-(--color-text-tertiary)">
              <span>찬성 {v.yesCount}</span>
              <span>반대 {v.noCount}</span>
              <span>기권 {v.abstainCount}</span>
              <span className="ml-auto">{formatDate(v.procDate)}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ResultBadge({ resultCode, procResult }: { resultCode: string; procResult: string }) {
  const isPassed = resultCode === "passed" || resultCode === "amended";
  return (
    <span
      className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold ${
        isPassed
          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
      }`}
    >
      {procResult}
    </span>
  );
}

function BillSection({
  bills,
}: {
  bills: {
    id: string;
    title: string;
    proposerName: string;
    status: string;
    proposedDate: string;
    committee: string | null;
    simpleSummary: string | null;
    topic: string | null;
  }[];
}) {
  return (
    <section className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
      <h2 className="mb-4 text-xl font-bold text-(--color-text-primary)">최근 법안</h2>
      <div className="space-y-3">
        {bills.map((b) => (
          <Link
            key={b.id}
            href={`/bills/${b.id}`}
            className="block rounded-lg bg-(--color-bg-secondary) p-3 no-underline transition-colors hover:bg-(--color-bg-tertiary)"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 flex-1 text-sm font-semibold text-(--color-text-primary)">
                {b.title}
              </p>
              {b.topic && (
                <span className="shrink-0 rounded-md bg-(--color-bg-tertiary) px-2 py-0.5 text-xs font-medium text-(--color-text-secondary)">
                  {b.topic}
                </span>
              )}
            </div>
            <div className="mt-1.5 flex items-center gap-2 text-xs text-(--color-text-tertiary)">
              <span>{b.proposerName}</span>
              <span className="ml-auto">{formatDate(b.proposedDate)}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
