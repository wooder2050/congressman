"use client";

import Link from "next/link";

const EARLY_VOTE_END = new Date(2026, 4, 30); // 5/30 사전투표 종료
const ELECTION_DAY = new Date(2026, 5, 3); // 6/3 본투표

function isEarlyVoteOver(): boolean {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now > EARLY_VOTE_END;
}

function daysToElection(): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((ELECTION_DAY.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function VoteGuidePreview({ electionId }: { electionId: string }) {
  const earlyOver = isEarlyVoteOver();
  const dDay = daysToElection();

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold">투표 안내</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div
          className={`rounded-xl border p-4 ${
            earlyOver
              ? "border-(--color-border-primary) bg-(--color-bg-secondary) opacity-80"
              : "border-(--color-border-primary) bg-(--color-bg-primary)"
          }`}
        >
          <p className="text-xs font-semibold text-(--color-text-tertiary)">
            사전투표 {earlyOver && "· 마감"}
          </p>
          <p className="mt-1 text-lg font-bold">5/29(금)~30(토)</p>
          <p className="mt-1 text-xs text-(--color-text-secondary)">
            {earlyOver
              ? "재보선 14곳 최종 24.12% · 지선 23.51% 역대 최고"
              : "전국 어디서나 · 06:00~18:00"}
          </p>
        </div>
        <div
          className={`rounded-xl border p-4 ${
            earlyOver
              ? "border-(--color-primary) bg-blue-50 dark:bg-blue-950/30"
              : "border-(--color-border-primary) bg-(--color-bg-primary)"
          }`}
        >
          <p className="text-xs font-semibold text-(--color-text-tertiary)">
            본투표 {earlyOver && dDay > 0 && `· D-${dDay}`}
          </p>
          <p className="mt-1 text-lg font-bold">6/3(수)</p>
          <p className="mt-1 text-xs text-(--color-text-secondary)">
            주소지 관할 투표소 · 06:00~18:00
          </p>
        </div>
        <Link
          href={`/elections/${electionId}/vote`}
          className="flex flex-col items-center justify-center rounded-xl border border-(--color-primary) bg-blue-50 p-4 text-center transition-colors hover:bg-blue-100"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-(--color-primary)"
          >
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          <span className="mt-2 text-sm font-semibold text-(--color-primary)">
            투표 안내 자세히 보기
          </span>
          <span className="text-xs text-(--color-text-tertiary)">준비물 · 절차 · FAQ</span>
        </Link>
      </div>
    </section>
  );
}
