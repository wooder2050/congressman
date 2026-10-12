import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/ads/AdSlot";
import JsonLd from "@/components/seo/JsonLd";
import AuditSources from "@/components/issues/AuditSources";
import { BUDGET_2027, type BudgetStepStatus } from "@/data/budget-2027";
import { getUpcomingSchedulesByKeyword } from "@/lib/api";
import type { Schedule } from "@/types";

const TERM_ID = 22;
const BASE = "https://www.lawmake.kr";
const d = BUDGET_2027;
const CANONICAL = `${BASE}${d.path}`;

// 편집 수치는 배포로 바뀌고, 예산 심사 회의 일정은 daily sync 주기라 1시간이면 충분하다.
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

const BUDGET_AGENDA = /2027년(?:도)?\s*(?:예산안|기금\s*운용\s*계획안)/;

/** '예산'·'기금' 검색 결과를 합쳐 2027년도 예산안·기금운용계획안 심사 회의만 남긴다(결산·추경·무관 회의 제외) */
function pickBudgetReviewSchedules(lists: Schedule[][]): Schedule[] {
  const byId = new Map<number, Schedule>();
  for (const s of lists.flat()) {
    const text = `${s.title} ${s.agenda ?? ""}`.replace(/\s+/g, " ");
    if (BUDGET_AGENDA.test(text)) byId.set(s.id, s);
  }
  return [...byId.values()]
    .sort((a, b) =>
      `${a.meetingDate} ${a.meetingTime}`.localeCompare(`${b.meetingDate} ${b.meetingTime}`),
    )
    .slice(0, 8);
}

function formatDate(iso: string): string {
  const [y, m, day] = iso.slice(0, 10).split("-").map(Number);
  const wd = ["일", "월", "화", "수", "목", "금", "토"][
    new Date(Date.UTC(y, m - 1, day)).getUTCDay()
  ];
  return `${m}월 ${day}일(${wd})`;
}

const STEP_STYLE: Record<BudgetStepStatus, { dot: string; label: string }> = {
  done: { dot: "bg-(--color-text-tertiary)", label: "완료" },
  current: { dot: "bg-(--color-primary)", label: "지금" },
  upcoming: {
    dot: "border-2 border-(--color-border-primary) bg-(--color-bg-primary)",
    label: "예정",
  },
  conditional: {
    dot: "border-2 border-dashed border-(--color-border-primary) bg-(--color-bg-primary)",
    label: "조건부",
  },
};

export default async function Budget2027Page() {
  let schedules: Schedule[] = [];
  let scheduleError = false;
  try {
    schedules = pickBudgetReviewSchedules(
      await Promise.all([
        getUpcomingSchedulesByKeyword(TERM_ID, "예산"),
        getUpcomingSchedulesByKeyword(TERM_ID, "기금"),
      ]),
    );
  } catch {
    scheduleError = true;
  }
  const maxField = Math.max(...d.fields.map((f) => f.y2027));

  return (
    <div className="google-anno-skip mx-auto max-w-4xl space-y-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: d.title,
          description: d.description,
          datePublished: d.publishedAt,
          dateModified: d.updatedAt,
          mainEntityOfPage: CANONICAL,
          publisher: { "@type": "Organization", name: "로메이크", url: BASE },
        }}
      />

      <header className="space-y-3">
        <p className="text-sm font-medium text-(--color-text-tertiary)">
          예산 국회 · 원문 확인 {formatDate(d.checkedAt)}
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight">2027 예산안 국회 심사</h1>
        <p className="text-base leading-relaxed text-(--color-text-secondary)">
          정부가 9월 3일 국회에 낸 2027년도 예산안의 총지출은{" "}
          <strong className="text-(--color-text-primary)">{d.total2027}조 원</strong>으로, 2026년
          본예산({d.total2026}조 원)보다 {d.growth}% 늘었습니다. 국회는 국정감사가 끝난 뒤
          본격적으로 심사해 12월 2일까지 의결해야 합니다. 아래 금액은 모두 국회 심사 전{" "}
          <strong>정부안</strong>
          이며, 국회에서 바뀌면 단계별로 따로 표시합니다.
        </p>
        <nav aria-label="페이지 안 바로가기">
          <ul className="flex flex-wrap gap-2 text-sm">
            {[
              ["#steps", "심사 단계·기한"],
              ["#schedule", "심사 회의 일정"],
              ["#fields", "분야별 금액"],
              ["#projects", "주요 사업"],
              ["#about", "출처"],
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

      <section id="steps" aria-labelledby="steps-title" className="scroll-mt-32 space-y-4">
        <h2 id="steps-title" className="text-2xl font-bold">
          지금 어디까지 왔나
        </h2>
        <ol className="space-y-3">
          {d.steps.map((step) => {
            const st = STEP_STYLE[step.status];
            return (
              <li
                key={step.label}
                className={`flex gap-3 rounded-xl border p-4 ${
                  step.status === "current"
                    ? "border-(--color-primary) bg-(--color-bg-secondary)"
                    : "border-(--color-border-primary) bg-(--color-bg-primary)"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${st.dot}`}
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-(--color-text-primary)">
                    {step.date ? `${formatDate(step.date)} · ` : ""}
                    {step.label}
                    <span className="ml-2 text-xs font-medium text-(--color-text-tertiary)">
                      {st.label}
                    </span>
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-(--color-text-secondary)">
                    {step.detail}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="text-xs text-(--color-text-tertiary)">
          절차 설명은{" "}
          <Link href="/guide/budget" className="underline">
            국가 예산과 국회의 역할
          </Link>{" "}
          가이드에서 더 자세히 볼 수 있습니다.
        </p>
      </section>

      <section id="schedule" aria-labelledby="schedule-title" className="scroll-mt-32 space-y-3">
        <h2 id="schedule-title" className="text-2xl font-bold">
          예산안 심사 회의 일정
        </h2>
        {schedules.length > 0 ? (
          <ul className="divide-y divide-(--color-border-primary) rounded-xl border border-(--color-border-primary)">
            {schedules.map((s) => (
              <li key={s.id} className="p-4">
                <p className="text-sm font-bold text-(--color-text-primary)">
                  {formatDate(s.meetingDate)} {s.meetingTime} · {s.committeeName || "본회의"}
                </p>
                <p className="mt-1 text-sm whitespace-pre-line text-(--color-text-secondary)">
                  {s.agenda || s.title}
                </p>
                {s.linkUrl && (
                  <a
                    href={s.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-xs text-(--color-text-tertiary) underline"
                  >
                    국회 원문 일정
                  </a>
                )}
              </li>
            ))}
          </ul>
        ) : scheduleError ? (
          <p className="rounded-xl border border-(--color-border-primary) p-4 text-sm text-(--color-text-secondary)">
            일정을 불러오지 못했습니다. 잠시 뒤 다시 확인하거나 아래 예산결산특별위원회 누리집을
            확인하세요.
          </p>
        ) : (
          <p className="rounded-xl border border-(--color-border-primary) p-4 text-sm text-(--color-text-secondary)">
            아직 국회 일정에 2027년도 예산안 심사 회의가 등록되지 않았습니다. 상임위원회 예비심사와
            예결위 회의가 공지되면 국회 일정 데이터에서 자동으로 이곳에 나타납니다.
          </p>
        )}
        <p className="text-xs text-(--color-text-tertiary)">
          국회 열린국회정보 일정 기준. 회의 직전에 바뀔 수 있으니{" "}
          <a
            href="https://budget.na.go.kr/cmmit/main/main.do"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            예산결산특별위원회 누리집
          </a>{" "}
          공지도 함께 확인하세요.
        </p>
      </section>

      <section id="fields" aria-labelledby="fields-title" className="scroll-mt-32 space-y-3">
        <h2 id="fields-title" className="text-2xl font-bold">
          12대 분야별 금액
        </h2>
        <p className="text-sm text-(--color-text-secondary)">
          2026년 본예산 대비 2027년 정부안(단위: 조 원). 증가율은 정부 자료 표기값입니다.
        </p>
        <div className="overflow-x-auto rounded-xl border border-(--color-border-primary)">
          <table className="w-full text-sm">
            <thead className="bg-(--color-bg-secondary) text-left text-xs text-(--color-text-tertiary)">
              <tr>
                <th className="px-2 py-2 font-medium sm:px-3">분야</th>
                <th className="px-2 py-2 text-right font-medium sm:px-3">
                  2026
                  <span className="block text-[11px] font-normal">본예산</span>
                </th>
                <th className="px-2 py-2 text-right font-medium sm:px-3">
                  2027
                  <span className="block text-[11px] font-normal">정부안</span>
                </th>
                <th className="px-2 py-2 text-right font-medium sm:px-3">증가율</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-border-primary)">
              {d.fields.map((f) => (
                <tr key={f.name}>
                  <td className="px-2 py-2 sm:px-3">
                    <span className="font-medium text-(--color-text-primary)">{f.name}</span>
                    <span
                      aria-hidden="true"
                      className="mt-1 block h-1.5 rounded-full bg-(--color-primary) opacity-60"
                      style={{ width: `${Math.max(4, (f.y2027 / maxField) * 100)}%` }}
                    />
                  </td>
                  <td className="px-2 py-2 text-right text-(--color-text-secondary) tabular-nums sm:px-3">
                    {f.y2026.toFixed(1)}
                  </td>
                  <td className="px-2 py-2 text-right font-bold tabular-nums sm:px-3">
                    {f.y2027.toFixed(1)}
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums sm:px-3">
                    +{f.growth.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-(--color-text-tertiary)">
          분야 간 중복(R&D 등)이 있어 분야별 합계는 총지출과 정확히 같지 않습니다. 정부는 통계
          정합성을 위해 군인연금기금을 보건·복지·고용에서 국방 분야로 옮기고 국방 지출을 총지출
          기준으로 바꿔 표기했습니다. 출처: 기획예산처 「2026~2030년 국가재정운용계획」 분야별
          재원배분 계획.
        </p>
      </section>

      {/* 일정·분야 요약을 마친 뒤 사업 카드 앞(링크·표와 떨어진 자리) */}
      <AdSlot placement="budget-hub-main" />

      <section id="projects" aria-labelledby="projects-title" className="scroll-mt-32 space-y-4">
        <h2 id="projects-title" className="text-2xl font-bold">
          눈여겨볼 사업
        </h2>
        <p className="text-sm text-(--color-text-secondary)">
          생활과 가깝거나 국정감사에서 쟁점이 된 사업을 골랐습니다. 금액은 정부안이며, 예산이
          편성돼도 지원 대상·신청 방법은 확정 뒤 소관 부처 공고로 정해집니다.
        </p>
        <div className="space-y-4">
          {d.projects.map((p) => (
            <article
              key={p.id}
              id={p.id}
              className="scroll-mt-32 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5"
            >
              <p className="text-xs font-medium text-(--color-text-tertiary)">{p.stage}</p>
              <h3 className="mt-1 text-lg font-bold text-(--color-text-primary)">{p.name}</h3>
              <p className="mt-1 text-sm text-(--color-text-secondary)">{p.summary}</p>
              <p className="mt-3 text-base font-extrabold text-(--color-text-primary)">
                {p.amount}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-(--color-text-secondary)">{p.body}</p>
              {p.auditLink && (
                <Link
                  href={p.auditLink.href}
                  className="mt-3 inline-flex min-h-10 items-center rounded-full border border-(--color-border-primary) px-3 text-sm font-medium text-(--color-text-primary) no-underline hover:bg-(--color-bg-secondary)"
                >
                  {p.auditLink.label} →
                </Link>
              )}
              <AuditSources sources={p.sources} />
            </article>
          ))}
        </div>
      </section>

      <section id="about" aria-labelledby="about-title" className="scroll-mt-32 space-y-3">
        <h2 id="about-title" className="text-xl font-bold">
          이 페이지에 대해
        </h2>
        <p className="text-sm leading-relaxed text-(--color-text-secondary)">
          정부 발표 자료와 법령 원문을 직접 확인해 정리했습니다. 국회 심사에서 금액이 바뀌면
          정부안을 지우지 않고 상임위 증액·감액 의견, 예결위 조정, 본회의 확정을 단계별로 나눠
          덧붙입니다. 날짜가 공지되지 않은 회의는 통상 시기로 적지 않습니다.
        </p>
        <AuditSources sources={d.sources} />
        <p className="text-sm">
          <Link href="/issues/audit-2026" className="underline">
            2026 국정감사 일정·쟁점 보기
          </Link>
        </p>
      </section>
    </div>
  );
}
