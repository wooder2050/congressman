"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getScorecardRanking } from "@/lib/api";
import MemberAvatar from "@/components/members/MemberAvatar";
import type { ScorecardGrade } from "@/types";

const GRADE_STYLES: Record<ScorecardGrade, { bg: string; text: string }> = {
  S: {
    bg: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    text: "text-amber-600 dark:text-amber-400",
  },
  A: {
    bg: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    text: "text-blue-600 dark:text-blue-400",
  },
  B: {
    bg: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    text: "text-green-600 dark:text-green-400",
  },
  C: {
    bg: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
    text: "text-orange-600 dark:text-orange-400",
  },
  D: {
    bg: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    text: "text-red-600 dark:text-red-400",
  },
};

export default function ScorecardHighlight() {
  const { data } = useCongressSuspenseQuery(getScorecardRanking, 22);

  const { gradeCounts, top5, bottom5 } = useMemo(() => {
    const counts: Record<string, number> = { S: 0, A: 0, B: 0, C: 0, D: 0 };
    for (const r of data.rankings) counts[r.grade]++;

    const sorted = [...data.rankings].sort((a, b) => b.totalScore - a.totalScore);
    return {
      gradeCounts: counts,
      top5: sorted.slice(0, 5),
      bottom5: sorted.slice(-5).reverse(),
    };
  }, [data]);

  return (
    <div className="space-y-4">
      {/* 등급별 요약 */}
      <div className="grid grid-cols-5 gap-2">
        {(["S", "A", "B", "C", "D"] as ScorecardGrade[]).map((grade) => (
          <Link
            key={grade}
            href={`/members/scorecard`}
            className="rounded-xl bg-(--color-bg-secondary) p-2.5 text-center no-underline transition-colors hover:bg-(--color-bg-tertiary)"
          >
            <div className={`text-xl font-black ${GRADE_STYLES[grade].text}`}>{grade}</div>
            <div className="text-sm font-bold text-(--color-text-primary)">
              {gradeCounts[grade]}명
            </div>
          </Link>
        ))}
      </div>

      {/* TOP 5 / 하위 5 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-(--color-text-primary)">종합 TOP 5</h3>
          <div className="space-y-1.5">
            {top5.map((item, idx) => (
              <Link
                key={item.memberId}
                href={`/members/${item.memberId}?term=22&tab=scorecard`}
                className="flex items-center gap-2.5 rounded-lg border border-(--color-border-primary) bg-(--color-bg-primary) p-2.5 no-underline transition-colors hover:bg-(--color-bg-hover)"
              >
                <span
                  className={`w-5 text-center text-sm font-bold ${
                    idx === 0
                      ? "text-amber-500"
                      : idx === 1
                        ? "text-gray-400"
                        : idx === 2
                          ? "text-amber-700"
                          : "text-(--color-text-tertiary)"
                  }`}
                >
                  {idx + 1}
                </span>
                <MemberAvatar
                  name={item.name}
                  photoUrl={item.photoUrl}
                  size={32}
                  bgColor={item.party.color}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-(--color-text-primary)">
                      {item.name}
                    </span>
                    <span className="text-xs text-(--color-text-tertiary)">
                      {item.party.shortName}
                    </span>
                  </div>
                  <div className="text-xs text-(--color-text-tertiary)">{item.totalScore}점</div>
                </div>
                <span
                  className={`inline-flex size-7 items-center justify-center rounded text-xs font-black ${GRADE_STYLES[item.grade as ScorecardGrade].bg}`}
                >
                  {item.grade}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-bold text-(--color-text-primary)">종합 하위 5</h3>
          <div className="space-y-1.5">
            {bottom5.map((item, idx) => (
              <Link
                key={item.memberId}
                href={`/members/${item.memberId}?term=22&tab=scorecard`}
                className="flex items-center gap-2.5 rounded-lg border border-(--color-border-primary) bg-(--color-bg-primary) p-2.5 no-underline transition-colors hover:bg-(--color-bg-hover)"
              >
                <span className="w-5 text-center text-sm font-bold text-red-500">
                  {data.rankings.length - 4 + idx}
                </span>
                <MemberAvatar
                  name={item.name}
                  photoUrl={item.photoUrl}
                  size={32}
                  bgColor={item.party.color}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-(--color-text-primary)">
                      {item.name}
                    </span>
                    <span className="text-xs text-(--color-text-tertiary)">
                      {item.party.shortName}
                    </span>
                  </div>
                  <div className="text-xs text-(--color-text-tertiary)">{item.totalScore}점</div>
                </div>
                <span
                  className={`inline-flex size-7 items-center justify-center rounded text-xs font-black ${GRADE_STYLES[item.grade as ScorecardGrade].bg}`}
                >
                  {item.grade}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 전체 보기 링크 */}
      <div className="text-center">
        <Link
          href="/members/scorecard"
          className="inline-flex items-center gap-1 text-sm font-medium text-(--color-primary) hover:underline"
        >
          전체 성적표 랭킹 보기 →
        </Link>
      </div>
    </div>
  );
}
