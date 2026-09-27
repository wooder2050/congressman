import Link from "next/link";
import { AUDIT_2026, auditCommitteePath, isAuditCommitteePageReady } from "@/data/audit-2026";
import { formatAuditDate } from "@/lib/audit-format";
import { formatPropertyAmount } from "@/lib/property-utils";
import { getElectedLabel } from "@/lib/utils";
import type { AssetResponse, MemberScorecard, MemberTerm } from "@/types";

interface MemberGlanceCardProps {
  memberId: string;
  memberName: string;
  memberTerm: MemberTerm;
  assets: AssetResponse | null;
  scorecard: MemberScorecard | null;
}

/** 부호를 붙인 억/만원 표기 — formatPropertyAmount는 음수를 0원으로 돌려준다 */
function signedAmount(amount: number): string {
  if (amount === 0) return "변동 없음";
  return `${amount > 0 ? "+" : "−"}${formatPropertyAmount(Math.abs(amount))}`;
}

function Tile({
  label,
  href,
  children,
}: {
  label: string;
  href?: string;
  children: React.ReactNode;
}) {
  const body = (
    <>
      <p className="text-xs font-semibold text-(--color-text-tertiary)">{label}</p>
      <div className="mt-1 space-y-0.5 text-sm text-(--color-text-secondary)">{children}</div>
      {href && <span className="mt-1 block text-xs text-(--color-primary)">자세히 →</span>}
    </>
  );
  const cls = "block rounded-lg bg-(--color-bg-secondary) p-3";
  return href ? (
    <Link href={href} className={`${cls} hover:bg-(--color-bg-tertiary)`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

/**
 * 의원 상세 첫 화면 "한눈에 보기" — 검색 수식어(재산·의정활동·지역구·국정감사)에 바로 답한다.
 * 네이버에서 "OO 재산", "OO 의정활동"처럼 수식어가 붙은 검색은 1~3위로 클릭되는데,
 * 답이 일곱 번째 탭 안에 있어 찾기 어려웠다(2026-09-24 서치어드바이저 분석).
 * 서버에서 렌더해 본문 HTML에 싣는다.
 */
export default function MemberGlanceCard({
  memberId,
  memberName,
  memberTerm,
  assets,
  scorecard,
}: MemberGlanceCardProps) {
  const [latest, previous] = assets?.years ?? [];
  const assetDelta =
    latest && previous && latest.year - previous.year === 1 ? latest.total - previous.total : null;

  const district = memberTerm.proportional ? "비례대표" : memberTerm.district || "비례대표";
  const auditCommittees = AUDIT_2026.committees.filter(
    (c) => memberTerm.committees.includes(c.name) && isAuditCommitteePageReady(c),
  );
  const tabHref = (tab: string) => `/members/${memberId}?tab=${tab}#member-tabs`;

  return (
    <section
      aria-labelledby="member-glance-title"
      className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4"
    >
      <h2 id="member-glance-title" className="mb-3 text-base font-bold">
        {memberName} 의원 한눈에 보기
      </h2>
      <div className="grid grid-cols-2 gap-2">
        <Tile label="재산" href={latest ? tabHref("assets") : undefined}>
          {latest ? (
            <>
              <p className="text-lg font-bold text-(--color-text-primary) tabular-nums">
                {formatPropertyAmount(latest.total)}
              </p>
              {assetDelta !== null && (
                <p className="tabular-nums">전년 대비 {signedAmount(assetDelta)}</p>
              )}
              <p className="text-xs text-(--color-text-tertiary)">{latest.year}년 공개 기준</p>
            </>
          ) : (
            <p>공개된 재산 자료가 없습니다</p>
          )}
        </Tile>

        <Tile label="의정활동" href={scorecard ? tabHref("scorecard") : undefined}>
          {memberTerm.cabinetPosition ? (
            <p className="font-semibold text-(--color-text-primary)">
              {memberTerm.cabinetPosition} 겸직 중
            </p>
          ) : scorecard ? (
            <>
              <p className="text-lg font-bold text-(--color-text-primary) tabular-nums">
                출석 {Math.round(scorecard.attendance.rate)}%
              </p>
              <p className="tabular-nums">
                대표발의 {scorecard.billProposal.representativeCount}건
              </p>
              <p className="text-xs text-(--color-text-tertiary)">
                의정활동 평가 {scorecard.grade}등급
              </p>
            </>
          ) : (
            <p>집계 중입니다</p>
          )}
        </Tile>

        <Tile label="지역구">
          <p className="text-lg font-bold break-keep text-(--color-text-primary)">{district}</p>
          <p>
            {getElectedLabel(memberTerm.electedCount)} · {memberTerm.party.name}
          </p>
        </Tile>

        {auditCommittees.length > 0 ? (
          <Tile label="2026 국정감사" href={auditCommitteePath(auditCommittees[0].name)}>
            <p className="text-lg font-bold text-(--color-text-primary)">
              {auditCommittees.map((c) => c.short).join("·")}
            </p>
            {auditCommittees[0].days[0] && (
              <p>{formatAuditDate(auditCommittees[0].days[0].date)}부터</p>
            )}
            {/* 위원장·간사만 표시 — 평위원은 생략 */}
            {memberTerm.committeeRoles?.[auditCommittees[0].name] &&
              memberTerm.committeeRoles[auditCommittees[0].name] !== "위원" && (
                <p className="text-xs text-(--color-text-tertiary)">
                  {memberTerm.committeeRoles[auditCommittees[0].name]}
                </p>
              )}
          </Tile>
        ) : (
          <Tile label="소속 위원회" href={tabHref("committee")}>
            <p className="font-semibold break-keep text-(--color-text-primary)">
              {memberTerm.committees.length > 0
                ? memberTerm.committees.join(", ")
                : "소속 위원회 정보 없음"}
            </p>
          </Tile>
        )}
      </div>
    </section>
  );
}
