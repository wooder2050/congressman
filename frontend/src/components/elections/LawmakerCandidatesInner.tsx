"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getLawmakerCandidates } from "@/lib/api";
import type { LawmakerCandidate } from "@/lib/api";

type SortKey = "attendance" | "vote" | "bills" | "passRate" | "asset";

function formatAsset(amountInThousandWon: number | null): string {
  if (amountInThousandWon === null) return "-";
  const won = amountInThousandWon * 1000;
  const billion = won / 100000000;
  if (Math.abs(billion) >= 1) return `${billion.toFixed(1)}억`;
  const man = won / 10000;
  if (Math.abs(man) >= 1) return `${Math.round(man)}만`;
  return `${Math.round(won)}원`;
}

export default function LawmakerCandidatesInner({ electionId }: { electionId: string }) {
  const { data: candidates } = useCongressSuspenseQuery<LawmakerCandidate[], string>(
    getLawmakerCandidates,
    electionId,
  );

  const [sortKey, setSortKey] = useState<SortKey>("attendance");

  if (!candidates || candidates.length === 0) {
    return (
      <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) py-16 text-center">
        <p className="text-lg font-bold text-(--color-text-primary)">
          국회의원 출신 후보 정보가 없습니다
        </p>
        <p className="mt-2 text-sm text-(--color-text-tertiary)">
          후보자 등록(5/14~15) 이후 업데이트됩니다.
        </p>
      </div>
    );
  }

  const sorted = [...candidates].sort((a, b) => {
    switch (sortKey) {
      case "attendance":
        return b.attendanceRate - a.attendanceRate;
      case "vote":
        return b.voteParticipationRate - a.voteParticipationRate;
      case "bills":
        return b.billCount - a.billCount;
      case "passRate":
        return b.passRate - a.passRate;
      case "asset":
        return (b.totalAsset ?? 0) - (a.totalAsset ?? 0);
      default:
        return 0;
    }
  });

  const avgAttendance = Math.round(
    candidates.reduce((s, c) => s + c.attendanceRate, 0) / candidates.length,
  );
  const avgVote = Math.round(
    candidates.reduce((s, c) => s + c.voteParticipationRate, 0) / candidates.length,
  );

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "attendance", label: "출석률순" },
    { key: "vote", label: "표결참여순" },
    { key: "bills", label: "발의건수순" },
    { key: "passRate", label: "가결률순" },
    { key: "asset", label: "재산순" },
  ];

  return (
    <div className="space-y-6">
      {/* 요약 통계 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 text-center">
          <p className="text-2xl font-bold text-(--color-primary)">{candidates.length}명</p>
          <p className="mt-1 text-xs text-(--color-text-tertiary)">출마 의원</p>
        </div>
        <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 text-center">
          <p className="text-2xl font-bold">{avgAttendance}%</p>
          <p className="mt-1 text-xs text-(--color-text-tertiary)">평균 출석률</p>
        </div>
        <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 text-center">
          <p className="text-2xl font-bold">{avgVote}%</p>
          <p className="mt-1 text-xs text-(--color-text-tertiary)">평균 표결참여</p>
        </div>
        <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 text-center">
          <p className="text-2xl font-bold">
            {Math.round(candidates.reduce((s, c) => s + c.billCount, 0) / candidates.length)}건
          </p>
          <p className="mt-1 text-xs text-(--color-text-tertiary)">평균 발의</p>
        </div>
      </div>

      {/* 정렬 */}
      <div className="flex flex-wrap gap-2">
        {sortOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSortKey(opt.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              sortKey === opt.key
                ? "bg-(--color-primary) text-white"
                : "bg-(--color-bg-tertiary) text-(--color-text-secondary) hover:bg-(--color-bg-hover)"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* 후보 카드 리스트 */}
      <div className="space-y-3">
        {sorted.map((c) => (
          <div
            key={c.memberId}
            className="overflow-hidden rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary)"
            style={{ borderLeftWidth: "4px", borderLeftColor: c.party?.color ?? "#9ca3af" }}
          >
            <div className="p-4 sm:p-5">
              {/* 상단: 사진 + 기본정보 */}
              <div className="flex items-start gap-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full sm:h-16 sm:w-16">
                  {c.photoUrl ? (
                    <Image
                      src={c.photoUrl}
                      alt={c.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-lg font-bold text-white"
                      style={{ backgroundColor: c.party?.color ?? "#9ca3af" }}
                    >
                      {c.name.slice(0, 1)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{c.name}</span>
                    {c.party && (
                      <span
                        className="rounded px-1.5 py-0.5 text-xs font-bold text-white"
                        style={{ backgroundColor: c.party.color }}
                      >
                        {c.party.shortName || c.party.name}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-(--color-text-tertiary)">
                    {c.district} → {c.runningFor ? c.runningFor : c.runningReason}
                  </p>
                </div>
              </div>

              {/* 성적 그리드 */}
              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-5">
                <div>
                  <p className="text-xs text-(--color-text-tertiary)">출석률</p>
                  <p className="text-base font-bold">{c.attendanceRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-(--color-text-tertiary)">표결참여</p>
                  <p className="text-base font-bold">{c.voteParticipationRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-(--color-text-tertiary)">법안 발의</p>
                  <p className="text-base font-bold">{c.billCount}건</p>
                </div>
                <div>
                  <p className="text-xs text-(--color-text-tertiary)">가결률</p>
                  <p className="text-base font-bold">{c.passRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-(--color-text-tertiary)">
                    재산{c.assetYear ? ` (${c.assetYear})` : ""}
                  </p>
                  <p className="text-base font-bold">{formatAsset(c.totalAsset)}</p>
                </div>
              </div>

              {/* 링크 */}
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/members/${c.memberId}`}
                  className="rounded-lg bg-(--color-bg-tertiary) px-3 py-2 text-xs font-medium text-(--color-text-secondary) transition-colors hover:bg-(--color-bg-hover)"
                >
                  의정활동 상세 →
                </Link>
                <Link
                  href={`/members/${c.memberId}?tab=bills`}
                  className="rounded-lg bg-(--color-bg-tertiary) px-3 py-2 text-xs font-medium text-(--color-text-secondary) transition-colors hover:bg-(--color-bg-hover)"
                >
                  발의 법안 →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
