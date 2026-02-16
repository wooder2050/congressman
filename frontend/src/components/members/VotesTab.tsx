"use client";

import { useState } from "react";
import Link from "next/link";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getMemberVotes } from "@/lib/api";
import { Button } from "@/components/ui/button";
import ColorBadge from "@/components/ui/color-badge";
import DonutChart from "@/components/charts/DonutChart";
import { formatDate } from "@/lib/utils";
import { MEMBER_VOTE_RESULT_MAP, VOTE_RESULT_MAP } from "@/lib/constants";
import type { MemberVoteResult } from "@/types";

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

export default function VotesTab({ memberId, termId }: VotesTabProps) {
  const [selectedResult, setSelectedResult] = useState<MemberVoteResult | null>(null);

  const { data } = useCongressSuspenseQuery(getMemberVotes, {
    memberId,
    termId,
    limit: 100,
    result: selectedResult ?? undefined,
  });

  if (data.summary.total === 0) {
    return (
      <div className="py-8 text-center text-(--color-text-tertiary)">표결 이력이 없습니다.</div>
    );
  }

  const chartData = [
    { name: "찬성", value: data.summary.yes, color: MEMBER_VOTE_RESULT_MAP.yes.color },
    { name: "반대", value: data.summary.no, color: MEMBER_VOTE_RESULT_MAP.no.color },
    { name: "기권", value: data.summary.abstain, color: MEMBER_VOTE_RESULT_MAP.abstain.color },
    { name: "불참", value: data.summary.absent, color: MEMBER_VOTE_RESULT_MAP.absent.color },
  ];

  return (
    <div className="space-y-4 py-4" role="tabpanel">
      {/* 요약 도넛 차트 */}
      <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4">
        <div className="flex items-center gap-4 sm:gap-6">
          <DonutChart data={chartData} centerLabel={String(data.summary.total)} size={140} />
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:gap-x-6">
            {chartData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 sm:gap-2">
                <div
                  className="h-2.5 w-2.5 shrink-0 rounded-full sm:h-3 sm:w-3"
                  style={{ backgroundColor: d.color }}
                />
                <span className="whitespace-nowrap text-xs text-(--color-text-secondary) sm:text-sm">
                  {d.name}
                </span>
                <span className="whitespace-nowrap text-xs font-bold sm:text-sm">{d.value}건</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 필터 버튼 */}
      <div className="flex flex-wrap gap-2">
        {resultFilters.map((opt) => (
          <Button
            key={opt.id ?? "all"}
            variant={selectedResult === opt.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedResult(opt.id)}
            className="rounded-full px-4 text-sm font-semibold"
          >
            {opt.label}
          </Button>
        ))}
      </div>

      <p className="text-sm text-(--color-text-tertiary)">
        {selectedResult ? MEMBER_VOTE_RESULT_MAP[selectedResult].label : "전체"} {data.total}건
      </p>

      {/* 표결 목록 */}
      {data.votes.length === 0 ? (
        <div className="py-8 text-center text-(--color-text-tertiary)">
          해당 표결 이력이 없습니다.
        </div>
      ) : (
        <div className="divide-y divide-(--color-border-primary) overflow-hidden rounded-xl border border-(--color-border-primary)">
          {data.votes.map((vote) => {
            const memberResultInfo = MEMBER_VOTE_RESULT_MAP[vote.memberResult];
            const billResultInfo = VOTE_RESULT_MAP[vote.resultCode] ?? VOTE_RESULT_MAP.other;
            return (
              <div key={vote.voteId} className="bg-(--color-bg-primary) p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h4 className="line-clamp-2 text-sm leading-snug font-semibold">
                    {vote.billName}
                  </h4>
                  <div className="flex shrink-0 gap-1">
                    <ColorBadge
                      label={memberResultInfo.label}
                      color={memberResultInfo.color}
                      size="sm"
                    />
                    <ColorBadge
                      label={billResultInfo.label}
                      color={billResultInfo.color}
                      size="sm"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-(--color-text-tertiary)">
                  <span>{formatDate(vote.procDate)}</span>
                  {vote.committee && <span>{vote.committee}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Link
        href={`/votes?term=${termId}`}
        className="inline-flex items-center gap-1 rounded-lg bg-(--color-bg-secondary) px-4 py-3 text-base font-semibold text-(--color-primary) no-underline transition-colors hover:bg-(--color-bg-tertiary)"
      >
        전체 표결 보기 →
      </Link>
    </div>
  );
}
