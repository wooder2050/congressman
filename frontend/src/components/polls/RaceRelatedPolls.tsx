"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getPollsByRace } from "@/lib/api";
import type { PollListItem } from "@/types";

interface Props {
  raceId: number;
  year: string;
  limit?: number;
}

function formatDateRange(startISO: string | null, endISO: string | null): string {
  if (!startISO && !endISO) return "";
  const s = startISO ? new Date(startISO).toLocaleDateString("ko-KR") : "";
  const e = endISO ? new Date(endISO).toLocaleDateString("ko-KR") : "";
  if (s && e && s !== e) return `${s} ~ ${e}`;
  return s || e;
}

function PollRow({ poll, year }: { poll: PollListItem; year: string }) {
  return (
    <Link
      href={`/local-elections/${year}/polls/${poll.id}`}
      className="block border-b border-(--color-border) py-2.5 last:border-0 hover:bg-(--color-bg-secondary)"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-xs text-(--color-text-tertiary)">
            {poll.agency} · {poll.client}
          </div>
          <div className="mt-0.5 line-clamp-1 text-sm text-(--color-text-primary)">
            {poll.pollName}
          </div>
        </div>
        <div className="shrink-0 text-right text-xs text-(--color-text-tertiary)">
          {formatDateRange(poll.surveyStartedAt, poll.surveyEndedAt) ||
            poll.registeredAt.slice(0, 10)}
        </div>
      </div>
    </Link>
  );
}

function RelatedPollsList({ raceId, year, limit = 10 }: Required<Props>) {
  const { data } = useCongressSuspenseQuery(getPollsByRace, { raceId, limit });

  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-(--color-text-tertiary)">
        해당 선거구의 등록된 여론조사가 아직 없습니다.
      </p>
    );
  }

  return (
    <div>
      <div>
        {data.map((p) => (
          <PollRow key={p.id} poll={p} year={year} />
        ))}
      </div>
      <div className="mt-2 text-right">
        <Link
          href={`/local-elections/${year}/polls?sido=`}
          className="text-xs text-(--color-link) hover:underline"
        >
          전체 여론조사 보기 →
        </Link>
      </div>
    </div>
  );
}

export default function RaceRelatedPolls({ raceId, year, limit = 10 }: Props) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold text-(--color-text-primary)">관련 여론조사</h2>
      <Suspense fallback={<p className="text-sm text-(--color-text-tertiary)">불러오는 중...</p>}>
        <RelatedPollsList raceId={raceId} year={year} limit={limit} />
      </Suspense>
    </section>
  );
}
