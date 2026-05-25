"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getPolls, getPollFilters } from "@/lib/api";
import type { PollListItem } from "@/types";

interface Props {
  year: string;
  initialCategory?: string;
}

function formatDateRange(startISO: string | null, endISO: string | null): string {
  if (!startISO && !endISO) return "—";
  const s = startISO ? new Date(startISO).toLocaleDateString("ko-KR") : "";
  const e = endISO ? new Date(endISO).toLocaleDateString("ko-KR") : "";
  if (s && e && s !== e) return `${s} ~ ${e}`;
  return s || e;
}

function PollCard({ poll, year }: { poll: PollListItem; year: string }) {
  const region = poll.sigungu ? `${poll.sido} ${poll.sigungu}` : poll.sido;
  return (
    <Link
      href={`/local-elections/${year}/polls/${poll.id}`}
      className="block rounded-lg border border-(--color-border) p-4 transition-colors hover:bg-(--color-bg-secondary)"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-(--color-text-tertiary)">
            <span className="font-medium text-(--color-text-secondary)">{poll.agency}</span>
            <span>·</span>
            <span>{poll.client}</span>
          </div>
          <h3 className="mt-1 line-clamp-2 text-sm font-medium text-(--color-text-primary)">
            {poll.pollName}
          </h3>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-(--color-text-secondary)">
            <span>📍 {region}</span>
            {poll.sampleSize && <span>표본 {poll.sampleSize.toLocaleString()}명</span>}
            {poll.responseRate != null && <span>응답률 {poll.responseRate}%</span>}
            {poll.marginOfError != null && <span>±{poll.marginOfError}%P</span>}
          </div>
        </div>
        <div className="shrink-0 text-right text-xs text-(--color-text-tertiary)">
          <div>{formatDateRange(poll.surveyStartedAt, poll.surveyEndedAt)}</div>
          <div className="mt-1">등록 {poll.registeredAt.slice(0, 10)}</div>
        </div>
      </div>
    </Link>
  );
}

function PollListContent({
  category,
  sido,
  agency,
  page,
  setPage,
  year,
}: {
  category: string;
  sido: string;
  agency: string;
  page: number;
  setPage: (p: number | ((prev: number) => number)) => void;
  year: string;
}) {
  const { data } = useCongressSuspenseQuery(getPolls, {
    category: category || undefined,
    sido: sido || undefined,
    agency: agency || undefined,
    page,
    limit: 20,
  });

  const totalPages = Math.max(1, Math.ceil(data.total / 20));

  if (data.polls.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-(--color-text-tertiary)">
        조건에 맞는 여론조사가 없습니다.
      </p>
    );
  }

  return (
    <>
      <div className="mb-3 text-sm text-(--color-text-tertiary)">
        총{" "}
        <span className="font-medium text-(--color-text-secondary)">
          {data.total.toLocaleString()}
        </span>
        건
      </div>
      <div className="space-y-3">
        {data.polls.map((p) => (
          <PollCard key={p.id} poll={p} year={year} />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded border border-(--color-border) px-3 py-1 text-sm disabled:opacity-40"
          >
            이전
          </button>
          <span className="text-sm text-(--color-text-secondary)">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded border border-(--color-border) px-3 py-1 text-sm disabled:opacity-40"
          >
            다음
          </button>
        </div>
      )}
    </>
  );
}

function FilterBar({
  category,
  setCategory,
  sido,
  setSido,
  agency,
  setAgency,
  onReset,
}: {
  category: string;
  setCategory: (v: string) => void;
  sido: string;
  setSido: (v: string) => void;
  agency: string;
  setAgency: (v: string) => void;
  onReset: () => void;
}) {
  const { data } = useCongressSuspenseQuery(getPollFilters);

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="rounded border border-(--color-border) bg-(--color-bg-primary) px-2 py-1 text-sm"
      >
        <option value="">전체 선거</option>
        {data.categories.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
      <select
        value={sido}
        onChange={(e) => setSido(e.target.value)}
        className="rounded border border-(--color-border) bg-(--color-bg-primary) px-2 py-1 text-sm"
      >
        <option value="">전체 지역</option>
        {data.sidos.map((s) => (
          <option key={s.value} value={s.value}>
            {s.value} ({s.count})
          </option>
        ))}
      </select>
      <select
        value={agency}
        onChange={(e) => setAgency(e.target.value)}
        className="rounded border border-(--color-border) bg-(--color-bg-primary) px-2 py-1 text-sm"
      >
        <option value="">전체 조사기관</option>
        {data.agencies.map((a) => (
          <option key={a.value} value={a.value}>
            {a.value} ({a.count})
          </option>
        ))}
      </select>
      {(category || sido || agency) && (
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-(--color-text-tertiary) hover:underline"
        >
          초기화
        </button>
      )}
    </div>
  );
}

export default function PollListInner({ year, initialCategory }: Props) {
  const [category, setCategoryState] = useState(initialCategory ?? "");
  const [sido, setSidoState] = useState("");
  const [agency, setAgencyState] = useState("");
  const [page, setPageState] = useState(1);
  const [, startTransition] = useTransition();

  const updateFilter = (setter: (v: string) => void) => (v: string) => {
    startTransition(() => {
      setter(v);
      setPageState(1);
    });
  };

  return (
    <div>
      <FilterBar
        category={category}
        setCategory={updateFilter(setCategoryState)}
        sido={sido}
        setSido={updateFilter(setSidoState)}
        agency={agency}
        setAgency={updateFilter(setAgencyState)}
        onReset={() => {
          startTransition(() => {
            setCategoryState("");
            setSidoState("");
            setAgencyState("");
            setPageState(1);
          });
        }}
      />
      <PollListContent
        category={category}
        sido={sido}
        agency={agency}
        page={page}
        setPage={(p) => startTransition(() => setPageState(p))}
        year={year}
      />
    </div>
  );
}
