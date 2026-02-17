"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronDownIcon } from "lucide-react";
import { useCongressSuspenseQuery, useCongressQuery } from "@/hooks/useCongressQuery";
import {
  getMember,
  getAttendance,
  getAbsenceDetails,
  getMonthlyAttendance,
  getMemberVotes,
} from "@/lib/api";
import DonutChart from "@/components/charts/DonutChart";
import BarChart from "@/components/charts/BarChart";
import ColorBadge from "@/components/ui/color-badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatPercent } from "@/lib/utils";
import { MEMBER_VOTE_RESULT_MAP, VOTE_RESULT_MAP } from "@/lib/constants";
import type { MemberVoteResult, MemberVoteRecord } from "@/types";

interface AttendanceDetailInnerProps {
  id: string;
  termId: number;
}

const resultFilters: { id: MemberVoteResult | null; label: string }[] = [
  { id: null, label: "전체" },
  { id: "yes", label: "찬성" },
  { id: "no", label: "반대" },
  { id: "abstain", label: "기권" },
  { id: "absent", label: "불참" },
];

function formatMonthLabel(yearMonth: string): string {
  const [y, m] = yearMonth.split("-");
  return `${y}년 ${parseInt(m, 10)}월`;
}

function formatMonthButton(yearMonth: string): string {
  const [y, m] = yearMonth.split("-");
  return `${y}.${parseInt(m, 10)}`;
}

function formatShortMonth(yearMonth: string): string {
  const [, m] = yearMonth.split("-");
  return `${parseInt(m, 10)}월`;
}

export default function AttendanceDetailInner({ id, termId }: AttendanceDetailInnerProps) {
  const { data: member } = useCongressSuspenseQuery(getMember, id);
  const { data: attendance } = useCongressSuspenseQuery(getAttendance, {
    memberId: id,
    termId,
  });
  const { data: absenceDetails } = useCongressSuspenseQuery(getAbsenceDetails, {
    memberId: id,
    termId,
  });
  const { data: monthlyAtt } = useCongressSuspenseQuery(getMonthlyAttendance, {
    memberId: id,
    termId,
  });

  // 가장 최근 월을 기본 선택
  const months = monthlyAtt.map((m) => m.month);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(
    months.length > 0 ? months[months.length - 1] : null,
  );
  const [selectedResult, setSelectedResult] = useState<MemberVoteResult | null>(null);
  // null = 전부 펼침(초기 상태), Set = 명시적으로 열린 날짜만 관리
  const [expandedDates, setExpandedDates] = useState<Set<string> | null>(null);

  // 선택된 월의 표결 데이터 (limit 100: 한 달 표결은 보통 50건 이하)
  const { data: votesData, isLoading: votesLoading } = useCongressQuery(
    getMemberVotes,
    {
      memberId: id,
      termId,
      limit: 100,
      ...(selectedMonth ? { month: selectedMonth } : {}),
      ...(selectedResult ? { result: selectedResult } : {}),
    },
    { enabled: !!selectedMonth },
  );

  // 날짜별 그루핑
  const votes = votesData?.votes;
  const votesByDate = useMemo(() => {
    if (!votes) return [];
    const map = new Map<string, MemberVoteRecord[]>();
    for (const vote of votes) {
      const list = map.get(vote.procDate) ?? [];
      list.push(vote);
      map.set(vote.procDate, list);
    }
    return [...map.entries()];
  }, [votes]);

  // 월 변경 시 전부 펼침 상태로 초기화
  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    setSelectedResult(null);
    setExpandedDates(null);
  };

  const isDateExpanded = (date: string) => {
    if (expandedDates === null) return true; // null = 전부 펼침
    return expandedDates.has(date);
  };

  const toggleDate = (date: string) => {
    setExpandedDates((prev) => {
      if (prev === null) {
        // 전부 펼침 → 해당 날짜만 접기 (나머지 모두 열림)
        const allDates = new Set(votesByDate.map(([d]) => d));
        allDates.delete(date);
        return allDates;
      }
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  };

  const expandAll = () => setExpandedDates(null);
  const collapseAll = () => setExpandedDates(new Set());

  if (!member) return notFound();

  // 선택된 월의 출석 통계
  const selectedMonthData = monthlyAtt.find((m) => m.month === selectedMonth);

  // 도넛 차트 데이터
  const chartData = attendance
    ? [
        { name: "출석", value: attendance.attended, color: "var(--color-status-present)" },
        {
          name: "결석",
          value: attendance.absent + attendance.leave + attendance.travel,
          color: "var(--color-status-absent)",
        },
      ]
    : [];

  // 월별 차트 데이터
  const barData = monthlyAtt.map((m) => ({
    month: formatShortMonth(m.month),
    출석: m.attended,
    결석: m.absent,
  }));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Link
        href={`/members/${id}?term=${termId}&tab=attendance`}
        className="inline-flex items-center gap-1 text-sm text-(--color-text-tertiary) no-underline hover:text-(--color-text-secondary)"
      >
        ← 의원 상세
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-(--color-text-primary)">
          {member.name} 의원 출석 현황
        </h1>
        <p className="text-sm text-(--color-text-tertiary)">제{termId}대 국회 본회의 출석 기록</p>
      </div>

      {/* 출석 요약 */}
      {attendance && (
        <>
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
              <p className="text-sm text-(--color-text-tertiary)">출석률</p>
            </div>
          </div>

          <div className="grid grid-cols-2 divide-x divide-y divide-(--color-border-primary) overflow-hidden rounded-xl border border-(--color-border-primary) sm:grid-cols-4">
            {[
              { label: "전체 회의", value: attendance.totalSessions },
              { label: "출석", value: attendance.attended },
              { label: "결석", value: attendance.absent },
              { label: "청가/출장", value: attendance.leave + attendance.travel },
            ].map((item) => (
              <div key={item.label} className="p-3 text-center">
                <p className="text-xl font-bold">{item.value}</p>
                <p className="text-xs text-(--color-text-tertiary)">{item.label}</p>
              </div>
            ))}
          </div>
        </>
      )}

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

      {/* 월별 상세 표결 내역 */}
      {months.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-(--color-text-tertiary)">
            월별 상세 표결 내역
          </h3>

          {/* 월 선택 */}
          <div className="scrollbar-none flex gap-2 overflow-x-auto">
            {[...months].reverse().map((month) => {
              const mData = monthlyAtt.find((m) => m.month === month);
              return (
                <Button
                  key={month}
                  variant={selectedMonth === month ? "chipActive" : "chip"}
                  size="sm"
                  onClick={() => handleMonthChange(month)}
                  className="shrink-0 rounded-full px-3 text-sm font-semibold"
                >
                  {formatMonthButton(month)}
                  {mData && (
                    <span className="ml-1 text-xs opacity-70">
                      ({mData.attended + mData.absent})
                    </span>
                  )}
                </Button>
              );
            })}
          </div>

          {/* 선택된 월 요약 */}
          {selectedMonth && selectedMonthData && (
            <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4">
              <h4 className="mb-2 text-base font-bold text-(--color-text-primary)">
                {formatMonthLabel(selectedMonth)}
              </h4>
              <div className="flex gap-4 text-sm">
                <span>
                  전체 <strong>{selectedMonthData.attended + selectedMonthData.absent}</strong>건
                </span>
                <span style={{ color: MEMBER_VOTE_RESULT_MAP.yes.color }}>
                  출석 <strong>{selectedMonthData.attended}</strong>
                </span>
                <span style={{ color: MEMBER_VOTE_RESULT_MAP.absent.color }}>
                  결석 <strong>{selectedMonthData.absent}</strong>
                </span>
              </div>
            </div>
          )}

          {/* 결과 필터 */}
          <div className="scrollbar-none flex gap-2 overflow-x-auto">
            {resultFilters.map((opt) => (
              <Button
                key={opt.id ?? "all"}
                variant={selectedResult === opt.id ? "chipActive" : "chip"}
                size="sm"
                onClick={() => setSelectedResult(opt.id)}
                className="shrink-0 rounded-full px-4 text-sm font-semibold"
              >
                {opt.label}
              </Button>
            ))}
          </div>

          <div className="flex items-baseline justify-between">
            <p className="text-sm text-(--color-text-tertiary)">
              {votesLoading
                ? "\u00A0"
                : `${selectedResult ? MEMBER_VOTE_RESULT_MAP[selectedResult].label : "전체"} ${(votesData?.total ?? 0).toLocaleString()}건`}
            </p>
            {!votesLoading && votesByDate.length > 1 && (
              <div className="flex items-baseline gap-2">
                <button
                  type="button"
                  onClick={expandAll}
                  className="min-h-0 min-w-0 text-xs text-(--color-text-tertiary) hover:text-(--color-text-secondary)"
                >
                  모두 펼치기
                </button>
                <span className="text-xs text-(--color-text-tertiary)">/</span>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="min-h-0 min-w-0 text-xs text-(--color-text-tertiary) hover:text-(--color-text-secondary)"
                >
                  모두 접기
                </button>
              </div>
            )}
          </div>

          {/* 날짜별 표결 목록 (아코디언) */}
          {votesLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl border border-(--color-border-primary) p-4"
                >
                  <div className="mb-2 h-5 w-3/4 rounded bg-(--color-bg-tertiary)" />
                  <div className="flex gap-2">
                    <div className="h-4 w-16 rounded bg-(--color-bg-tertiary)" />
                    <div className="h-4 w-12 rounded bg-(--color-bg-tertiary)" />
                  </div>
                </div>
              ))}
            </div>
          ) : votesByDate.length === 0 ? (
            <div className="py-8 text-center text-(--color-text-tertiary)">
              해당 표결 이력이 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {votesByDate.map(([date, votes]) => {
                const attended = votes.filter((v) => v.memberResult !== "absent").length;
                const absent = votes.filter((v) => v.memberResult === "absent").length;
                const expanded = isDateExpanded(date);
                return (
                  <div
                    key={date}
                    className="overflow-hidden rounded-xl border border-(--color-border-primary)"
                  >
                    {/* 날짜 헤더 (클릭으로 토글) */}
                    <button
                      type="button"
                      onClick={() => toggleDate(date)}
                      className="flex w-full cursor-pointer items-center justify-between bg-(--color-bg-secondary) px-4 py-2.5 transition-colors hover:bg-(--color-bg-tertiary)"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-(--color-text-primary)">
                          {formatDate(date)}
                        </span>
                        <div className="flex gap-2 text-xs font-medium">
                          <span style={{ color: MEMBER_VOTE_RESULT_MAP.yes.color }}>
                            참여 {attended}
                          </span>
                          {absent > 0 && (
                            <span style={{ color: MEMBER_VOTE_RESULT_MAP.absent.color }}>
                              불참 {absent}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronDownIcon
                        className={`h-4 w-4 shrink-0 text-(--color-text-tertiary) transition-transform ${expanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    {/* 해당 날짜의 표결 카드 */}
                    {expanded && (
                      <div className="divide-y divide-(--color-border-primary)">
                        {votes.map((vote) => {
                          const memberResultInfo = MEMBER_VOTE_RESULT_MAP[vote.memberResult];
                          const billResultInfo =
                            VOTE_RESULT_MAP[vote.resultCode] ?? VOTE_RESULT_MAP.other;
                          return (
                            <Link
                              key={vote.voteId}
                              href={`/votes/${vote.voteId}`}
                              className="block bg-(--color-bg-primary) px-4 py-3 no-underline transition-colors hover:bg-(--color-bg-hover)"
                            >
                              <div className="mb-1.5 flex items-start justify-between gap-2">
                                <h4 className="line-clamp-2 text-sm leading-snug font-semibold">
                                  {vote.billName}
                                </h4>
                                <div className="flex shrink-0 gap-1">
                                  <ColorBadge
                                    label={memberResultInfo.label}
                                    color={memberResultInfo.color}
                                    textColor={memberResultInfo.textColor}
                                    size="sm"
                                  />
                                  <ColorBadge
                                    label={billResultInfo.label}
                                    color={billResultInfo.color}
                                    textColor={billResultInfo.textColor}
                                    size="sm"
                                  />
                                </div>
                              </div>
                              {vote.committee && (
                                <span className="text-xs text-(--color-text-tertiary)">
                                  {vote.committee}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
