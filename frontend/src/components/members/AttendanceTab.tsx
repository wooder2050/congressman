"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDownIcon } from "lucide-react";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getAttendance, getAbsenceDetails, getMonthlyAttendance, getMemberVotes } from "@/lib/api";
import DonutChart from "@/components/charts/DonutChart";
import BarChart from "@/components/charts/BarChart";
import ColorBadge from "@/components/ui/color-badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatPercent } from "@/lib/utils";
import { MEMBER_VOTE_RESULT_MAP } from "@/lib/constants";
import MetricHint from "@/components/ui/metric-hint";
import { METRIC_DEFINITIONS } from "@/constants/metrics";
import type { MemberVoteRecord } from "@/types";

interface AttendanceTabProps {
  memberId: string;
  termId: number;
}

function formatMonth(month: string): string {
  const [, m] = month.split("-");
  return `${parseInt(m, 10)}월`;
}

const INITIAL_VOTE_DATES = 3;

export default function AttendanceTab({ memberId, termId }: AttendanceTabProps) {
  const { data: attendance } = useCongressSuspenseQuery(getAttendance, { memberId, termId });
  const { data: absenceDetails } = useCongressSuspenseQuery(getAbsenceDetails, {
    memberId,
    termId,
  });
  const { data: monthlyAtt } = useCongressSuspenseQuery(getMonthlyAttendance, { memberId, termId });
  const { data: recentVotesData } = useCongressSuspenseQuery(getMemberVotes, {
    memberId,
    termId,
    limit: 20,
  });

  const recentVotes = recentVotesData.votes;
  const [votesExpanded, setVotesExpanded] = useState(false);

  if (!attendance) {
    return (
      <div className="py-8 text-center text-(--color-text-tertiary)">출석 데이터가 없습니다.</div>
    );
  }

  const chartData = [
    { name: "출석", value: attendance.attended, color: "var(--color-status-present)" },
    {
      name: "결석",
      value: attendance.absent + attendance.leave + attendance.travel,
      color: "var(--color-status-absent)",
    },
  ];

  // 월별 차트 데이터
  const barData = monthlyAtt.map((m) => ({
    month: formatMonth(m.month),
    출석: m.attended,
    결석: m.absent,
  }));

  // 표결 타임라인: 날짜별 그루핑
  const votesByDate = new Map<string, MemberVoteRecord[]>();
  for (const vote of recentVotes) {
    const list = votesByDate.get(vote.procDate) ?? [];
    list.push(vote);
    votesByDate.set(vote.procDate, list);
  }
  const allDateEntries = [...votesByDate.entries()];
  const visibleDateEntries = votesExpanded
    ? allDateEntries
    : allDateEntries.slice(0, INITIAL_VOTE_DATES);
  const hasMoreDates = allDateEntries.length > INITIAL_VOTE_DATES;

  return (
    <div className="space-y-6 py-4" role="tabpanel">
      {/* 출석률 큰 숫자 + 도넛 */}
      <div className="flex items-center gap-6">
        <DonutChart data={chartData} centerLabel={formatPercent(attendance.rate)} />
        <div>
          <p
            className="text-3xl font-bold"
            style={{
              color:
                attendance.rate >= 90
                  ? "var(--color-status-present)"
                  : attendance.rate >= 80
                    ? "var(--color-status-pending)"
                    : "var(--color-status-absent)",
            }}
          >
            {formatPercent(attendance.rate)}
          </p>
          <p className="text-sm text-(--color-text-tertiary)">
            출석률
            <MetricHint text={METRIC_DEFINITIONS.attendanceRate} />
          </p>
        </div>
      </div>

      {/* 요약 */}
      <div className="grid grid-cols-2 divide-x divide-y divide-(--color-border-primary) overflow-hidden rounded-xl border border-(--color-border-primary) sm:grid-cols-4">
        {[
          {
            label: "전체 회의",
            value: attendance.totalSessions,
            hint: METRIC_DEFINITIONS.totalSessions,
          },
          { label: "출석", value: attendance.attended },
          { label: "결석", value: attendance.absent, hint: METRIC_DEFINITIONS.absent },
          { label: "청가/출장", value: attendance.leave + attendance.travel },
        ].map((item) => (
          <div key={item.label} className="p-3 text-center">
            <p className="text-xl font-bold">{item.value}</p>
            <p className="text-xs text-(--color-text-tertiary)">
              {item.label}
              {"hint" in item && item.hint && <MetricHint text={item.hint} />}
            </p>
          </div>
        ))}
      </div>

      {/* 출석 상세 보기 링크 */}
      <Link
        href={`/members/${memberId}/attendance?term=${termId}`}
        className="inline-flex items-center gap-1 rounded-lg bg-(--color-bg-secondary) px-4 py-3 text-base font-semibold text-(--color-member-accent) no-underline transition-colors hover:bg-(--color-bg-tertiary)"
      >
        출석 상세 보기 →
      </Link>

      {/* 결석 유형 */}
      {absenceDetails.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-(--color-text-tertiary)">결석 유형별</h3>
          <div className="divide-y divide-(--color-border-primary) overflow-hidden rounded-xl border border-(--color-border-primary)">
            {absenceDetails.map((detail) => (
              <div key={detail.type} className="flex items-center justify-between px-4 py-3">
                <span className="text-base">{detail.type}</span>
                <span className="text-lg font-bold">{detail.count}회</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 월별 출석 추이 */}
      {barData.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-(--color-text-tertiary)">
            월별 출석 추이
          </h3>
          <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4">
            <BarChart
              data={barData}
              xKey="month"
              bars={[
                { dataKey: "출석", color: "var(--color-status-present)", label: "출석" },
                { dataKey: "결석", color: "var(--color-status-absent)", label: "결석" },
              ]}
              height={200}
            />
          </div>
        </div>
      )}

      {/* 표결 참여 타임라인 */}
      {votesByDate.size > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-(--color-text-tertiary)">
            최근 표결 참여 내역
          </h3>
          <div className="divide-y divide-(--color-border-primary) overflow-hidden rounded-xl border border-(--color-border-primary)">
            {visibleDateEntries.map(([date, votes]) => {
              const attended = votes.filter((v) => v.memberResult !== "absent").length;
              const absent = votes.filter((v) => v.memberResult === "absent").length;
              return (
                <div key={date} className="bg-(--color-bg-primary) p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-(--color-text-primary)">
                      {formatDate(date)}
                    </span>
                    <div className="flex gap-2 text-xs">
                      <span className="text-(--color-vote-yes)">참여 {attended}</span>
                      {absent > 0 && (
                        <span className="text-(--color-vote-absent)">불참 {absent}</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    {votes.map((vote) => {
                      const resultInfo = MEMBER_VOTE_RESULT_MAP[vote.memberResult];
                      return (
                        <Link
                          key={vote.voteId}
                          href={`/votes/${vote.voteId}`}
                          className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs no-underline transition-colors hover:bg-(--color-bg-hover)"
                        >
                          <span className="line-clamp-1 min-w-0 flex-1 text-(--color-text-secondary)">
                            {vote.billName}
                          </span>
                          <ColorBadge
                            label={resultInfo.label}
                            color={resultInfo.color}
                            textColor={resultInfo.textColor}
                            size="sm"
                          />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          {hasMoreDates && !votesExpanded && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setVotesExpanded(true)}
              className="mt-2 w-full text-sm"
            >
              <ChevronDownIcon className="size-4" />
              나머지 {allDateEntries.length - INITIAL_VOTE_DATES}일 더보기
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
