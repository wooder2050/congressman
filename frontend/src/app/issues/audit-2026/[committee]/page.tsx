import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdSlot from "@/components/ads/AdSlot";
import AuditSources from "@/components/issues/AuditSources";
import JsonLd from "@/components/seo/JsonLd";
import {
  AUDIT_2026,
  auditCommitteePath,
  isAuditCommitteePageReady,
  type AuditCommittee,
} from "@/data/audit-2026";
import { getCommitteeDetail, getUpcomingSchedules } from "@/lib/api";
import {
  auditStatus,
  auditStatusClass,
  formatAuditDate,
  auditAgendaText,
} from "@/lib/audit-format";
import { committeeAliasLabel } from "@/lib/committee-aliases";
import type { CommitteeMemberInfo, Schedule } from "@/types";

const TERM_ID = 22;
const BASE = "https://www.lawmake.kr";
const d = AUDIT_2026;

// 편집 데이터는 배포로 바뀌고, 진행 상태 배지·소속 위원·국회 공개 일정만 시간에 따라 달라진다.
export const revalidate = 3600;
// 공개 기준(isAuditCommitteePageReady)을 통과한 위원회만 만든다. 나머지 경로는 404.
export const dynamicParams = false;

interface PageProps {
  params: Promise<{ committee: string }>;
}

export function generateStaticParams() {
  return d.committees.filter(isAuditCommitteePageReady).map((c) => ({ committee: c.name }));
}

function findCommittee(param: string): AuditCommittee | undefined {
  const name = decodeURIComponent(param);
  return d.committees.find((c) => c.name === name && isAuditCommitteePageReady(c));
}

function pageTitle(c: AuditCommittee): string {
  const alias = committeeAliasLabel(c.name);
  return `2026 국정감사 ${c.name}${alias ? `(${alias})` : ""} 일정 — 날짜별 피감기관·증인·쟁점`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { committee } = await params;
  const c = findCommittee(committee);
  if (!c) return {};
  const title = pageTitle(c);
  const description =
    c.summary!.length > 150 ? `${c.summary!.slice(0, 149)}…` : (c.summary as string);
  const url = `${BASE}${auditCommitteePath(c.name)}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: d.publishedAt,
      modifiedTime: d.updatedAt,
    },
  };
}

/** 위원장 → 간사 → 위원 순, 같은 역할 안에서는 정당·이름 순 */
function sortMembers(members: CommitteeMemberInfo[]): CommitteeMemberInfo[] {
  const rank = (role: string) => (role.includes("위원장") ? 0 : role.includes("간사") ? 1 : 2);
  return [...members].sort(
    (a, b) =>
      rank(a.role) - rank(b.role) ||
      a.partyName.localeCompare(b.partyName, "ko") ||
      a.name.localeCompare(b.name, "ko"),
  );
}

/** 국회가 공개한 회의 일정 중 이 위원회의 국정감사 (daily sync가 채운다) */
function pickCommitteeAuditSchedules(schedules: Schedule[], name: string): Schedule[] {
  return schedules.filter(
    (s) =>
      `${s.title} ${s.agenda ?? ""}`.includes("국정감사") &&
      `${s.committeeName ?? ""} ${s.title}`.includes(name),
  );
}

export default async function AuditCommitteePage({ params }: PageProps) {
  const { committee } = await params;
  const c = findCommittee(committee);
  if (!c) notFound();

  const status = auditStatus(new Date());
  const [detail, upcoming] = await Promise.all([
    getCommitteeDetail({ name: c.name, termId: TERM_ID }).catch(() => null),
    getUpcomingSchedules(TERM_ID, 100).catch(() => [] as Schedule[]),
  ]);
  const members = detail ? sortMembers(detail.members) : [];
  const liveSchedules = pickCommitteeAuditSchedules(upcoming, c.name);
  // 위원회 전용 쟁점이 있으면 그것을, 없으면 허브 쟁점 중 이 위원회 것을 보여 준다
  const issues = c.issues?.length
    ? c.issues
    : d.issues.filter((i) => i.committees.includes(c.name));
  const adopted = (c.witnesses ?? []).filter((w) => w.status === "adopted");
  const requested = (c.witnesses ?? []).filter((w) => w.status === "requested");
  const others = d.committees.filter((o) => o.name !== c.name && isAuditCommitteePageReady(o));
  const url = `${BASE}${auditCommitteePath(c.name)}`;

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "홈", item: BASE },
            { "@type": "ListItem", position: 2, name: "2026 국정감사", item: `${BASE}${d.path}` },
            { "@type": "ListItem", position: 3, name: c.name, item: url },
          ],
        }}
      />

      <header className="space-y-4">
        <p className="text-xs font-semibold tracking-wide text-(--color-text-tertiary)">
          <Link href={d.path} className="hover:underline">
            2026 국정감사
          </Link>{" "}
          · 상임위원회별 일정
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight break-keep">
          {c.name} 국정감사 일정과 쟁점
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-(--color-text-tertiary)">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${auditStatusClass(status.tone)}`}
          >
            {status.label}
          </span>
          {c.period && <span>{c.period}</span>}
          {c.resolvedOn && <span className="tabular-nums">계획서 의결 {c.resolvedOn}</span>}
          <span className="tabular-nums">최종 갱신 {d.updatedAt}</span>
        </div>
        <p className="text-base leading-relaxed text-(--color-text-secondary)">{c.summary}</p>
        {c.scope && (
          <p className="text-sm text-(--color-text-tertiary)">
            <span className="font-semibold text-(--color-text-secondary)">감사 대상 </span>
            {c.scope}
          </p>
        )}
      </header>

      <section aria-labelledby="days-title" className="space-y-3">
        <h2 id="days-title" className="text-2xl font-bold">
          날짜별 감사 일정
        </h2>
        <ul className="divide-y divide-(--color-border-primary) border-y border-(--color-border-primary) text-sm">
          {c.days.map((day, i) => (
            <li key={`${day.date}-${i}`} className="flex gap-3 py-2">
              <span className="w-28 shrink-0 text-(--color-text-tertiary) tabular-nums sm:w-40">
                {formatAuditDate(day.date)}
              </span>
              <span>
                <span className="text-(--color-text-primary)">{day.detail ?? day.target}</span>
                {day.note && (
                  <span className="block text-xs text-(--color-text-secondary)">{day.note}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
        {c.note && <p className="text-sm text-(--color-text-secondary)">{c.note}</p>}
        <AuditSources sources={c.sources} />
      </section>

      <AdSlot placement="audit-hub" />

      {(adopted.length > 0 || requested.length > 0) && (
        <section aria-labelledby="witness-title" className="space-y-3">
          <h2 id="witness-title" className="text-2xl font-bold">
            증인·참고인
          </h2>
          {adopted.length > 0 && (
            <div>
              <h3 className="text-sm font-bold">위원회가 채택한 증인·참고인</h3>
              <ul className="mt-1 divide-y divide-(--color-border-primary) text-sm">
                {adopted.map((w) => (
                  <li key={w.name + w.affiliation} className="py-1.5">
                    <span className="font-medium">{w.name}</span>{" "}
                    <span className="text-(--color-text-tertiary)">
                      {w.affiliation}
                      {w.kind ? ` · ${w.kind}` : ""}
                    </span>
                    {w.date && (
                      <span className="text-(--color-text-tertiary)">
                        {" "}
                        · {formatAuditDate(w.date)}
                      </span>
                    )}
                    {w.topic && (
                      <span className="block text-(--color-text-secondary)">{w.topic}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {requested.length > 0 && (
            <div>
              <h3 className="text-sm font-bold">신청됐으나 채택되지 않은 증인</h3>
              <ul className="mt-1 divide-y divide-(--color-border-primary) text-sm">
                {requested.map((w) => (
                  <li key={w.name + w.affiliation} className="py-1.5">
                    <span className="font-medium">{w.name}</span>{" "}
                    <span className="text-(--color-text-tertiary)">
                      {w.affiliation}
                      {w.kind ? ` · ${w.kind}` : ""}
                    </span>
                    {w.topic && (
                      <span className="block text-(--color-text-secondary)">{w.topic}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {issues.length > 0 && (
        <section aria-labelledby="issues-title" className="space-y-4">
          <h2 id="issues-title" className="text-2xl font-bold">
            주요 쟁점
          </h2>
          {issues.map((issue) => (
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
              <AuditSources sources={issue.sources} />
            </article>
          ))}
        </section>
      )}

      {members.length > 0 && (
        <section aria-labelledby="members-title" className="space-y-3">
          <h2 id="members-title" className="text-2xl font-bold">
            감사에 나서는 {c.short} 위원 {members.length}명
          </h2>
          <p className="text-sm text-(--color-text-secondary)">
            이름을 누르면 의원별 의정활동·표결·재산 기록으로 이동합니다.
          </p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
            {members.map((m) => (
              <li key={m.memberId} className="flex items-baseline gap-1.5 py-0.5">
                <Link href={`/members/${m.memberId}`} className="font-medium hover:underline">
                  {m.name}
                </Link>
                <span className="truncate text-xs text-(--color-text-tertiary)">
                  {m.partyName}
                  {m.role && m.role !== "위원" ? ` · ${m.role}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="live-title" className="space-y-3">
        <h2 id="live-title" className="text-2xl font-bold">
          국회가 공개한 {c.short} 국정감사 회의
        </h2>
        {liveSchedules.length > 0 ? (
          <ul className="divide-y divide-(--color-border-primary) text-sm">
            {liveSchedules.map((s) => (
              <li key={s.id} className="flex flex-wrap gap-x-3 py-2">
                <span className="text-(--color-text-tertiary) tabular-nums">
                  {s.meetingDate} {s.meetingTime}
                </span>
                <span className="text-(--color-text-secondary)">
                  {auditAgendaText(s.agenda, s.title)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-(--color-text-secondary)">
            국회가 회의 일정을 공개하면 이곳에 자동으로 표시됩니다(보통 감사 며칠 전 등록). 위원회의
            법안·회의록은{" "}
            <Link
              href={`/committees/${encodeURIComponent(c.name)}`}
              className="text-(--color-primary) underline underline-offset-2"
            >
              {c.name} 페이지
            </Link>
            에서 볼 수 있습니다.
          </p>
        )}
      </section>

      <nav aria-labelledby="others-title" className="space-y-3">
        <h2 id="others-title" className="text-lg font-bold">
          다른 상임위원회 국정감사
        </h2>
        <p className="flex flex-wrap gap-2 text-sm">
          {others.map((o) => (
            <Link
              key={o.name}
              href={auditCommitteePath(o.name)}
              className="rounded-full border border-(--color-border-primary) px-3 py-1 hover:bg-(--color-bg-secondary)"
            >
              {o.short}
            </Link>
          ))}
          <Link
            href={d.path}
            className="rounded-full border border-(--color-border-primary) px-3 py-1 font-semibold hover:bg-(--color-bg-secondary)"
          >
            전체 일정 보기
          </Link>
        </p>
      </nav>
    </div>
  );
}
