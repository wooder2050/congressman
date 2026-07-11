"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";

const ADMIN_EMAILS = ["wooder2050@gmail.com"];

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

type UnmappedResponse = {
  id: number;
  candidateName: string | null;
  partyName: string | null;
  rate: number;
};

type PendingPoll = {
  id: number;
  nttId: string;
  agency: string;
  client: string;
  sido: string;
  sigungu: string;
  pollName: string;
  registeredAt: string;
  unmappedResponses: UnmappedResponse[];
};

type RaceOption = { id: number; displayName: string; sido: string; sigungu: string };

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL not set");
  const supabase = createClient();
  const token = supabase
    ? (await supabase.auth.getSession()).data.session?.access_token
    : undefined;
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

function PendingPollCard({ poll, onAssigned }: { poll: PendingPoll; onAssigned: () => void }) {
  const [raceSearch, setRaceSearch] = useState(`${poll.sido} ${poll.sigungu}`.trim());
  const [searchResult, setSearchResult] = useState<RaceOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigned, setAssigned] = useState(false);

  const search = async () => {
    if (!raceSearch.trim()) return;
    setLoading(true);
    try {
      // race 검색은 기존 local-elections API 사용
      const sido = raceSearch.split(/\s+/)[0];
      const data = await fetchJson<{ races: RaceOption[] }>(
        `/api/local-elections/local-2026/races?sido=${encodeURIComponent(sido)}&limit=50`,
      );
      setSearchResult(data.races);
    } finally {
      setLoading(false);
    }
  };

  const assign = async (raceId: number) => {
    setLoading(true);
    try {
      await fetchJson(`/api/polls/admin/assign-race/${poll.id}`, {
        method: "POST",
        body: JSON.stringify({ raceId }),
      });
      setAssigned(true);
      onAssigned();
    } catch (e) {
      alert(`매칭 실패: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-(--color-border) p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-xs text-(--color-text-tertiary)">
            {poll.agency} · {poll.client}
          </div>
          <div className="line-clamp-1 text-sm font-medium">{poll.pollName}</div>
          <div className="mt-1 text-xs text-(--color-text-tertiary)">
            📍 {poll.sido} {poll.sigungu} · 등록 {poll.registeredAt.slice(0, 10)}
          </div>
        </div>
        {assigned && <span className="shrink-0 text-xs text-green-600">✓ 매칭 완료</span>}
      </div>

      <div className="mt-2 text-xs text-(--color-text-secondary)">
        매칭 대기 응답 ({poll.unmappedResponses.length}개):
      </div>
      <ul className="mt-1 ml-3 list-disc text-xs">
        {poll.unmappedResponses.slice(0, 4).map((r) => (
          <li key={r.id}>
            {r.partyName ?? "-"} / {r.candidateName ?? "-"}:{" "}
            <span className="font-mono">{r.rate}%</span>
          </li>
        ))}
        {poll.unmappedResponses.length > 4 && <li>...외 {poll.unmappedResponses.length - 4}개</li>}
      </ul>

      {!assigned && (
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            type="text"
            value={raceSearch}
            onChange={(e) => setRaceSearch(e.target.value)}
            placeholder="시도명 (예: 서울특별시)"
            className="rounded border border-(--color-border) bg-(--color-bg-primary) px-2 py-1 text-xs"
          />
          <button
            type="button"
            onClick={search}
            disabled={loading}
            className="rounded border border-(--color-border) px-3 py-1 text-xs disabled:opacity-40"
          >
            {loading ? "..." : "race 검색"}
          </button>
        </div>
      )}

      {!assigned && searchResult.length > 0 && (
        <div className="mt-2 max-h-48 overflow-y-auto rounded border border-(--color-border) p-2">
          {searchResult.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => assign(r.id)}
              disabled={loading}
              className="block w-full rounded px-2 py-1 text-left text-xs hover:bg-(--color-bg-secondary) disabled:opacity-40"
            >
              {r.displayName}
              <span className="ml-2 text-(--color-text-tertiary)">
                ({r.sido} {r.sigungu})
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PollAdminInner() {
  const { user, loading } = useAuth();
  const [pending, setPending] = useState<PendingPoll[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const isAdmin = user && user.email && ADMIN_EMAILS.includes(user.email);

  const loadPending = async () => {
    setFetchLoading(true);
    try {
      const data = await fetchJson<{ total: number; polls: PendingPoll[] }>(
        `/api/polls/admin/pending-mappings?limit=50`,
      );
      setPending(data.polls);
      setTotal(data.total);
      setFetched(true);
    } catch (e) {
      alert(`조회 실패: ${(e as Error).message}`);
    } finally {
      setFetchLoading(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-(--color-text-tertiary)">로딩 중...</p>;
  }

  if (!isAdmin) {
    return (
      <p className="rounded-md border border-(--color-border) p-4 text-sm text-(--color-text-secondary)">
        이 페이지는 관리자 계정으로만 접근할 수 있습니다.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={loadPending}
          disabled={fetchLoading}
          className="rounded border border-(--color-border) px-3 py-1 text-sm disabled:opacity-40"
        >
          {fetchLoading ? "조회 중..." : fetched ? "새로고침" : "대기 목록 불러오기"}
        </button>
        {total !== null && (
          <span className="text-sm text-(--color-text-tertiary)">
            대기 중: <span className="font-medium">{total}</span>건
          </span>
        )}
      </div>

      {fetched && pending.length === 0 && (
        <p className="py-6 text-center text-sm text-(--color-text-tertiary)">
          매칭 대기 중인 항목이 없습니다.
        </p>
      )}

      <div className="space-y-3">
        {pending.map((p) => (
          <PendingPollCard key={p.id} poll={p} onAssigned={loadPending} />
        ))}
      </div>
    </div>
  );
}
