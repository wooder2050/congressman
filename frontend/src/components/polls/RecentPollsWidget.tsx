"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getRecentPolls } from "@/lib/api";
import type { PollListItem } from "@/types";

interface Props {
  year: string;
  limit?: number;
}

function formatRange(startISO: string | null, endISO: string | null): string {
  if (!startISO && !endISO) return "";
  const s = startISO ? new Date(startISO).toLocaleDateString("ko-KR") : "";
  const e = endISO ? new Date(endISO).toLocaleDateString("ko-KR") : "";
  if (s && e && s !== e) return `${s} ~ ${e}`;
  return s || e;
}

function PollMini({ poll, year }: { poll: PollListItem; year: string }) {
  const region = poll.sigungu ? `${poll.sido} ${poll.sigungu}` : poll.sido;
  return (
    <Link
      href={`/local-elections/${year}/polls/${poll.id}`}
      className="block rounded-md border border-(--color-border) p-3 hover:bg-(--color-bg-secondary)"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-xs text-(--color-text-tertiary)">
            {poll.agency}
            {poll.client ? ` · ${poll.client}` : ""}
          </div>
          <div className="mt-0.5 line-clamp-1 text-sm font-medium text-(--color-text-primary)">
            {region} {poll.pollName}
          </div>
          <div className="mt-1 flex flex-wrap gap-x-2 text-xs text-(--color-text-tertiary)">
            <span>{formatRange(poll.surveyStartedAt, poll.surveyEndedAt)}</span>
            {poll.sampleSize && <span>· 표본 {poll.sampleSize.toLocaleString()}</span>}
            {poll.marginOfError != null && <span>· ±{poll.marginOfError}%P</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}

function WidgetContent({ year, limit }: Required<Props>) {
  const { data } = useCongressSuspenseQuery(getRecentPolls, {
    category: "제9회 전국동시지방선거",
    limit,
  });

  if (!data || data.length === 0) return null;

  return (
    <div className="space-y-2">
      {data.map((p) => (
        <PollMini key={p.id} poll={p} year={year} />
      ))}
    </div>
  );
}

export default function RecentPollsWidget({ year, limit = 5 }: Props) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-(--color-text-primary)">최근 여론조사</h2>
        <Link
          href={`/local-elections/${year}/polls`}
          className="text-xs text-(--color-link) hover:underline"
        >
          전체 보기 →
        </Link>
      </div>
      <Suspense fallback={<p className="text-sm text-(--color-text-tertiary)">불러오는 중...</p>}>
        <WidgetContent year={year} limit={limit} />
      </Suspense>
    </section>
  );
}
