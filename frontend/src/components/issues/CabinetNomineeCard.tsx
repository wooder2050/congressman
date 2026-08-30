import Link from "next/link";
import MemberAvatar from "@/components/members/MemberAvatar";
import ColorBadge from "@/components/ui/color-badge";
import CabinetStatusTimeline from "@/components/issues/CabinetStatusTimeline";
import type { MemberScorecard } from "@/types";
import { CABINET_2026_08 } from "@/data/cabinet-nominees";

type Minister = (typeof CABINET_2026_08.ministers)[number];

interface Props {
  nominee: Minister;
  /** 현역 의원 후보자의 성적표. 비의원이거나 조회 실패면 null */
  scorecard: MemberScorecard | null;
  /** 성적표 조회를 시도했으나 실패한 경우 */
  scorecardFailed?: boolean;
  /** 당선 횟수(의원 API). 없으면 표시 생략 */
  electedCount?: number;
}

function pct(v: number): string {
  return `${v.toFixed(1)}%`;
}

/** 의정활동 지표 — 원수치를 크게, 등급·순위는 메타 조각으로 분리 (등급이 '적격성'으로 읽히지 않도록) */
function ActivityMetrics({ sc }: { sc: MemberScorecard }) {
  const metrics = [
    { label: "본회의 출석률", value: pct(sc.attendance.rate) },
    { label: "표결 참여율", value: pct(sc.voteParticipation.rate) },
    { label: "대표발의", value: `${sc.billProposal.representativeCount}건` },
    { label: "공동발의", value: `${sc.billProposal.coCount}건` },
  ];
  return (
    <div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-lg bg-(--color-bg-secondary) px-3 py-2.5">
            <dt className="text-xs font-medium text-(--color-text-secondary)">{m.label}</dt>
            <dd className="mt-0.5 text-lg font-bold text-(--color-text-primary) tabular-nums">
              {m.value}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-(--color-text-tertiary)">
        <span>
          {sc.provisional ? "22대 · 재직 90일 미만(잠정)" : "22대 누적 · 최근 동기화 기준"}
        </span>
        <span className="tabular-nums">
          종합 {sc.grade}등급 · {sc.overallRank}위/{sc.billProposal.totalMembers}명
        </span>
      </p>
    </div>
  );
}

export default function CabinetNomineeCard({
  nominee,
  scorecard,
  scorecardFailed = false,
  electedCount,
}: Props) {
  const isMember = !!nominee.memberId;

  return (
    <article
      id={`nominee-${nominee.slug}`}
      className="scroll-mt-20 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5"
    >
      {/* 헤더: 부처 → 후보자 */}
      <header className="flex flex-wrap items-start gap-4">
        {scorecard ? (
          <MemberAvatar
            name={scorecard.name}
            photoUrl={scorecard.photoUrl}
            size={64}
            bgColor={scorecard.party.color}
            className="shrink-0 rounded-full"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-(--color-bg-tertiary) text-xl font-bold text-(--color-text-secondary)"
          >
            {nominee.name.slice(0, 1)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold tracking-wide text-(--color-text-tertiary)">
            {nominee.ministry}
          </p>
          <h3 className="mt-0.5 text-xl font-extrabold tracking-tight text-(--color-text-primary)">
            {nominee.name}
          </h3>
          <p className="text-sm font-medium text-(--color-text-secondary)">{nominee.position}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-(--color-text-secondary)">
            {scorecard && (
              <ColorBadge
                label={scorecard.party.shortName}
                color={scorecard.party.color}
                size="sm"
              />
            )}
            <span>{nominee.currentRole}</span>
            {isMember && electedCount != null && (
              <span className="text-(--color-text-tertiary)">{electedCount}선</span>
            )}
          </div>
        </div>
        <div className="w-full sm:w-auto">
          <CabinetStatusTimeline status={nominee.status} compact />
        </div>
      </header>

      {/* 약력 */}
      <p className="mt-4 text-sm leading-relaxed text-(--color-text-secondary)">{nominee.bio}</p>

      {/* 전임·청문 상임위·(비의원) 데이터 적용 여부 */}
      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div className="flex gap-2">
          <dt className="w-24 shrink-0 text-(--color-text-tertiary)">전임 장관</dt>
          <dd className="text-(--color-text-primary)">
            {nominee.incumbent ? (
              <>
                {nominee.incumbent.memberId ? (
                  <Link
                    href={`/members/${nominee.incumbent.memberId}`}
                    className="font-semibold text-(--color-primary) underline underline-offset-2"
                  >
                    {nominee.incumbent.name}
                  </Link>
                ) : (
                  <span className="font-semibold">{nominee.incumbent.name}</span>
                )}
                {nominee.incumbent.note && (
                  <span className="ml-1.5 text-(--color-text-tertiary)">
                    {nominee.incumbent.note}
                  </span>
                )}
              </>
            ) : (
              <span className="text-(--color-text-tertiary)">공석</span>
            )}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-24 shrink-0 text-(--color-text-tertiary)">청문 상임위</dt>
          <dd className="font-semibold text-(--color-text-primary)">
            {nominee.hearingCommittee}
            <span className="ml-1 font-normal text-(--color-text-tertiary)">(예상)</span>
          </dd>
        </div>
        {!isMember && (
          <div className="flex gap-2 sm:col-span-2">
            <dt className="w-24 shrink-0 text-(--color-text-tertiary)">의정 데이터</dt>
            <dd className="text-(--color-text-secondary)">
              적용 대상 아님 — 국회의원이 아닌 후보자
            </dd>
          </div>
        )}
      </dl>

      {/* 의정활동 — 의원 후보자만 */}
      {isMember && (
        <section className="mt-5 border-t border-(--color-border-primary) pt-4">
          <h4 className="text-sm font-bold text-(--color-text-primary)">22대 의정활동 기록</h4>
          <div className="mt-3">
            {scorecard ? (
              <ActivityMetrics sc={scorecard} />
            ) : (
              <p className="rounded-lg bg-(--color-bg-secondary) px-3 py-2.5 text-sm text-(--color-text-secondary)">
                {scorecardFailed
                  ? "지표를 불러오지 못했습니다. 의원 상세 페이지에서 확인해 주세요."
                  : "22대 성적표가 아직 집계되지 않았습니다."}
              </p>
            )}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-(--color-text-tertiary)">
            등급·순위는 의정활동 측정치이며 장관 적격성과 무관합니다. 임명되면 의원직을 유지한 채
            장관을 겸하며, 임명일부터 성적표 순위 집계에서 제외되고 겸직 표시로 전환됩니다.
          </p>
          <Link
            href={`/members/${nominee.memberId}`}
            className="mt-2 inline-flex min-h-12 items-center gap-1 text-sm font-semibold text-(--color-primary) no-underline"
          >
            법안·표결·출석 전체 보기 <span aria-hidden="true">→</span>
          </Link>
        </section>
      )}
    </article>
  );
}
