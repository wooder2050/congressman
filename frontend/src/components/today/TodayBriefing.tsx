"use client";

import Link from "next/link";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getTodayBriefing } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { formatDate } from "@/lib/utils";
import type { Schedule, Vote, BillSummaryItem } from "@/types";

interface TodayBriefingProps {
  termId: number;
}

export default function TodayBriefing({ termId }: TodayBriefingProps) {
  const { data } = useCongressSuspenseQuery(getTodayBriefing, termId);
  const { user } = useAuth();
  const { data: prefs } = useUserPreferences();

  const interests = prefs?.interests ?? [];
  const district = prefs?.district ?? null;
  const bookmarkedMembers = prefs?.bookmarkedMembers ?? [];

  const interestBills = (() => {
    if (!user || interests.length === 0 || !data?.recentBills) return [];
    return data.recentBills.filter((b) => b.topic && interests.includes(b.topic));
  })();

  const bookmarkedMemberVotes = (() => {
    if (!user || bookmarkedMembers.length === 0 || !data?.recentVotes) return [];
    return data.recentVotes;
  })();

  if (!data) return null;

  const hasSchedules = data.schedules.length > 0;
  const hasVotes = data.recentVotes.length > 0;
  const hasBills = data.recentBills.length > 0;
  const hasPersonalized =
    interestBills.length > 0 || (district && hasBills) || bookmarkedMemberVotes.length > 0;
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
      {/* 개인화 섹션 (로그인 사용자만) */}
      {user && hasPersonalized && (
        <div className="space-y-6">
          {interestBills.length > 0 && (
            <InterestBillsSection bills={interestBills} interests={interests} />
          )}
          {district && <DistrictSection district={district} />}
          {bookmarkedMembers.length > 0 && bookmarkedMemberVotes.length > 0 && (
            <BookmarkedVotesSection votes={bookmarkedMemberVotes} />
          )}
        </div>
      )}

      {hasSchedules && <ScheduleSection schedules={data.schedules} />}
      {hasVotes && <VoteSection votes={data.recentVotes} />}
      {hasBills && <BillSection bills={data.recentBills} />}
    </div>
  );
}

function InterestBillsSection({
  bills,
  interests,
}: {
  bills: BillSummaryItem[];
  interests: string[];
}) {
  return (
    <section className="rounded-xl border border-blue-200 bg-blue-50/50 p-5 dark:border-blue-800/40 dark:bg-blue-950/20">
      <h2 className="mb-1 text-xl font-bold text-(--color-text-primary)">내 관심 이슈</h2>
      <p className="mb-4 text-xs text-(--color-text-tertiary)">
        {interests.join(", ")} 관련 최근 법안
      </p>
      <div className="space-y-3">
        {bills.slice(0, 5).map((b) => (
          <Link
            key={b.id}
            href={`/bills/${b.id}`}
            className="block rounded-lg bg-(--color-bg-primary) p-3 no-underline transition-colors hover:bg-(--color-bg-secondary)"
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

function DistrictSection({ district }: { district: string }) {
  return (
    <section className="rounded-xl border border-green-200 bg-green-50/50 p-5 dark:border-green-800/40 dark:bg-green-950/20">
      <h2 className="mb-1 text-xl font-bold text-(--color-text-primary)">내 지역구</h2>
      <p className="mb-3 text-sm text-(--color-text-secondary)">{district}</p>
      <Link
        href="/district"
        className="inline-flex items-center gap-1 text-sm font-semibold text-(--color-primary) no-underline hover:underline"
      >
        지역구 리포트 보기 →
      </Link>
    </section>
  );
}

function BookmarkedVotesSection({ votes }: { votes: Vote[] }) {
  return (
    <section className="rounded-xl border border-purple-200 bg-purple-50/50 p-5 dark:border-purple-800/40 dark:bg-purple-950/20">
      <h2 className="mb-4 text-xl font-bold text-(--color-text-primary)">관심 의원 관련 표결</h2>
      <div className="space-y-3">
        {votes.slice(0, 3).map((v) => (
          <Link
            key={v.id}
            href={`/votes/${v.id}`}
            className="block rounded-lg bg-(--color-bg-primary) p-3 no-underline transition-colors hover:bg-(--color-bg-secondary)"
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

function BillSection({ bills }: { bills: BillSummaryItem[] }) {
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
