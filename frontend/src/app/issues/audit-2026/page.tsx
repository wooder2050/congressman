import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/ads/AdSlot";
import JsonLd from "@/components/seo/JsonLd";
import AuditAgencySearch from "@/components/issues/AuditAgencySearch";
import AuditShortsSection from "@/components/issues/AuditShortsSection";
import AuditChangeList from "@/components/issues/AuditChangeList";
import AuditSources from "@/components/issues/AuditSources";
import AuditTodayBoard from "@/components/issues/AuditTodayBoard";
import {
  AUDIT_2026,
  auditCommitteePath,
  isAuditCommitteePageReady,
  recentAuditChanges,
  type AuditCommittee,
} from "@/data/audit-2026";
import { AUDIT_AGENCIES_VERIFIED_AT, AUDIT_AGENCY_COUNT } from "@/data/audit-2026-agency-meta";
import { getUpcomingSchedulesByKeyword } from "@/lib/api";
import {
  auditDayKey,
  auditStatus,
  auditStatusClass,
  formatAuditDate,
  formatAuditMd,
  auditAgendaText,
  expandAuditDate,
  kstDateKey,
  remainingAuditDays,
} from "@/lib/audit-format";
import type { Schedule } from "@/types";

const TERM_ID = 22;
const BASE = "https://www.lawmake.kr";
const d = AUDIT_2026;
const CANONICAL = `${BASE}${d.path}`;

// 편집 데이터는 배포로 바뀌고, 진행 상태 배지·오늘의 국감 보드·국회 공개 일정이 시간에 따라 달라진다.
// 오늘 보드의 날짜 경계(자정) 지연을 줄이려고 허브만 15분 — 상임위 상세는 1시간 유지(ISR 비용).
export const revalidate = 900;

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
  const now = new Date();
  const todayKey = kstDateKey(now);
  const beforeStart = todayKey < d.start;
  const upcomingAudit = pickAuditSchedules(
    await getUpcomingSchedulesByKeyword(TERM_ID, "국정감사").catch(() => [] as Schedule[]),
  );
  // 허브에는 일주일 치만 — 국감 기간엔 하루 회의가 수십 건이라 전체는 상임위 페이지에서 본다
  const weekEnd = kstDateKey(now, 7);
  const liveSchedules = upcomingAudit.filter((s) => s.meetingDate <= weekEnd);
  const laterCount = upcomingAudit.length - liveSchedules.length;
  const changes = recentAuditChanges(5);
  const lastChecked = d.committees
    .map((c) => c.checkedAt ?? "")
    .sort()
    .at(-1);

  const toneClass = auditStatusClass(status.tone);

  return (
    // google-anno-skip: 자동 광고 '의도 기반 형식'이 일정·쟁점 본문에 링크·칩("정치(좌익)" 등)을
    // 끼워 넣지 못하게 막는다. 콘솔에서도 링크·칩은 껐고(2026-10-03) 이 클래스는 이중 장치다.
    <div className="google-anno-skip mx-auto max-w-4xl space-y-10">
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
        <p className="text-base text-(--color-text-secondary)">
          10월 6일~30일 · 상임위원회 17곳 · 피감기관 846곳(국회사무처 집계) — 오늘 감사 일정과 우리
          기관 감사일, 위원회별 증인·쟁점을 확인하세요.
        </p>
        <nav aria-label="국정감사 페이지 안 바로가기" className="-mx-1 overflow-x-auto">
          <ul className="flex w-max gap-2 px-1 text-sm">
            {[
              ["#today", beforeStart ? "첫 감사일" : "오늘 일정"],
              ["#agency-search", "기관명 찾기"],
              ["#committees", "위원회별 일정"],
              ["#dates", "날짜별 보기"],
              ["#changes", "변경 이력"],
              ["#issues", "주요 쟁점"],
            ].map(([href, label]) => (
              <li key={href}>
                <a
                  href={href}
                  className="inline-flex min-h-10 items-center rounded-full border border-(--color-border-primary) px-3 font-medium text-(--color-text-primary) no-underline hover:bg-(--color-bg-secondary)"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* 국감 전엔 '우리 기관 감사일'(검색)이, 국감 중엔 '오늘 어디가 감사하나'(보드)가 먼저다.
          2026-10-05 codex(gpt-6.1-sol) UX 검토 — 중계 링크는 보드 제목 바로 아래 */}
      {beforeStart ? (
        <>
          <div id="agency-search" className="scroll-mt-32">
            <AuditAgencySearch
              agencyCount={AUDIT_AGENCY_COUNT}
              pageCommittees={d.committees.filter(isAuditCommitteePageReady).map((c) => c.name)}
              pendingCommittees={d.committees
                .filter((c) => c.status !== "confirmed")
                .map((c) => ({
                  name: c.name,
                  short: c.short,
                  status: c.status as "reported" | "pending",
                }))}
              verifiedAt={AUDIT_AGENCIES_VERIFIED_AT}
            />
          </div>
          <AuditTodayBoard now={now} />
        </>
      ) : (
        <>
          <AuditTodayBoard now={now} />
          <div id="agency-search" className="scroll-mt-32">
            <AuditAgencySearch
              agencyCount={AUDIT_AGENCY_COUNT}
              pageCommittees={d.committees.filter(isAuditCommitteePageReady).map((c) => c.name)}
              pendingCommittees={d.committees
                .filter((c) => c.status !== "confirmed")
                .map((c) => ({
                  name: c.name,
                  short: c.short,
                  status: c.status as "reported" | "pending",
                }))}
              verifiedAt={AUDIT_AGENCIES_VERIFIED_AT}
            />
          </div>
        </>
      )}

      {/* 쇼츠는 DB 등록만으로 나타난다(배포 불필요). 영상이 없으면 섹션째 숨김 */}
      <AuditShortsSection placement="hub" />

      <section id="changes" aria-labelledby="changes-title" className="scroll-mt-32 space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="changes-title" className="text-xl font-bold">
            최근 바뀐 일정·명단
          </h2>
          {lastChecked && (
            <span className="text-xs text-(--color-text-tertiary)">
              위원회 게시판 확인 {formatAuditMd(lastChecked.slice(5))} 기준
            </span>
          )}
        </div>
        <AuditChangeList
          items={changes.map(({ committee, change }) => ({
            change,
            committee: {
              name: committee.name,
              short: committee.short,
              href: isAuditCommitteePageReady(committee)
                ? `${auditCommitteePath(committee.name)}#changes`
                : undefined,
            },
          }))}
          emptyText="10월 3일 기록을 시작한 뒤 확인된 변경이 없습니다."
        />
        <p className="text-xs text-(--color-text-tertiary)">
          위원회 게시판에 계획서 수정본이나 명단 변경이 올라오면 확인한 날짜와 함께 기록합니다(10월
          3일부터). 확인 이후에도 일정은 바뀔 수 있으니 감사 전날 위원회 공지를 함께 확인하세요.
        </p>
      </section>

      {/* 검색 결과·복사 버튼과 떨어진 자리(오클릭 방지). 일정 탐색·변경 요약을 마친 뒤 위원회 목록 앞 */}
      <AdSlot placement="audit-hub-main" />

      <section
        id="committees"
        aria-labelledby="committees-title"
        className="scroll-mt-32 space-y-4"
      >
        <h2 id="committees-title" className="text-2xl font-bold">
          상임위원회별 감사 일정
        </h2>
        <p className="text-sm text-(--color-text-secondary)">
          17개 상임위원회 중 {confirmed.length}곳은 국정감사계획서로 일정을 확인했습니다.
          {reported.length > 0 &&
            ` ${reported.length}곳은 계획서 원문 확인 전 보도된 예정 일정입니다.`}{" "}
          나머지는 확인되는 대로 추가합니다.
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
                  {!beforeStart &&
                    c.days.some((day) => expandAuditDate(day.date).includes(todayKey)) && (
                      <span className="mr-2 rounded-full bg-(--color-text-primary) px-2 py-0.5 text-xs font-semibold text-(--color-text-inverse)">
                        오늘 감사 예정
                      </span>
                    )}
                  {c.status === "reported" ? "계획서 원문 확인 전 · 보도된 예정 일정" : c.period}
                </span>
              </div>
              {c.status === "confirmed" && c.checkedAt && (
                <p className="mt-1 text-xs text-(--color-text-tertiary)">
                  위원회 게시판 확인 {formatAuditMd(c.checkedAt.slice(5))}
                  {c.changes?.length ? (
                    <>
                      {" · "}
                      <Link
                        href={`${auditCommitteePath(c.name)}#changes`}
                        className="font-semibold text-(--color-primary) hover:underline"
                      >
                        변경 {c.changes.length}건
                      </Link>
                    </>
                  ) : (
                    " · 기록된 변경 없음"
                  )}
                </p>
              )}
              <ul className="mt-3 divide-y divide-(--color-border-primary) text-sm">
                {/* 상세 페이지가 있는 위원회는 앞 3일만 — 전체 일정은 상세 페이지에서 본다 */}
                {(isAuditCommitteePageReady(c)
                  ? remainingAuditDays(c.days, todayKey).slice(0, 3)
                  : c.days
                ).map((day, i) => (
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
                  {c.short} 전체 일정·증인·쟁점 보기
                  {remainingAuditDays(c.days, todayKey).length > 3
                    ? ` (남은 일정 ${remainingAuditDays(c.days, todayKey).length - 3}개 더)`
                    : ""}{" "}
                  →
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

      <AdSlot placement="audit-hub-deep" />

      <section id="dates" aria-labelledby="dates-title" className="scroll-mt-32 space-y-3">
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
        <p className="text-xs text-(--color-text-tertiary)">
          국감 관련 안건이 들어간 국회 공개 회의(증인 변경 등)를 매일 자동으로 가져옵니다. 실제 감사
          일정 전체는 아니며, 앞으로 일주일 치만 보여 줍니다.
        </p>
        {liveSchedules.length > 0 ? (
          <ul className="divide-y divide-(--color-border-primary) text-sm">
            {liveSchedules.map((s) => (
              <li key={s.id} className="flex flex-wrap gap-x-3 py-2">
                <span className="text-(--color-text-tertiary) tabular-nums">
                  {formatAuditMd(s.meetingDate.slice(5))} {s.meetingTime}
                </span>
                <span className="font-medium">{s.committeeName || s.title}</span>
                <span className="text-(--color-text-secondary)">
                  {auditAgendaText(s.agenda, s.title)}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        {laterCount > 0 && (
          <p className="text-xs text-(--color-text-tertiary)">
            {liveSchedules.length === 0 ? "앞으로 일주일 안에는 등록된 회의가 없습니다. " : ""}그
            뒤로 등록된 회의 {laterCount}건은 상임위원회별 페이지에서 볼 수 있습니다.
          </p>
        )}
        {upcomingAudit.length === 0 && (
          <p className="text-sm text-(--color-text-secondary)">
            앞으로 일주일 안에 국감 관련 안건이 들어간 공개 회의가 없습니다. 전체 국회 일정은{" "}
            <Link href="/schedule" className="text-(--color-primary) underline underline-offset-2">
              국회 일정
            </Link>
            에서 볼 수 있습니다.
          </p>
        )}
      </section>

      <section id="issues" aria-labelledby="issues-title" className="scroll-mt-32 space-y-4">
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

      <section id="about" aria-labelledby="about-title" className="scroll-mt-32 space-y-3">
        <h2 id="about-title" className="text-xl font-bold">
          이 페이지에 대해
        </h2>
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
      </section>
    </div>
  );
}
