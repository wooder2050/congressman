import Link from "next/link";
import { formatPercent, withJosa } from "@/lib/utils";
import type { AttendanceRecord, MemberTerm, MemberVoteSummary } from "@/types";

interface MemberActivitySummaryViewProps {
  memberName: string;
  memberTerm: MemberTerm;
  attendance: AttendanceRecord;
  voteSummary: MemberVoteSummary;
  billTotal: number;
}

/**
 * 활동 요약 문단의 순수 표현 컴포넌트.
 *
 * 서버(의원 상세 페이지의 22대 SSR 경로)와 클라이언트(과거 대수 전환 시
 * MemberActivitySummary의 쿼리 경로) 양쪽에서 같은 마크업을 렌더링한다.
 * 22대 본문을 서버 HTML에 싣는 이유: 검색 유입의 75%인 네이버는 JS 렌더링이
 * 보수적이라, CSR 본문은 의원 이름 검색 노출에 잡히지 않는다 (2026-08 레드팀 검수).
 */
export default function MemberActivitySummaryView({
  memberName,
  memberTerm,
  attendance,
  voteSummary,
  billTotal,
}: MemberActivitySummaryViewProps) {
  const termId = memberTerm.termId;
  const voteParticipationRate =
    voteSummary.total > 0
      ? ((voteSummary.total - voteSummary.absent) / voteSummary.total) * 100
      : 0;

  const attendanceLevel =
    attendance.rate >= 95
      ? "매우 높은"
      : attendance.rate >= 90
        ? "높은"
        : attendance.rate >= 80
          ? "보통 수준의"
          : "낮은";

  const voteLevel =
    voteParticipationRate >= 95
      ? "매우 적극적으로"
      : voteParticipationRate >= 90
        ? "적극적으로"
        : voteParticipationRate >= 80
          ? "보통 수준으로"
          : "소극적으로";

  const billLevel =
    billTotal >= 50
      ? "활발한"
      : billTotal >= 20
        ? "보통 수준의"
        : billTotal >= 10
          ? "다소 적은"
          : "적은";

  const district = memberTerm.proportional ? "비례대표" : memberTerm.district || "";
  const pastCabinet = memberTerm.cabinetHistory?.[memberTerm.cabinetHistory.length - 1];

  return (
    <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
      <h2 className="mb-3 text-base font-bold text-(--color-text-primary)">
        제{termId}대 국회 활동 요약
      </h2>
      {/* 국무위원 겸직 안내 — 활동요약 최상단에 명확히 표시 */}
      {memberTerm.cabinetPosition ? (
        <p className="mb-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
          🏛️ {memberName} 의원은 현재 <strong>{memberTerm.cabinetPosition}</strong>
          {withJosa(memberTerm.cabinetPosition, "을", "를").slice(-1)} 겸직 중입니다. 겸직 기간에는
          본회의 표결·법안 발의 등 의정활동이 제한되므로, 아래 수치는 참고용이며 의정활동 평가 순위
          집계에서는 제외됩니다.
        </p>
      ) : pastCabinet ? (
        <p className="mb-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 dark:bg-slate-800/50 dark:text-slate-200">
          🏛️ {memberName} 의원은 제{termId}대 국회 임기 중 <strong>{pastCabinet.position}</strong>
          {withJosa(pastCabinet.position, "을", "를").slice(-1)} 지낸 뒤(
          {pastCabinet.startDate.replace(/-/g, ".")}~{pastCabinet.endDate?.replace(/-/g, ".")})
          국회의원 활동에 복귀했습니다. 해당 재임 기간은 의정활동 평가 가능 기간에서 제외해
          계산합니다.
        </p>
      ) : null}
      <p className="text-sm leading-relaxed text-(--color-text-secondary)">
        {memberName} {memberTerm.party.name} 의원({district})은 제{termId}대 국회에서{" "}
        <strong>
          {attendanceLevel} 출석률({formatPercent(attendance.rate)})
        </strong>
        을 기록하고 있습니다. 전체 {voteSummary.total}건의 본회의 표결 중{" "}
        <strong>
          {voteLevel} 참여({formatPercent(voteParticipationRate)})
        </strong>
        하고 있으며, 대표발의 법안은 <strong>{billTotal}건</strong>으로 {billLevel} 입법 활동을
        보이고 있습니다.
        {memberTerm.committees.length > 0 && (
          <> 현재 {memberTerm.committees[0]}에서 활동하고 있습니다.</>
        )}
      </p>
      <p className="mt-2 text-xs text-(--color-text-tertiary)">
        출처: 열린국회정보 공공데이터 · 출석률 등 지표의 산출 공식은{" "}
        <Link href="/about/methodology" className="underline hover:text-(--color-text-secondary)">
          데이터 방법론
        </Link>
        에서 공개합니다. 아래 탭에서 상세 데이터를 확인하세요.
      </p>
    </div>
  );
}
