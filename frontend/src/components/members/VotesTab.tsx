"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { keepPreviousData } from "@tanstack/react-query";
import { useCongressQuery } from "@/hooks/useCongressQuery";
import { getMemberVotes } from "@/lib/api";
import { Button } from "@/components/ui/button";
import ColorBadge from "@/components/ui/color-badge";
import DonutChart from "@/components/charts/DonutChart";
import { VotesTabSkeleton } from "@/components/skeletons/TabSkeleton";
import { formatDate } from "@/lib/utils";
import { MEMBER_VOTE_RESULT_MAP, VOTE_RESULT_MAP } from "@/lib/constants";
import type { MemberVoteResult, MemberVoteRecord } from "@/types";

interface VotesTabProps {
  memberId: string;
  termId: number;
}

const resultFilters: { id: MemberVoteResult | null; label: string }[] = [
  { id: null, label: "전체" },
  { id: "yes", label: "찬성" },
  { id: "no", label: "반대" },
  { id: "abstain", label: "기권" },
  { id: "absent", label: "불참" },
];

function getYearMonth(dateStr: string) {
  return dateStr.slice(0, 7);
}

function formatYearMonth(ym: string) {
  const [year, month] = ym.split("-");
  return `${year}년 ${Number(month)}월`;
}

export default function VotesTab({ memberId, termId }: VotesTabProps) {
  const [selectedResult, setSelectedResult] = useState<MemberVoteResult | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const { data, isFetching } = useCongressQuery(
    getMemberVotes,
    {
      memberId,
      termId,
      limit: 100,
      result: selectedResult ?? undefined,
      month: selectedMonth ?? undefined,
    },
    { placeholderData: keepPreviousData },
  );

  const months = data?.months ?? [];
  const votes = data?.votes ?? [];
  const summary = data?.summary ?? { yes: 0, no: 0, abstain: 0, absent: 0, total: 0 };
  const total = data?.total ?? 0;

  const grouped = useMemo(() => {
    const map = new Map<string, MemberVoteRecord[]>();
    for (const vote of votes) {
      const ym = getYearMonth(vote.procDate);
      const list = map.get(ym) ?? [];
      list.push(vote);
      map.set(ym, list);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // 초기 로딩 중에는 스켈레톤 표시 (데이터 도착 전 "없습니다" 깜빡임 방지)
  if (!data) return <VotesTabSkeleton />;

  if (summary.total === 0) {
    return (
      <div className="py-8 text-center text-(--color-text-tertiary)">표결 이력이 없습니다.</div>
    );
  }

  const chartData = [
    { name: "찬성", value: summary.yes, color: MEMBER_VOTE_RESULT_MAP.yes.color },
    { name: "반대", value: summary.no, color: MEMBER_VOTE_RESULT_MAP.no.color },
    { name: "기권", value: summary.abstain, color: MEMBER_VOTE_RESULT_MAP.abstain.color },
    { name: "불참", value: summary.absent, color: MEMBER_VOTE_RESULT_MAP.absent.color },
  ];

  return (
    <div className="space-y-4 py-4" role="tabpanel">
      {/* 요약 도넛 차트 */}
      <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4">
        <div className="flex items-center gap-4 sm:gap-6">
          <DonutChart data={chartData} centerLabel={String(summary.total)} size={140} />
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:gap-x-6">
            {chartData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 sm:gap-2">
                <div
                  className="h-2.5 w-2.5 shrink-0 rounded-full sm:h-3 sm:w-3"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-xs whitespace-nowrap text-(--color-text-secondary) sm:text-sm">
                  {d.name}
                </span>
                <span className="text-xs font-bold whitespace-nowrap sm:text-sm">{d.value}건</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 결과 필터 */}
      <div className="scrollbar-none flex gap-2 overflow-x-auto">
        {resultFilters.map((opt) => (
          <Button
            key={opt.id ?? "all"}
            variant={selectedResult === opt.id ? "chipActive" : "chip"}
            size="sm"
            onClick={() => {
              setSelectedResult(opt.id);
              setSelectedMonth(null);
            }}
            className="shrink-0 rounded-full px-4 text-sm font-semibold"
          >
            {opt.label}
          </Button>
        ))}
      </div>

      <p className="text-sm text-(--color-text-tertiary)">
        {selectedResult ? MEMBER_VOTE_RESULT_MAP[selectedResult].label : "전체"} {total}건
      </p>

      {/* 월별 필터 */}
      {months.length > 1 && (
        <div className="scrollbar-none flex gap-1.5 overflow-x-auto">
          <Button
            variant={selectedMonth === null ? "chipActive" : "chip"}
            size="xs"
            onClick={() => setSelectedMonth(null)}
            className="shrink-0 rounded-full px-3 text-xs font-semibold"
          >
            전체
          </Button>
          {months.map((m) => (
            <Button
              key={m.month}
              variant={selectedMonth === m.month ? "chipActive" : "chip"}
              size="xs"
              onClick={() => setSelectedMonth(m.month)}
              className="shrink-0 rounded-full px-3 text-xs font-semibold"
            >
              {formatYearMonth(m.month)} ({m.count})
            </Button>
          ))}
        </div>
      )}

      {/* 월별 그룹 표결 목록 */}
      <div
        className={`space-y-4 transition-opacity duration-200 ${isFetching ? "opacity-50" : ""}`}
      >
        {votes.length === 0 ? (
          <div className="py-8 text-center text-(--color-text-tertiary)">
            해당 표결 이력이 없습니다.
          </div>
        ) : (
          grouped.map(([ym, groupVotes]) => (
            <div key={ym}>
              {!selectedMonth && (
                <h4 className="mb-2 text-sm font-semibold text-(--color-text-secondary)">
                  {formatYearMonth(ym)} ({groupVotes.length}건)
                </h4>
              )}
              <div className="divide-y divide-(--color-border-primary) overflow-hidden rounded-xl border border-(--color-border-primary)">
                {groupVotes.map((vote) => {
                  const memberResultInfo = MEMBER_VOTE_RESULT_MAP[vote.memberResult];
                  const billResultInfo = VOTE_RESULT_MAP[vote.resultCode] ?? VOTE_RESULT_MAP.other;
                  return (
                    <Link
                      key={vote.voteId}
                      href={`/votes/${vote.voteId}`}
                      className="block bg-(--color-bg-primary) p-4 no-underline transition-colors hover:bg-(--color-bg-hover)"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
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
                      <div className="flex items-center gap-3 text-xs text-(--color-text-tertiary)">
                        <span>{formatDate(vote.procDate)}</span>
                        {vote.committee && <span>{vote.committee}</span>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <Link
        href={`/votes?term=${termId}`}
        className="inline-flex items-center gap-1 rounded-lg bg-(--color-bg-secondary) px-4 py-3 text-base font-semibold text-(--color-member-accent) no-underline transition-colors hover:bg-(--color-bg-tertiary)"
      >
        전체 표결 보기 →
      </Link>
    </div>
  );
}
