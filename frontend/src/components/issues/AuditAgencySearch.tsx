"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { auditCommitteePath } from "@/data/audit-2026";
import type { AuditAgencyRecord } from "@/data/audit-2026-agencies";
import { trackEvent } from "@/lib/analytics";
import { formatAuditMd } from "@/lib/audit-format";

interface PendingCommittee {
  name: string;
  short: string;
  status: "reported" | "pending";
}

interface Props {
  /** 색인된 기관 수(서버에서 계산) — 색인 본체는 검색창을 누를 때 따로 불러온다 */
  agencyCount: number;
  /** 상세 페이지가 열린 위원회 — 결과에서 위원회 페이지로 연결 */
  pageCommittees: string[];
  /** 계획서 확인 전 위원회 — 검색 결과가 없을 때 안내 */
  pendingCommittees: PendingCommittee[];
  verifiedAt: string;
}

/** 공백·가운뎃점 차이를 무시하고 비교한다("국방부 본부" = "국방부본부") */
function normalize(s: string): string {
  return s.replace(/[\s·ㆍ()（）]/g, "").toLowerCase();
}

function readQuery(): string {
  return new URLSearchParams(window.location.search).get("q") ?? "";
}

const HUB_URL = "https://www.lawmake.kr/issues/audit-2026";

/** 공유용 주소 — s=1이 붙은 주소로 들어오면 공유 링크 방문으로 한 번 측정한다 */
function shareUrl(agency: string): string {
  return `${HUB_URL}?q=${encodeURIComponent(agency)}&s=1`;
}

function scheduleLine(r: AuditAgencyRecord): string {
  const when = `${formatAuditMd(r.date)}${r.dateEnd ? `~${formatAuditMd(r.dateEnd)} 중` : ""}${
    r.time ? ` ${r.time}` : ""
  }`;
  return `- ${when} ${r.type}${r.place ? ` · ${r.place}` : ""}${r.note ? ` · ${r.note}` : ""}`;
}

/** 사내 메신저·메일에 붙여 넣을 일정 텍스트 — 확인 기준일과 최신 주소를 반드시 넣는다 */
function scheduleText(agency: string, rows: AuditAgencyRecord[], verifiedAt: string): string {
  const committees = [...new Set(rows.map((r) => r.committee))].join("·");
  return [
    `[2026 국정감사] ${agency}`,
    `소관: ${committees}`,
    ...rows.map(scheduleLine),
    `기준: 국회 위원회 국정감사계획서 원문 대조(${verifiedAt}). 위원회 사정에 따라 바뀔 수 있습니다.`,
    `최신 일정: ${shareUrl(agency)}`,
  ].join("\n");
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 일부 사내망 브라우저는 clipboard API를 막는다 — 선택 영역 복사로 대신한다
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  }
}

// 주소의 ?q=는 처음 한 번만 읽는다 — 이후 변경은 입력값(typed)이 맡는다
const noopSubscribe = () => () => {};

/**
 * 허브 최상단 "기관명으로 감사일 찾기".
 * 검색어는 ?q=로 주소에 남겨 공유·즐겨찾기가 되게 한다(업무용 재방문 장치).
 * 페이지가 ISR이라 searchParams를 서버에서 읽지 않고 클라이언트에서만 반영한다.
 */
export default function AuditAgencySearch({
  agencyCount,
  pageCommittees,
  pendingCommittees,
  verifiedAt,
}: Props) {
  // 서버 렌더는 빈 값, 수화 뒤 주소의 검색어로 바뀐다. 사용자가 입력하면 입력값이 우선한다.
  const urlQuery = useSyncExternalStore(noopSubscribe, readQuery, () => "");
  const [typed, setTyped] = useState<string | null>(null);
  const query = typed ?? urlQuery;
  const tracked = useRef("");
  const [copied, setCopied] = useState("");

  // 공유 링크(s=1)로 들어온 방문을 한 번만 측정하고, 새로고침에 다시 세지 않도록 주소에서 뺀다
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("s") !== "1") return;
    trackEvent("audit_shared_result_open", { share_type: "link" });
    url.searchParams.delete("s");
    window.history.replaceState(null, "", url);
  }, []);

  const onCopy = async (kind: "link" | "text", agency: string, rows: AuditAgencyRecord[]) => {
    const ok = await copyText(
      kind === "link" ? shareUrl(agency) : scheduleText(agency, rows, verifiedAt),
    );
    if (!ok) return;
    setCopied(`${kind}:${agency}`);
    setTimeout(() => setCopied((c) => (c === `${kind}:${agency}` ? "" : c)), 2000);
    trackEvent("audit_share_copy", { share_type: kind, committee: rows[0]?.committee ?? "" });
  };

  // 기관 색인(약 1,000건)은 허브 HTML에 싣지 않고 검색할 때만 별도 청크로 받는다
  const [records, setRecords] = useState<AuditAgencyRecord[] | null>(null);
  const loading = useRef(false);
  const loadIndex = () => {
    if (loading.current) return;
    loading.current = true;
    import("@/data/audit-2026-agencies").then((m) => setRecords(m.AUDIT_AGENCIES));
  };
  useEffect(() => {
    if (urlQuery) loadIndex();
  }, [urlQuery]);

  const q = normalize(query.trim());
  const results = useMemo(() => {
    if (q.length < 2 || !records) return [];
    // 정확히 일치 → 앞부분 일치 → 포함 순으로, 같은 기관의 여러 감사일은 한데 모은다
    const rank = (r: AuditAgencyRecord) => {
      const names = [r.agency, ...(r.aliases ?? [])].map(normalize);
      if (names.some((n) => n === q)) return 0;
      if (names.some((n) => n.startsWith(q))) return 1;
      return names.some((n) => n.includes(q)) ? 2 : -1;
    };
    return records
      .map((r) => ({ r, k: rank(r) }))
      .filter((x) => x.k >= 0)
      .sort(
        (a, b) =>
          a.k - b.k ||
          a.r.agency.localeCompare(b.r.agency, "ko") ||
          a.r.date.localeCompare(b.r.date),
      )
      .map((x) => x.r);
  }, [q, records]);

  // 검색어를 주소에 반영하고, 입력이 멈춘 뒤 한 번만 측정한다
  useEffect(() => {
    // 첫 렌더(서버 스냅샷 = 빈 검색어)에서 주소의 ?q=를 지우지 않도록, 사용자가 입력한 뒤에만 주소를 고친다
    if (typed !== null) {
      const url = new URL(window.location.href);
      if (q.length >= 2) url.searchParams.set("q", query.trim());
      else url.searchParams.delete("q");
      window.history.replaceState(null, "", url);
    }
    // 색인을 다 받기 전의 "결과 0건"은 검색 실패가 아니다 — 받은 뒤에만 측정한다
    if (q.length < 2 || !records || tracked.current === q) return;
    const t = setTimeout(() => {
      tracked.current = q;
      trackEvent("audit_agency_search", { query: query.trim(), results: results.length });
    }, 1200);
    return () => clearTimeout(t);
  }, [q, query, typed, records, results.length]);

  return (
    <section
      aria-labelledby="agency-search-title"
      className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-secondary) p-4"
    >
      <h2 id="agency-search-title" className="text-lg font-bold">
        기관명으로 감사일 찾기
      </h2>
      <p className="mt-1 text-xs text-(--color-text-tertiary)">
        계획서가 확인된 위원회의 기관명 {agencyCount.toLocaleString()}곳 수록 · 계획서 원문 대조{" "}
        {verifiedAt} · 국회사무처 공식 집계 피감기관은 846개로, 집계 단위가 달라 수가 다릅니다
      </p>
      <input
        type="search"
        value={query}
        onChange={(e) => setTyped(e.target.value)}
        onFocus={loadIndex}
        placeholder="예: 국방부, 경찰청, LH, 한국은행"
        aria-label="피감기관 이름"
        className="mt-3 w-full rounded-lg border border-(--color-border-primary) bg-(--color-bg-primary) px-3 py-2 text-base"
      />

      {q.length >= 2 && results.length > 0 && (
        <ul className="mt-3 divide-y divide-(--color-border-primary) text-sm">
          {results.map((r, i) => (
            <li key={`${r.agency}-${r.committee}-${r.date}-${r.type}`} className="py-2">
              <p className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-semibold">{r.agency}</span>
                <span className="text-(--color-text-primary) tabular-nums">
                  {formatAuditMd(r.date)}
                  {r.dateEnd ? `~${formatAuditMd(r.dateEnd)} 중` : ""}
                  {r.time ? ` ${r.time}` : ""}
                </span>
                {r.type !== "기관감사" && (
                  <span className="rounded-full border border-(--color-border-primary) px-1.5 text-xs text-(--color-text-secondary)">
                    {r.type}
                  </span>
                )}
              </p>
              <p className="text-xs text-(--color-text-secondary)">
                {pageCommittees.includes(r.committee) ? (
                  <Link
                    href={auditCommitteePath(r.committee)}
                    className="text-(--color-primary) hover:underline"
                  >
                    {r.committee}
                  </Link>
                ) : (
                  r.committee
                )}
                {r.place ? ` · ${r.place}` : ""}
                {r.note ? ` · ${r.note}` : ""}
                {r.sourceUrl && (
                  <>
                    {" · "}
                    <a
                      href={r.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-(--color-primary) hover:underline"
                    >
                      계획서 원문
                    </a>
                  </>
                )}
              </p>
              {/* 같은 기관의 감사일(기관감사·종합감사)은 이어서 나오므로 첫 줄에만 복사 버튼을 둔다 */}
              {(i === 0 || results[i - 1].agency !== r.agency) && (
                <p className="mt-1 flex flex-wrap gap-2 text-xs">
                  {(["link", "text"] as const).map((kind) => (
                    <button
                      key={kind}
                      type="button"
                      onClick={() =>
                        onCopy(
                          kind,
                          r.agency,
                          results.filter((x) => x.agency === r.agency),
                        )
                      }
                      className="rounded-md border border-(--color-border-primary) px-2 py-0.5 text-(--color-text-secondary) hover:border-(--color-primary) hover:text-(--color-primary)"
                    >
                      {copied === `${kind}:${r.agency}`
                        ? "복사했습니다"
                        : kind === "link"
                          ? "이 결과 링크 복사"
                          : "일정 텍스트 복사"}
                    </button>
                  ))}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {q.length >= 2 && !records && (
        <p className="mt-3 text-sm text-(--color-text-tertiary)">기관 색인을 불러오는 중…</p>
      )}

      {q.length >= 2 && records && results.length === 0 && (
        <div className="mt-3 text-sm text-(--color-text-secondary)">
          <p>계획서가 확인된 위원회에서는 &lsquo;{query.trim()}&rsquo;을 찾지 못했습니다.</p>
          {pendingCommittees.length > 0 && (
            <p className="mt-1">
              아직 계획서를 확인하지 못한 위원회:{" "}
              {pendingCommittees
                .map((c) => `${c.short}${c.status === "reported" ? "(보도 일정만)" : ""}`)
                .join(", ")}
              . 확인되는 대로 추가합니다.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
