"use client";

import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getMemberScorecard } from "@/lib/api";
import type { ScorecardGrade } from "@/types";

interface ScorecardTabProps {
  memberId: string;
  termId: number;
}

const GRADE_STYLES: Record<ScorecardGrade, { bg: string; text: string; border: string }> = {
  S: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-300 dark:border-amber-700",
  },
  A: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-300 dark:border-blue-700",
  },
  B: {
    bg: "bg-green-50 dark:bg-green-950/30",
    text: "text-green-600 dark:text-green-400",
    border: "border-green-300 dark:border-green-700",
  },
  C: {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-300 dark:border-orange-700",
  },
  D: {
    bg: "bg-red-50 dark:bg-red-950/30",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-300 dark:border-red-700",
  },
};

function ScoreBar({
  label,
  score,
  maxScore,
  rank,
  totalMembers,
  detail,
}: {
  label: string;
  score: number;
  maxScore: number;
  rank: number;
  totalMembers: number;
  detail: string;
}) {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-(--color-text-primary)">{label}</span>
        <span className="text-sm font-bold text-(--color-member-accent)">
          {score}
          <span className="text-xs font-normal text-(--color-text-tertiary)">/{maxScore}점</span>
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-(--color-bg-tertiary)">
        <div
          className="h-full rounded-full bg-(--color-member-accent) transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-(--color-text-tertiary)">
        <span>{detail}</span>
        <span>
          {totalMembers}명 중 {rank}위
        </span>
      </div>
    </div>
  );
}

function ShareButton({
  memberId,
  termId,
  name,
  grade,
  totalScore,
}: {
  memberId: string;
  termId: number;
  name: string;
  grade: string;
  totalScore: number;
}) {
  const url = `https://www.lawmake.kr/members/${memberId}/scorecard?term=${termId}`;
  const text = `${name} 의원 의정활동 성적표: ${grade}등급 (${totalScore}점)`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: text, url });
      } catch {
        // 사용자가 공유를 취소한 경우
      }
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      alert("링크가 복사되었습니다!");
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 rounded-lg bg-(--color-member-accent) px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
      </svg>
      공유하기
    </button>
  );
}

export default function ScorecardTab({ memberId, termId }: ScorecardTabProps) {
  const { data: scorecard } = useCongressSuspenseQuery(getMemberScorecard, {
    memberId,
    termId,
  });

  if (!scorecard) {
    return (
      <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-8 text-center">
        <p className="text-sm text-(--color-text-tertiary)">성적표 데이터가 없습니다.</p>
      </div>
    );
  }

  const gradeStyle = GRADE_STYLES[scorecard.grade];

  return (
    <div className="space-y-5">
      {/* 국무위원 현재 겸직 안내 — 평가 순위 제외 */}
      {scorecard.cabinetPosition && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-950/30">
          <span className="text-lg leading-none">🏛️</span>
          <div>
            <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
              현재 {scorecard.cabinetPosition} 겸직 중 — 참고용 점수입니다
            </p>
            <p className="mt-1 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
              국무위원(장관·총리)을 겸직하면 본회의 표결·법안 발의 등 의정활동이 제한되므로, 이
              성적표는 전체 의원 순위 집계에서 제외됩니다. 아래 점수는 겸직 기간을 포함한 참고
              수치이며, 다른 의원과 단순 비교하기 어렵습니다.
            </p>
          </div>
        </div>
      )}

      {/* 과거 국무위원 이력 안내 — 현재는 평의원 복귀, 재임 기간 평가 제외 */}
      {!scorecard.cabinetPosition &&
        scorecard.cabinetHistory &&
        scorecard.cabinetHistory.length > 0 &&
        (() => {
          const past = scorecard.cabinetHistory[scorecard.cabinetHistory.length - 1];
          return (
            <div className="flex items-start gap-2 rounded-xl border border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
              <span className="text-lg leading-none">🏛️</span>
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  {past.position}을(를) 지낸 뒤 국회의원 활동에 복귀
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  이 의원은 임기 중 {past.position}({past.startDate.replace(/-/g, ".")}~
                  {past.endDate?.replace(/-/g, ".")})을(를) 지냈습니다. 겸직 기간에는 의정활동이
                  제한되므로, 해당 기간을 평가 가능 기간에서 제외하고 복귀 이후 활동만으로 점수를
                  산정했습니다.
                </p>
              </div>
            </div>
          );
        })()}

      {/* 종합 등급 카드 */}
      <div className={`rounded-2xl border-2 ${gradeStyle.border} ${gradeStyle.bg} p-6`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-(--color-text-secondary)">종합 등급</div>
            <div className="mt-1 flex items-baseline gap-3">
              <span className={`text-6xl font-black ${gradeStyle.text}`}>{scorecard.grade}</span>
              <span className="text-2xl font-bold text-(--color-text-primary)">
                {scorecard.totalScore}
                <span className="text-base font-normal text-(--color-text-tertiary)">/100점</span>
              </span>
            </div>
            <div className="mt-2 text-sm text-(--color-text-secondary)">
              {scorecard.cabinetPosition ? (
                <span className="font-bold text-(--color-text-primary)">순위 집계 제외</span>
              ) : (
                <>
                  전체 {scorecard.attendance.totalMembers}명 중{" "}
                  <span className="font-bold text-(--color-text-primary)">
                    {scorecard.overallRank}위
                  </span>
                </>
              )}
            </div>
            {!scorecard.cabinetPosition && scorecard.provisional && (
              <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                ⏳ 재직 90일 미만 — 잠정 순위 (표본 누적 중)
              </div>
            )}
          </div>
          <ShareButton
            memberId={memberId}
            termId={termId}
            name={scorecard.name}
            grade={scorecard.grade}
            totalScore={scorecard.totalScore}
          />
        </div>
      </div>

      {/* 항목별 점수 */}
      <div className="space-y-5 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
        <h3 className="text-base font-bold text-(--color-text-primary)">항목별 점수</h3>

        <ScoreBar
          label="출석률"
          score={scorecard.attendance.score}
          maxScore={30}
          rank={scorecard.attendance.rank}
          totalMembers={scorecard.attendance.totalMembers}
          detail={`${scorecard.attendance.rate}%`}
        />

        <ScoreBar
          label="표결 참여율"
          score={scorecard.voteParticipation.score}
          maxScore={25}
          rank={scorecard.voteParticipation.rank}
          totalMembers={scorecard.voteParticipation.totalMembers}
          detail={`${scorecard.voteParticipation.rate}% (찬성 ${scorecard.voteParticipation.yes} · 반대 ${scorecard.voteParticipation.no} · 기권 ${scorecard.voteParticipation.abstain} · 불참 ${scorecard.voteParticipation.absent})`}
        />

        <ScoreBar
          label="법안 발의"
          score={scorecard.billProposal.score}
          maxScore={25}
          rank={scorecard.billProposal.rank}
          totalMembers={scorecard.billProposal.totalMembers}
          detail={`대표발의 ${scorecard.billProposal.representativeCount}건 · 공동발의 ${scorecard.billProposal.coCount}건`}
        />

        <ScoreBar
          label="법안 통과율"
          score={scorecard.billPassRate.score}
          maxScore={20}
          rank={scorecard.billPassRate.rank}
          totalMembers={scorecard.billPassRate.totalMembers}
          detail={`${scorecard.billPassRate.rate}% (${scorecard.billPassRate.passedCount}/${scorecard.billPassRate.totalRepresentative}건 통과)`}
        />
      </div>

      {/* 최근 30일 활동 */}
      <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
        <h3 className="text-base font-bold text-(--color-text-primary)">최근 30일 활동</h3>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-(--color-bg-secondary) p-3 text-center">
            <div className="text-2xl font-bold text-(--color-member-accent)">
              {scorecard.recentActivity.last30Days.bills}
            </div>
            <div className="mt-0.5 text-xs text-(--color-text-tertiary)">법안 발의</div>
          </div>
          <div className="rounded-lg bg-(--color-bg-secondary) p-3 text-center">
            <div className="text-2xl font-bold text-(--color-member-accent)">
              {scorecard.recentActivity.last30Days.votesAttended}
              <span className="text-sm font-normal text-(--color-text-tertiary)">
                /{scorecard.recentActivity.last30Days.votes}
              </span>
            </div>
            <div className="mt-0.5 text-xs text-(--color-text-tertiary)">표결 참여</div>
          </div>
          <div className="rounded-lg bg-(--color-bg-secondary) p-3 text-center">
            <div className="text-2xl font-bold text-(--color-member-accent)">
              {scorecard.recentActivity.last30Days.votes > 0
                ? Math.round(
                    (scorecard.recentActivity.last30Days.votesAttended /
                      scorecard.recentActivity.last30Days.votes) *
                      100,
                  )
                : 0}
              <span className="text-sm font-normal text-(--color-text-tertiary)">%</span>
            </div>
            <div className="mt-0.5 text-xs text-(--color-text-tertiary)">최근 참여율</div>
          </div>
        </div>
      </div>

      {/* 안내문 */}
      <p className="text-xs leading-relaxed text-(--color-text-tertiary)">
        성적표는 출석률(30점), 표결 참여율(25점), 법안 발의(25점, 백분위 기준), 법안 통과율(20점,
        백분위 기준)을 합산하여 100점 만점으로 산출합니다. 등급 기준: S(90+), A(80+), B(70+),
        C(60+), D(60미만). 데이터는 열린국회정보 공공데이터 기반이며, 매일 자동 갱신됩니다.
      </p>
    </div>
  );
}
