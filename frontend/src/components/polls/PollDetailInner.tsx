"use client";

import Link from "next/link";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getPoll } from "@/lib/api";
import type { PollAttachment, PollRaceLink, PollResponseRow } from "@/types";

interface Props {
  id: number;
  year: string;
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-2 py-1.5 text-sm">
      <span className="text-(--color-text-tertiary)">{label}</span>
      <span className="text-(--color-text-primary)">{value ?? "—"}</span>
    </div>
  );
}

function formatDateRange(startISO: string | null, endISO: string | null): string {
  if (!startISO && !endISO) return "—";
  const fmt = (iso: string) => {
    const d = new Date(iso);
    return `${d.toLocaleDateString("ko-KR")} ${d.getHours().toString().padStart(2, "0")}:${d
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };
  const s = startISO ? fmt(startISO) : "";
  const e = endISO ? fmt(endISO) : "";
  return s && e ? `${s} ~ ${e}` : s || e;
}

function attachmentLabel(kind: PollAttachment["kind"]): string {
  switch (kind) {
    case "questionnaire":
      return "설문지";
    case "result":
      return "결과표";
    default:
      return "첨부";
  }
}

function attachmentIcon(kind: PollAttachment["kind"]): string {
  switch (kind) {
    case "questionnaire":
      return "📄";
    case "result":
      return "📊";
    default:
      return "📎";
  }
}

function attachmentStatusLabel(status: string): { text: string; tone: string } {
  switch (status) {
    case "downloaded":
      return { text: "다운로드 가능", tone: "text-(--color-text-secondary)" };
    case "not_yet_public":
      return { text: "공개 대기 (등록 +24h)", tone: "text-amber-600" };
    case "failed":
      return { text: "다운로드 실패", tone: "text-red-600" };
    default:
      return { text: "원본 NESDC 링크", tone: "text-(--color-text-tertiary)" };
  }
}

function PollResponsesSection({ responses }: { responses: PollResponseRow[] }) {
  if (responses.length === 0) return null;

  // questionType별로 묶기 — 우선 "후보 지지도" 그룹만 노출
  const supportRows = responses.filter(
    (r) => r.questionType === "candidate_support" && r.subgroupKey === "total",
  );
  if (supportRows.length === 0) return null;

  // 같은 race / question별로 그룹핑
  const byRace = new Map<number | null, PollResponseRow[]>();
  for (const r of supportRows) {
    const key = r.raceId;
    if (!byRace.has(key)) byRace.set(key, []);
    byRace.get(key)!.push(r);
  }

  return (
    <section className="rounded-lg border border-(--color-border) p-4">
      <h2 className="mb-3 text-sm font-semibold text-(--color-text-primary)">
        후보별 지지율 (전체)
      </h2>
      <div className="space-y-4">
        {Array.from(byRace.values()).map((rows, i) => (
          <div key={i}>
            <ul className="space-y-1.5">
              {rows.map((r) => (
                <li key={r.id} className="flex items-center justify-between text-sm">
                  <span className="text-(--color-text-primary)">
                    {r.candidateName ?? r.partyName ?? "—"}
                  </span>
                  <span className="font-mono text-(--color-text-secondary)">
                    {r.rate.toFixed(1)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function RelatedRacesSection({ races, year }: { races: PollRaceLink[]; year: string }) {
  if (races.length === 0) return null;
  return (
    <section className="rounded-lg border border-(--color-border) p-4">
      <h2 className="mb-3 text-sm font-semibold text-(--color-text-primary)">조사 대상 선거</h2>
      <ul className="space-y-1.5 text-sm">
        {races.map((r) => (
          <li key={r.id}>
            <Link
              href={`/local-elections/${year}/races/${r.id}`}
              className="text-(--color-link) hover:underline"
            >
              {r.displayName}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function PollDetailInner({ id, year }: Props) {
  const { data } = useCongressSuspenseQuery(getPoll, id);

  if (!data) {
    return (
      <p className="py-8 text-center text-sm text-(--color-text-tertiary)">
        조사를 찾을 수 없습니다.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs text-(--color-text-tertiary)">
          {data.agency} · {data.client}
        </div>
        <h1 className="mt-1 text-xl font-bold text-(--color-text-primary)">{data.pollName}</h1>
        <div className="mt-1 text-xs text-(--color-text-tertiary)">
          {data.sigungu ? `${data.sido} ${data.sigungu}` : data.sido}
        </div>
      </div>

      <section className="rounded-lg border border-(--color-border) p-4">
        <h2 className="mb-3 text-sm font-semibold text-(--color-text-primary)">조사 개요</h2>
        <MetaRow label="조사기관" value={data.agency} />
        <MetaRow label="의뢰자" value={data.client} />
        <MetaRow
          label="조사대상"
          value={data.sigungu ? `${data.sido} ${data.sigungu}` : data.sido}
        />
        <MetaRow label="조사방법" value={data.surveyMethod} />
        <MetaRow label="표본 추출틀" value={data.samplingFrame} />
        <MetaRow
          label="표본 크기"
          value={data.sampleSize ? `${data.sampleSize.toLocaleString()}명` : null}
        />
        <MetaRow
          label="표본오차"
          value={
            data.marginOfError != null
              ? `${data.confidenceLevel ?? 95}% 신뢰수준 ±${data.marginOfError}%P`
              : null
          }
        />
        <MetaRow
          label="응답률"
          value={
            data.responseRate != null
              ? `${data.responseRate}%${data.contactRate != null ? ` (접촉률 ${data.contactRate}%)` : ""}`
              : null
          }
        />
        <MetaRow
          label="조사일시"
          value={formatDateRange(data.surveyStartedAt, data.surveyEndedAt)}
        />
        <MetaRow
          label="공표일"
          value={data.publishedAt ? new Date(data.publishedAt).toLocaleString("ko-KR") : null}
        />
        <MetaRow label="공표 매체" value={data.publishMediaName} />
        <MetaRow label="가중 방법" value={data.weightingMethod} />
        <MetaRow label="등록번호" value={data.registrationNo} />
      </section>

      {data.attachments.length > 0 && (
        <section className="rounded-lg border border-(--color-border) p-4">
          <h2 className="mb-3 text-sm font-semibold text-(--color-text-primary)">첨부 자료</h2>
          <ul className="space-y-2">
            {data.attachments.map((a) => {
              const status = attachmentStatusLabel(a.status);
              return (
                <li key={a.id} className="flex items-center justify-between gap-3">
                  <a
                    href={a.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-w-0 flex-1 items-center gap-2 text-sm text-(--color-link) hover:underline"
                  >
                    <span aria-hidden>{attachmentIcon(a.kind)}</span>
                    <span className="shrink-0 text-xs font-medium text-(--color-text-secondary)">
                      [{attachmentLabel(a.kind)}]
                    </span>
                    <span className="truncate">{a.fileName}</span>
                  </a>
                  <span className={`shrink-0 text-xs ${status.tone}`}>{status.text}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <PollResponsesSection responses={data.responses} />
      <RelatedRacesSection races={data.races} year={year} />

      <div className="mt-2 text-center">
        <a
          href={data.nesdcUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-(--color-text-tertiary) hover:underline"
        >
          NESDC 원문 등록 페이지에서 보기 →
        </a>
      </div>
    </div>
  );
}
