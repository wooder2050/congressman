import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/ads/AdSlot";
import JsonLd from "@/components/seo/JsonLd";
import AuditSources from "@/components/issues/AuditSources";
import {
  AUDIT_2026,
  auditCommitteePath,
  isAuditCommitteePageReady,
  type AuditCommittee,
} from "@/data/audit-2026";
import { getUpcomingSchedules } from "@/lib/api";
import {
  auditDayKey,
  auditStatus,
  auditStatusClass,
  formatAuditDate,
  formatAuditMd,
  auditAgendaText,
} from "@/lib/audit-format";
import type { Schedule } from "@/types";

const TERM_ID = 22;
const BASE = "https://www.lawmake.kr";
const d = AUDIT_2026;
const CANONICAL = `${BASE}${d.path}`;

// 편집 데이터는 배포로 바뀌고, 진행 상태 배지와 국회 공개 일정만 시간에 따라 달라진다.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: d.title,
  description: d.description,
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: d.title,
    description: d.description,
    url: CANONICAL,
    type: "article",
    publishedTime: d.publishedAt,
    modifiedTime: d.updatedAt,
  },
};

/** 상임위별 일정을 날짜별로 뒤집는다. 기간형(10-11~10-22)은 시작일에 묶어 표시 */
function byDate(committees: AuditCommittee[]) {
  const map = new Map<string, { committee: AuditCommittee; date: string; target: string }[]>();
  for (const c of committees) {
    for (const day of c.days) {
      const key = auditDayKey(day.date.split("~")[0]);
      const list = map.get(key) ?? [];
      list.push({ committee: c, date: day.date, target: day.target });
      map.set(key, list);
    }
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
}

/** 국회가 공개한 회의 일정 중 국정감사만 (daily sync가 채운다) */
function pickAuditSchedules(schedules: Schedule[]): Schedule[] {
  return schedules.filter((s) => `${s.title} ${s.agenda ?? ""}`.includes("국정감사"));
}

export default async function Audit2026Page() {
  const status = auditStatus(new Date());
  // 계획서 의결 확인(confirmed)을 먼저, 보도된 예정 일정(reported)을 뒤에 둔다
  const confirmed = d.committees.filter((c) => c.status === "confirmed");
  const reported = d.committees.filter((c) => c.status === "reported");
  const scheduled = [...confirmed, ...reported];
  const pending = d.committees.filter((c) => c.status === "pending");
  const dates = byDate(scheduled);
  const liveSchedules = pickAuditSchedules(
    await getUpcomingSchedules(TERM_ID, 100).catch(() => [] as Schedule[]),
  );

  const toneClass = auditStatusClass(status.tone);

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "홈", item: BASE },
            { "@type": "ListItem", position: 2, name: "2026 국정감사", item: CANONICAL },
          ],
        }}
      />

      <header className="space-y-4">
        <p className="text-xs font-semibold tracking-wide text-(--color-text-tertiary)">
          이슈 · 제22대 국회 후반기 첫 국정감사
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight break-keep">
          2026 국정감사 일정과 쟁점
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-(--color-text-tertiary)">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${toneClass}`}>
            {status.label}
          </span>
          <span className="tabular-nums">최종 갱신 {d.updatedAt}</span>
        </div>
        <p className="text-base leading-relaxed text-(--color-text-secondary)">
          여야는 8월 25일 정기국회 의사일정에 합의하며 올해 국정감사를{" "}
          <strong className="text-(--color-text-primary)">10월 6일부터 27일까지 3주간</strong>{" "}
          열기로 했습니다. 정보위원회와 성평등가족위원회는 10월 30일까지 이어지고, 운영위원회의
          대통령비서실 감사도 30일에 열립니다. 각 상임위원회가 소관 부처·공공기관을 나눠 감사하며,
          기관별 실제 감사일은 위원회가 채택한 국정감사계획서를 따릅니다.
        </p>
        <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-secondary) px-4 py-3 text-xs leading-relaxed text-(--color-text-secondary)">
          <span className="font-semibold text-(--color-text-primary)">편집 원칙 </span>
          상임위별 일정은 국회 홈페이지에 올라온 국정감사계획서 원문과 의결 보도로 확인한 것만
          적습니다. 계획서 의결 전인 위원회는 보도된 예정 일정임을 밝히고, 정보가 없는 위원회는
          날짜를 비워 둡니다. 쟁점은 발언 주체를 밝혀 인용하고 여야 입장을 함께 싣습니다. 국정감사
          제도 설명은{" "}
          <Link
            href={`/glossary/${encodeURIComponent("국정감사")}`}
            className="text-(--color-primary) underline underline-offset-2"
          >
            용어사전 &lsquo;국정감사&rsquo;
          </Link>
          를 참고하세요.
        </div>
        <AuditSources sources={d.periodSources} />
      </header>

      <section aria-labelledby="committees-title" className="space-y-4">
        <h2 id="committees-title" className="text-2xl font-bold">
          상임위원회별 감사 일정
        </h2>
        <p className="text-sm text-(--color-text-secondary)">
          17개 상임위원회 중 {confirmed.length}곳은 국정감사계획서로 일정을 확인했고,{" "}
          {reported.length}곳은 계획서 의결 전 보도된 예정 일정입니다. 나머지는 확인되는 대로
          추가합니다.
        </p>
        <div className="grid gap-4">
          {scheduled.map((c) => (
            <article
              key={c.name}
              className="rounded-xl border border-(--color-border-primary) p-4"
              aria-labelledby={`c-${c.short}`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 id={`c-${c.short}`} className="text-lg font-bold">
                  <Link
                    href={
                      isAuditCommitteePageReady(c)
                        ? auditCommitteePath(c.name)
                        : `/committees/${encodeURIComponent(c.name)}`
                    }
                    className="hover:underline"
                  >
                    {c.name}
                  </Link>
                </h3>
                <span className="text-sm text-(--color-text-tertiary)">
                  {c.status === "reported" ? "계획서 의결 전 · 보도된 예정 일정" : c.period}
                </span>
              </div>
              <ul className="mt-3 divide-y divide-(--color-border-primary) text-sm">
                {/* 상세 페이지가 있는 위원회는 앞 3일만 — 전체 일정은 상세 페이지에서 본다 */}
                {(isAuditCommitteePageReady(c) ? c.days.slice(0, 3) : c.days).map((day, i) => (
                  <li key={`${c.short}-${i}`} className="flex gap-3 py-1.5">
                    <span className="w-28 shrink-0 text-(--color-text-tertiary) tabular-nums sm:w-36">
                      {formatAuditDate(day.date)}
                    </span>
                    <span className="text-(--color-text-primary)">{day.target}</span>
                  </li>
                ))}
              </ul>
              {c.note && <p className="mt-2 text-sm text-(--color-text-secondary)">{c.note}</p>}
              {isAuditCommitteePageReady(c) && (
                <Link
                  href={auditCommitteePath(c.name)}
                  className="mt-3 inline-block text-sm font-semibold text-(--color-primary) hover:underline"
                >
                  {c.days.length > 3 ? `외 ${c.days.length - 3}일 일정과 ` : ""}
                  {c.short} 증인·쟁점 자세히 보기 →
                </Link>
              )}
              <AuditSources sources={c.sources.slice(0, 2)} />
            </article>
          ))}
        </div>

        <div className="rounded-xl border border-dashed border-(--color-border-primary) p-4">
          <h3 className="text-base font-bold">세부 일정 확인 중</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {pending.map((c) => (
              <li key={c.name}>
                <Link
                  href={`/committees/${encodeURIComponent(c.name)}`}
                  className="font-semibold hover:underline"
                >
                  {c.name}
                </Link>
                {c.period ? (
                  <span className="text-(--color-text-tertiary)"> · {c.period}</span>
                ) : null}
                {c.note && <p className="text-(--color-text-secondary)">{c.note}</p>}
                <AuditSources sources={c.sources} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <AdSlot placement="audit-hub" />

      <section aria-labelledby="dates-title" className="space-y-3">
        <h2 id="dates-title" className="text-2xl font-bold">
          날짜별로 보기
        </h2>
        <p className="text-sm text-(--color-text-secondary)">
          위원회별 일정을 날짜순으로 모았습니다. 같은 날 여러 상임위가 동시에 열립니다.
          &lsquo;예정&rsquo;은 계획서 의결 전 보도된 일정입니다.
        </p>
        <details className="group rounded-xl border border-(--color-border-primary) p-4">
          <summary className="cursor-pointer text-sm font-semibold text-(--color-primary)">
            날짜별 전체 일정 펼치기 ({dates.length}일)
          </summary>
          <div className="mt-4">
            <ol className="space-y-4">
              {dates.map(([key, rows]) => (
                <li key={key}>
                  <h3 className="text-sm font-bold text-(--color-text-primary) tabular-nums">
                    {formatAuditMd(key.slice(5))}
                  </h3>
                  <ul className="mt-1 divide-y divide-(--color-border-primary) border-y border-(--color-border-primary) text-sm">
                    {rows.map((r, i) => (
                      <li key={`${key}-${i}`} className="flex gap-3 py-1.5">
                        <span className="w-20 shrink-0 font-medium">{r.committee.short}</span>
                        <span className="text-(--color-text-secondary)">
                          {r.target}
                          {r.date.includes("~") ? ` (${formatAuditDate(r.date)})` : ""}
                          {r.committee.status === "reported" ? " (예정)" : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </details>
      </section>

      <section aria-labelledby="live-title" className="space-y-3">
        <h2 id="live-title" className="text-2xl font-bold">
          국회가 공개한 국정감사 회의
        </h2>
        {liveSchedules.length > 0 ? (
          <ul className="divide-y divide-(--color-border-primary) text-sm">
            {liveSchedules.map((s) => (
              <li key={s.id} className="flex flex-wrap gap-x-3 py-2">
                <span className="text-(--color-text-tertiary) tabular-nums">
                  {s.meetingDate} {s.meetingTime}
                </span>
                <span className="font-medium">{s.committeeName || s.title}</span>
                <span className="text-(--color-text-secondary)">
                  {auditAgendaText(s.agenda, s.title)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-(--color-text-secondary)">
            국회가 회의 일정을 공개하면 이곳에 자동으로 표시됩니다(보통 감사 며칠 전 등록). 전체
            국회 일정은{" "}
            <Link href="/schedule" className="text-(--color-primary) underline underline-offset-2">
              국회 일정
            </Link>
            에서 볼 수 있습니다.
          </p>
        )}
      </section>

      <section aria-labelledby="issues-title" className="space-y-4">
        <h2 id="issues-title" className="text-2xl font-bold">
          주요 쟁점
        </h2>
        {d.issues.map((issue) => (
          <article
            key={issue.title}
            className="rounded-xl border border-(--color-border-primary) p-4"
          >
            <h3 className="text-lg font-bold">{issue.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
              {issue.body}
            </p>
            {issue.quotes && (
              <ul className="mt-3 space-y-2">
                {issue.quotes.map((q) => (
                  <li
                    key={q.who}
                    className="border-l-2 border-(--color-border-primary) pl-3 text-sm"
                  >
                    <p className="text-(--color-text-primary)">&ldquo;{q.text}&rdquo;</p>
                    <p className="mt-0.5 text-xs text-(--color-text-tertiary)">— {q.who}</p>
                  </li>
                ))}
              </ul>
            )}
            {issue.committees.length > 0 && (
              <p className="mt-3 flex flex-wrap gap-2 text-xs">
                {issue.committees.map((name) => (
                  <Link
                    key={name}
                    href={`/committees/${encodeURIComponent(name)}`}
                    className="rounded-full border border-(--color-border-primary) px-2 py-0.5 text-(--color-text-secondary) hover:bg-(--color-bg-secondary)"
                  >
                    {name}
                  </Link>
                ))}
              </p>
            )}
            <AuditSources sources={issue.sources} />
          </article>
        ))}
      </section>
    </div>
  );
}
