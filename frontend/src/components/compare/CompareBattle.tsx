"use client";

import { useQueries } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { getAttendance, getBills, getMemberVotes } from "@/lib/api";
import { formatPercent } from "@/lib/utils";
import MetricHint from "@/components/ui/metric-hint";
import { METRIC_DEFINITIONS } from "@/constants/metrics";
import type { MemberWithTerm, AttendanceRecord, MemberVotesResponse } from "@/types";

interface CompareBattleProps {
  left: MemberWithTerm;
  right: MemberWithTerm;
  termId: number;
}

export default function CompareBattle({ left, right, termId }: CompareBattleProps) {
  const members = [left, right] as const;

  const attendanceResults = useQueries({
    queries: members.map((m) => ({
      queryKey: ["attendance", JSON.stringify({ memberId: m.id, termId })],
      queryFn: () => getAttendance({ memberId: m.id, termId }),
    })),
  });

  const repBillResults = useQueries({
    queries: members.map((m) => ({
      queryKey: [
        "bills",
        JSON.stringify({ termId, memberId: m.id, role: "representative", limit: 1 }),
      ],
      queryFn: () => getBills({ termId, memberId: m.id, role: "representative", limit: 1 }),
    })),
  });

  const coBillResults = useQueries({
    queries: members.map((m) => ({
      queryKey: ["bills", JSON.stringify({ termId, memberId: m.id, role: "co", limit: 1 })],
      queryFn: () => getBills({ termId, memberId: m.id, role: "co", limit: 1 }),
    })),
  });

  const voteResults = useQueries({
    queries: members.map((m) => ({
      queryKey: ["memberVotes", JSON.stringify({ memberId: m.id, termId, limit: 1 })],
      queryFn: () => getMemberVotes({ memberId: m.id, termId, limit: 1 }),
    })),
  });

  const isLoading =
    attendanceResults.some((q) => q.isLoading) ||
    repBillResults.some((q) => q.isLoading) ||
    coBillResults.some((q) => q.isLoading) ||
    voteResults.some((q) => q.isLoading);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-(--color-bg-tertiary)" />
        ))}
      </div>
    );
  }

  const leftAttendance = (attendanceResults[0].data as AttendanceRecord | null)?.rate ?? 0;
  const rightAttendance = (attendanceResults[1].data as AttendanceRecord | null)?.rate ?? 0;

  const leftRepBills = (repBillResults[0].data as { total: number } | undefined)?.total ?? 0;
  const rightRepBills = (repBillResults[1].data as { total: number } | undefined)?.total ?? 0;
  const leftCoBills = (coBillResults[0].data as { total: number } | undefined)?.total ?? 0;
  const rightCoBills = (coBillResults[1].data as { total: number } | undefined)?.total ?? 0;

  const leftVoteData = voteResults[0].data as MemberVotesResponse | undefined;
  const rightVoteData = voteResults[1].data as MemberVotesResponse | undefined;

  const getVoteParticipation = (data: MemberVotesResponse | undefined) => {
    const s = data?.summary;
    if (!s) return { rate: 0, participated: 0, total: 0 };
    const total = s.yes + s.no + s.abstain + s.absent;
    const participated = s.yes + s.no + s.abstain;
    return { rate: total > 0 ? (participated / total) * 100 : 0, participated, total };
  };

  const leftVote = getVoteParticipation(leftVoteData);
  const rightVote = getVoteParticipation(rightVoteData);

  const leftSummary = leftVoteData?.summary;
  const rightSummary = rightVoteData?.summary;

  const scoreLeft =
    (leftAttendance > rightAttendance ? 1 : 0) +
    (leftRepBills > rightRepBills ? 1 : 0) +
    (leftCoBills > rightCoBills ? 1 : 0) +
    (leftVote.rate > rightVote.rate ? 1 : 0);
  const scoreRight =
    (rightAttendance > leftAttendance ? 1 : 0) +
    (rightRepBills > leftRepBills ? 1 : 0) +
    (rightCoBills > leftCoBills ? 1 : 0) +
    (rightVote.rate > leftVote.rate ? 1 : 0);

  const leftColor = left.term.party.color;
  const rightColor = right.term.party.color;

  return (
    <div className="space-y-3">
      {/* 종합 스코어 */}
      <div className="relative overflow-hidden rounded-2xl border border-(--color-border-primary) bg-(--color-bg-secondary) py-5">
        <div className="flex items-center justify-center gap-6">
          <div className="text-center">
            <p className="text-xs font-medium text-(--color-text-tertiary)">{left.name}</p>
            <p
              className="mt-1 text-3xl font-black tabular-nums sm:text-5xl"
              style={{ color: leftColor }}
            >
              <AnimatedNumber value={scoreLeft} />
            </p>
          </div>
          <div className="text-lg font-black text-(--color-text-tertiary)">:</div>
          <div className="text-center">
            <p className="text-xs font-medium text-(--color-text-tertiary)">{right.name}</p>
            <p
              className="mt-1 text-3xl font-black tabular-nums sm:text-5xl"
              style={{ color: rightColor }}
            >
              <AnimatedNumber value={scoreRight} />
            </p>
          </div>
        </div>
        {/* 하단 장식 바 */}
        <div className="mt-4 flex h-1.5 gap-0.5 px-4">
          <div
            className="flex-1 rounded-l-full transition-opacity duration-500"
            style={{ backgroundColor: leftColor, opacity: scoreLeft >= scoreRight ? 1 : 0.2 }}
          />
          <div
            className="flex-1 rounded-r-full transition-opacity duration-500"
            style={{ backgroundColor: rightColor, opacity: scoreRight >= scoreLeft ? 1 : 0.2 }}
          />
        </div>
      </div>

      {/* 출석률 */}
      <BattleRow
        label="출석률"
        hint={METRIC_DEFINITIONS.attendanceRate}
        leftValue={leftAttendance}
        rightValue={rightAttendance}
        leftLabel={formatPercent(leftAttendance)}
        rightLabel={formatPercent(rightAttendance)}
        leftColor={leftColor}
        rightColor={rightColor}
        maxValue={100}
      />

      {/* 대표발의 */}
      <BattleRow
        label="대표발의"
        leftValue={leftRepBills}
        rightValue={rightRepBills}
        leftLabel={`${leftRepBills}건`}
        rightLabel={`${rightRepBills}건`}
        leftColor={leftColor}
        rightColor={rightColor}
        maxValue={Math.max(leftRepBills, rightRepBills, 1)}
      />

      {/* 공동발의 */}
      <BattleRow
        label="공동발의"
        leftValue={leftCoBills}
        rightValue={rightCoBills}
        leftLabel={`${leftCoBills}건`}
        rightLabel={`${rightCoBills}건`}
        leftColor={leftColor}
        rightColor={rightColor}
        maxValue={Math.max(leftCoBills, rightCoBills, 1)}
      />

      {/* 표결 참여 */}
      <BattleRow
        label="표결 참여"
        leftValue={leftVote.rate}
        rightValue={rightVote.rate}
        leftLabel={formatPercent(leftVote.rate)}
        rightLabel={formatPercent(rightVote.rate)}
        leftSubLabel={`${leftVote.participated}/${leftVote.total}`}
        rightSubLabel={`${rightVote.participated}/${rightVote.total}`}
        leftColor={leftColor}
        rightColor={rightColor}
        maxValue={100}
      />

      {/* 표결 성향 */}
      {leftSummary && rightSummary && (
        <VoteTendency
          left={left}
          right={right}
          leftSummary={leftSummary}
          rightSummary={rightSummary}
        />
      )}
    </div>
  );
}

/* 숫자 카운팅 애니메이션 */
function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    const start = display;
    const diff = value - start;
    if (diff === 0) return;
    const duration = 600;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) ref.current = requestAnimationFrame(tick);
    }

    ref.current = requestAnimationFrame(tick);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <>{display}</>;
}

function BattleRow({
  label,
  hint,
  leftValue,
  rightValue,
  leftLabel,
  rightLabel,
  leftSubLabel,
  rightSubLabel,
  leftColor,
  rightColor,
  maxValue,
}: {
  label: string;
  hint?: string;
  leftValue: number;
  rightValue: number;
  leftLabel: string;
  rightLabel: string;
  leftSubLabel?: string;
  rightSubLabel?: string;
  leftColor: string;
  rightColor: string;
  maxValue: number;
}) {
  const leftWidth = maxValue > 0 ? (leftValue / maxValue) * 100 : 0;
  const rightWidth = maxValue > 0 ? (rightValue / maxValue) * 100 : 0;
  const leftWins = leftValue > rightValue;
  const rightWins = rightValue > leftValue;

  return (
    <div className="rounded-xl border border-(--color-border-primary) p-3 sm:p-4">
      <p className="mb-2 text-center text-[10px] font-bold tracking-wider text-(--color-text-tertiary) uppercase">
        {label}
        {hint && <MetricHint text={hint} />}
      </p>

      {/* 숫자 */}
      <div className="mb-2 flex items-end justify-between">
        <div className={`transition-opacity duration-500 ${rightWins ? "opacity-35" : ""}`}>
          <span
            className="text-sm font-black tabular-nums sm:text-xl"
            style={{ color: leftWins ? leftColor : "var(--color-text-primary)" }}
          >
            {leftLabel}
          </span>
          {leftSubLabel && (
            <span className="ml-1 text-[10px] text-(--color-text-tertiary) sm:text-xs">
              {leftSubLabel}
            </span>
          )}
        </div>
        <div
          className={`text-right transition-opacity duration-500 ${leftWins ? "opacity-35" : ""}`}
        >
          <span
            className="text-sm font-black tabular-nums sm:text-xl"
            style={{ color: rightWins ? rightColor : "var(--color-text-primary)" }}
          >
            {rightLabel}
          </span>
          {rightSubLabel && (
            <span className="ml-1 text-[10px] text-(--color-text-tertiary) sm:text-xs">
              {rightSubLabel}
            </span>
          )}
        </div>
      </div>

      {/* 양쪽 바 */}
      <div className="flex items-center gap-0.5">
        <div className="flex h-5 flex-1 justify-end overflow-hidden rounded-l-full bg-(--color-bg-tertiary) sm:h-6">
          <div
            className="h-full rounded-l-full transition-all duration-1000 ease-out"
            style={{
              width: `${Math.max(leftWidth, 3)}%`,
              background: leftWins
                ? `linear-gradient(to left, ${leftColor}, ${leftColor}bb)`
                : `${leftColor}40`,
              boxShadow: leftWins ? `0 0 12px ${leftColor}30` : "none",
            }}
          />
        </div>
        <div className="flex h-5 flex-1 justify-start overflow-hidden rounded-r-full bg-(--color-bg-tertiary) sm:h-6">
          <div
            className="h-full rounded-r-full transition-all duration-1000 ease-out"
            style={{
              width: `${Math.max(rightWidth, 3)}%`,
              background: rightWins
                ? `linear-gradient(to right, ${rightColor}, ${rightColor}bb)`
                : `${rightColor}40`,
              boxShadow: rightWins ? `0 0 12px ${rightColor}30` : "none",
            }}
          />
        </div>
      </div>

      {/* 승패 표시 */}
      <div className="mt-1.5 flex items-center justify-between">
        {leftWins ? (
          <span
            className="text-[10px] font-black tracking-widest uppercase"
            style={{ color: leftColor }}
          >
            WIN
          </span>
        ) : (
          <span />
        )}
        {rightWins ? (
          <span
            className="text-[10px] font-black tracking-widest uppercase"
            style={{ color: rightColor }}
          >
            WIN
          </span>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}

function VoteTendency({
  left,
  right,
  leftSummary,
  rightSummary,
}: {
  left: MemberWithTerm;
  right: MemberWithTerm;
  leftSummary: { yes: number; no: number; abstain: number; absent: number };
  rightSummary: { yes: number; no: number; abstain: number; absent: number };
}) {
  const categories = [
    { key: "yes", label: "찬성", colorVar: "--color-vote-yes" },
    { key: "no", label: "반대", colorVar: "--color-vote-no" },
    { key: "abstain", label: "기권", colorVar: "--color-vote-abstain" },
    { key: "absent", label: "불참", color: "#9ca3af" },
  ] as const;

  return (
    <div className="rounded-xl border border-(--color-border-primary) p-3 sm:p-4">
      <p className="mb-4 text-center text-xs font-bold tracking-wider text-(--color-text-tertiary) uppercase">
        표결 성향
      </p>
      <div className="space-y-3">
        {categories.map((cat) => {
          const leftVal = leftSummary[cat.key];
          const rightVal = rightSummary[cat.key];
          const maxVal = Math.max(leftVal, rightVal, 1);
          const leftWidth = (leftVal / maxVal) * 100;
          const rightWidth = (rightVal / maxVal) * 100;
          const catColor = "colorVar" in cat ? `var(${cat.colorVar})` : cat.color;

          return (
            <div key={cat.key}>
              <p
                className="mb-1 text-center text-[10px] font-bold tracking-wider uppercase"
                style={{ color: catColor }}
              >
                {cat.label}
              </p>
              <div className="flex items-center gap-0.5">
                <span className="w-7 text-right text-[10px] font-bold text-(--color-text-primary) tabular-nums sm:w-12 sm:text-xs">
                  {leftVal}
                </span>
                <div className="flex h-4 flex-1 justify-end overflow-hidden rounded-l-full bg-(--color-bg-tertiary)">
                  <div
                    className="h-full rounded-l-full transition-all duration-700"
                    style={{
                      width: `${Math.max(leftWidth, 3)}%`,
                      backgroundColor: left.term.party.color,
                      opacity: leftVal >= rightVal ? 1 : 0.3,
                    }}
                  />
                </div>
                <div className="flex h-4 flex-1 justify-start overflow-hidden rounded-r-full bg-(--color-bg-tertiary)">
                  <div
                    className="h-full rounded-r-full transition-all duration-700"
                    style={{
                      width: `${Math.max(rightWidth, 3)}%`,
                      backgroundColor: right.term.party.color,
                      opacity: rightVal >= leftVal ? 1 : 0.3,
                    }}
                  />
                </div>
                <span className="w-7 text-left text-[10px] font-bold text-(--color-text-primary) tabular-nums sm:w-12 sm:text-xs">
                  {rightVal}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
