import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import CabinetNomineeCard from "@/components/issues/CabinetNomineeCard";
import { getMember, getMemberScorecard, getUpcomingSchedules } from "@/lib/api";
import { CABINET_2026_08 } from "@/data/cabinet-nominees";
import type { MemberScorecard, Schedule } from "@/types";

const TERM_ID = 22;
const BASE = "https://www.lawmake.kr";
const d = CABINET_2026_08;
const CANONICAL = `${BASE}${d.path}`;
const ENDED = new Set(["withdrawn", "nomination_withdrawn"]);

// 편집 데이터는 코드 배포로 바뀌고, 성적표 수치는 daily sync 주기라 하루 한 번 재생성이면 충분하다.
export const revalidate = 86400;

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

/** 후보자명 + '인사청문'이 제목·안건에 함께 있는 일정만 골라 표시 (날짜 표시용, 상태 전환에는 쓰지 않음) */
function pickHearingSchedules(schedules: Schedule[]): Schedule[] {
  const names = d.ministers.map((m) => m.name);
  return schedules.filter((s) => {
    const text = `${s.title} ${s.agenda ?? ""}`;
    return text.includes("인사청문") && names.some((n) => text.includes(n));
  });
}

function MemberBadge() {
  return (
    <span className="shrink-0 rounded-full bg-(--color-bg-tertiary) px-2 py-0.5 text-xs font-medium text-(--color-text-secondary)">
      현역 의원
    </span>
  );
}

export default async function CabinetIssuePage() {
  const memberNominees = d.ministers.filter((m) => m.memberId);

  // 의원 후보자 지표·기본정보는 병렬로, 한 명이 실패해도 페이지는 살린다
  const [scorecardResults, memberResults, scheduleResult] = await Promise.all([
    Promise.allSettled(
      memberNominees.map((m) => getMemberScorecard({ memberId: m.memberId!, termId: TERM_ID })),
    ),
    Promise.allSettled(memberNominees.map((m) => getMember(m.memberId!))),
    getUpcomingSchedules(TERM_ID, 30).catch(() => [] as Schedule[]),
  ]);

  const scorecards = new Map<string, { data: MemberScorecard | null; failed: boolean }>();
  const electedCounts = new Map<string, number>();
  memberNominees.forEach((m, i) => {
    const r = scorecardResults[i];
    scorecards.set(m.memberId!, {
      data: r.status === "fulfilled" ? r.value : null,
      failed: r.status === "rejected",
    });
    const mr = memberResults[i];
    if (mr.status === "fulfilled" && mr.value)
      electedCounts.set(m.memberId!, mr.value.electedCount);
  });

  const hearings = pickHearingSchedules(scheduleResult);
  const nonMemberNominees = d.ministers.filter((m) => !m.memberId);
  const appointed = d.ministers.filter((m) => m.status === "appointed").length;
  const ended = d.ministers.filter((m) => ENDED.has(m.status)).length;

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: d.title,
          description: d.description,
          datePublished: d.publishedAt,
          dateModified: d.updatedAt,
          author: { "@type": "Organization", name: "lawmake 편집팀" },
          publisher: { "@type": "Organization", name: "lawmake.kr" },
          mainEntityOfPage: CANONICAL,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "홈", item: BASE },
            { "@type": "ListItem", position: 2, name: d.title, item: CANONICAL },
          ],
        }}
      />

      {/* 헤더 */}
      <header className="space-y-4">
        <p className="text-xs font-semibold tracking-wide text-(--color-text-tertiary)">
          이슈 · 인사청문
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight">{d.title}</h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-(--color-text-tertiary)">
          <span>
            지명 <time dateTime={d.announcedAt}>{d.announcedAtLabel}</time>
          </span>
          <span>
            업데이트 <time dateTime={d.updatedAt}>{d.updatedAt}</time>
          </span>
          <span className="tabular-nums">
            후보자 {d.ministers.length}명 · 임명 {appointed} · 사퇴·철회 {ended}
          </span>
          {hearings.length === 0 && <span>청문회 일정 미등록</span>}
        </div>
        <p className="text-base leading-relaxed text-(--color-text-secondary)">{d.lead}</p>
        <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-secondary) px-4 py-3 text-xs leading-relaxed text-(--color-text-secondary)">
          <span className="font-semibold text-(--color-text-primary)">편집 원칙 </span>
          {d.disclaimer}{" "}
          <Link
            href="/about/methodology"
            className="text-(--color-primary) underline underline-offset-2"
          >
            지표 산출 방법
          </Link>
        </div>
      </header>

      {/* 6개 부처 전환표 — 모바일은 전환 리스트, 데스크톱은 표 */}
      <section aria-labelledby="ministries-title" className="space-y-3">
        <h2 id="ministries-title" className="text-2xl font-bold">
          6개 부처, 누가 누구를 잇나
        </h2>
        <ul className="divide-y divide-(--color-border-primary) rounded-xl border border-(--color-border-primary) sm:hidden">
          {d.ministers.map((m) => (
            <li key={m.slug} className="px-4 py-3">
              <p className="text-xs font-semibold text-(--color-text-tertiary)">{m.ministry}</p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                <span className="text-(--color-text-secondary)">
                  <span className="sr-only">현 장관 </span>
                  {m.incumbent ? m.incumbent.name : "공석"}
                </span>
                <span aria-hidden="true" className="text-(--color-text-tertiary)">
                  →
                </span>
                <a href={`#nominee-${m.slug}`} className="font-bold text-(--color-text-primary)">
                  <span className="sr-only">후보자 </span>
                  {m.name}
                </a>
                {m.memberId && <MemberBadge />}
              </p>
              <p className="mt-0.5 text-xs text-(--color-text-tertiary)">
                {m.currentRole} · 청문 {m.hearingCommittee}(예상)
              </p>
            </li>
          ))}
        </ul>
        <div className="hidden overflow-x-auto rounded-xl border border-(--color-border-primary) sm:block">
          <table className="w-full text-sm">
            <caption className="sr-only">6개 부처의 현 장관과 후보자, 청문 상임위</caption>
            <thead className="bg-(--color-bg-secondary) text-left text-xs text-(--color-text-tertiary)">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">
                  부처
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  현 장관
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  후보자
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  현직
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  청문 상임위(예상)
                </th>
              </tr>
            </thead>
            <tbody>
              {d.ministers.map((m) => (
                <tr key={m.slug} className="border-t border-(--color-border-primary)">
                  <td className="px-3 py-2.5 font-semibold">{m.ministry}</td>
                  <td className="px-3 py-2.5 text-(--color-text-secondary)">
                    {m.incumbent ? (
                      m.incumbent.memberId ? (
                        <Link
                          href={`/members/${m.incumbent.memberId}`}
                          className="text-(--color-primary) underline underline-offset-2"
                        >
                          {m.incumbent.name}
                        </Link>
                      ) : (
                        m.incumbent.name
                      )
                    ) : (
                      <span className="text-(--color-text-tertiary)">공석</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1.5">
                      <a
                        href={`#nominee-${m.slug}`}
                        className="font-bold text-(--color-text-primary)"
                      >
                        {m.name}
                      </a>
                      {m.memberId && <MemberBadge />}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-(--color-text-secondary)">{m.currentRole}</td>
                  <td className="px-3 py-2.5 text-(--color-text-secondary)">
                    {m.hearingCommittee}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 인사청문회 일정 — 국회 일정에 등록된 것이 있을 때만 */}
      {hearings.length > 0 && (
        <section aria-labelledby="hearing-title" className="space-y-3">
          <h2 id="hearing-title" className="text-2xl font-bold">
            인사청문회 일정
          </h2>
          <ul className="divide-y divide-(--color-border-primary) rounded-xl border border-(--color-border-primary)">
            {hearings.map((s) => (
              <li key={s.id} className="space-y-0.5 px-4 py-3 text-sm">
                <p className="font-semibold tabular-nums">
                  <time dateTime={`${s.meetingDate}T${s.meetingTime}`}>
                    {s.meetingDate} {s.meetingTime}
                  </time>
                </p>
                <p className="text-(--color-text-secondary)">{s.committeeName}</p>
                <p className="text-(--color-text-primary)">
                  {s.title}
                  {s.linkUrl && (
                    <a
                      href={s.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-xs text-(--color-primary) underline underline-offset-2"
                    >
                      국회 일정<span aria-hidden="true"> ↗</span>
                    </a>
                  )}
                </p>
              </li>
            ))}
          </ul>
          <p className="text-xs text-(--color-text-tertiary)">
            국회 의사일정에 등록된 청문회만 표시합니다. 등록 후 하루 안에 반영됩니다.
          </p>
        </section>
      )}

      {/* 의원 후보자 */}
      <section aria-labelledby="member-nominees-title" className="space-y-4">
        <div>
          <h2 id="member-nominees-title" className="text-2xl font-bold">
            국회에서 온 후보자 {memberNominees.length}명
          </h2>
          <p className="mt-1 text-sm text-(--color-text-secondary)">
            현역 의원 후보자의 22대 의정활동 기록을 lawmake 데이터로 정리했습니다. 경제부총리 등
            관료·군 출신 후보자 {nonMemberNominees.length}명은 아래에 있습니다.
          </p>
        </div>
        <div className="space-y-4">
          {memberNominees.map((m) => {
            const sc = scorecards.get(m.memberId!);
            return (
              <CabinetNomineeCard
                key={m.slug}
                nominee={m}
                scorecard={sc?.data ?? null}
                scorecardFailed={sc?.failed}
                electedCount={electedCounts.get(m.memberId!)}
              />
            );
          })}
        </div>
      </section>

      {/* 비의원 후보자 */}
      <section aria-labelledby="other-nominees-title" className="space-y-4">
        <div>
          <h2 id="other-nominees-title" className="text-2xl font-bold">
            관료·군에서 온 후보자 {nonMemberNominees.length}명
          </h2>
          <p className="mt-1 text-sm text-(--color-text-secondary)">
            국회의원이 아닌 후보자는 의정활동 데이터 적용 대상이 아니며, 약력은 지명 발표와 공식
            자료 기준입니다.
          </p>
        </div>
        <div className="space-y-4">
          {nonMemberNominees.map((m) => (
            <CabinetNomineeCard key={m.slug} nominee={m} scorecard={null} />
          ))}
        </div>
      </section>

      {/* 청와대 인선 */}
      <section aria-labelledby="office-title" className="space-y-3">
        <h2 id="office-title" className="text-2xl font-bold">
          청와대는 누가 가나
        </h2>
        <ul className="divide-y divide-(--color-border-primary) rounded-xl border border-(--color-border-primary)">
          {d.presidentialOffice.map((p) => (
            <li key={p.name} className="px-4 py-3">
              <p className="text-xs font-semibold text-(--color-text-tertiary)">{p.position}</p>
              <h3 className="mt-0.5 text-base font-bold">
                {p.memberId ? (
                  <Link
                    href={`/members/${p.memberId}`}
                    className="text-(--color-primary) underline underline-offset-2"
                  >
                    {p.name}
                  </Link>
                ) : (
                  p.name
                )}
                <span className="ml-2 text-sm font-medium text-(--color-text-secondary)">
                  {p.currentRole}
                </span>
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-(--color-text-secondary)">
                {p.bio} <span className="text-(--color-text-tertiary)">{p.note}</span>
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* 복귀하는 장관 */}
      <section aria-labelledby="outgoing-title" className="space-y-3">
        <h2 id="outgoing-title" className="text-2xl font-bold">
          국회로 돌아오는 장관 {d.outgoing.length}명
        </h2>
        <p className="text-sm text-(--color-text-secondary)">
          후임이 임명되면 이임하고 의원 활동으로 복귀합니다. 실제 이임일이 확인되면 겸직 이력으로
          전환해 표시합니다.
        </p>
        <ul className="divide-y divide-(--color-border-primary) rounded-xl border border-(--color-border-primary)">
          {d.outgoing.map((o) => (
            <li key={o.memberId} className="px-4 py-3 text-sm">
              <Link
                href={`/members/${o.memberId}`}
                className="font-bold text-(--color-primary) underline underline-offset-2"
              >
                {o.name}
              </Link>
              <span className="ml-2 text-(--color-text-secondary)">{o.position}</span>
              <p className="mt-1 text-(--color-text-secondary)">{o.note}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 출처·관련 */}
      <section aria-labelledby="sources-title" className="space-y-3">
        <h2 id="sources-title" className="text-xl font-bold">
          출처와 함께 읽기
        </h2>
        <ul className="space-y-1.5 text-sm">
          {d.sources.map((s) => (
            <li key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-(--color-primary) underline underline-offset-2"
              >
                {s.outlet} · {s.title} ({s.date})<span aria-hidden="true"> ↗</span>
              </a>
            </li>
          ))}
        </ul>
        <ul className="space-y-1.5 text-sm">
          {d.related.map((r) => (
            <li key={r.href}>
              <Link
                href={r.href}
                className="text-(--color-text-secondary) underline underline-offset-2"
              >
                {r.title}
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-xs text-(--color-text-tertiary)">
          이 페이지는 청문회·임명 결과까지 갱신한 뒤 기록으로 유지됩니다. 오류 정정 요청은{" "}
          <Link
            href="/about/methodology"
            className="text-(--color-primary) underline underline-offset-2"
          >
            방법론 페이지
          </Link>
          의 절차를 따릅니다.
        </p>
      </section>
    </div>
  );
}
