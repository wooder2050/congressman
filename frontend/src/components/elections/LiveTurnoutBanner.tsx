"use client";

import { useCongressQuery } from "@/hooks/useCongressQuery";
import { getElectionTurnout, type TurnoutScope } from "@/lib/turnout";
import EarlyVoteTurnoutBanner from "./EarlyVoteTurnoutBanner";

/**
 * 실시간 투표율 배너 — Supabase `ElectionTurnout`를 직접 조회해 표시한다.
 *
 * 데이터(전국 행)가 없으면 렌더하지 않으므로, DB가 비어 있으면 자연히 숨겨진다.
 * SQL UPDATE만으로 배포 없이 화면이 갱신되며, 60초마다 자동 재조회한다.
 *
 * 뱃지/보조 라벨은 6/3 18시 마감 여부에 따라 자동 결정한다(마감 후 "투표 마감 · 최종 투표율").
 * 호출부에서 badge/asideLabel을 넘기면 그 값으로 덮어쓴다.
 */
const POLL_CLOSE = new Date(2026, 5, 3, 18, 0, 0); // 6/3 18시 본투표 마감

interface Props {
  scope: TurnoutScope;
  /** 라벨 (예: "6·3 지방선거" / "6·3 재보궐선거 14곳") */
  scopeLabel: string;
  /** 좌측 상태 뱃지 — 미지정 시 마감 여부로 자동 결정("본투표 진행 중" / "투표 마감") */
  badge?: string;
  /** 우측 보조 라벨 — 미지정 시 마감 여부로 자동 결정("오늘 06~18시" / "최종 투표율") */
  asideLabel?: string;
}

export default function LiveTurnoutBanner({ scope, scopeLabel, badge, asideLabel }: Props) {
  const isPollClosed = new Date() > POLL_CLOSE;
  const resolvedBadge = badge ?? (isPollClosed ? "투표 마감" : "본투표 진행 중");
  const resolvedAsideLabel = asideLabel ?? (isPollClosed ? "최종 투표율" : "오늘 06~18시");
  const { data } = useCongressQuery(getElectionTurnout, scope, {
    staleTime: 0,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  if (!data || !data.national) return null;

  const { national, regions } = data;
  const sourceNote = national.asOf
    ? `중앙선거관리위원회 ${national.asOf} 누적 집계 기준`
    : "중앙선거관리위원회 누적 집계 기준";

  return (
    <EarlyVoteTurnoutBanner
      scopeLabel={scopeLabel}
      rate={national.turnoutRate}
      comparison={national.note || "누적 투표율"}
      detail={
        national.voterCount != null && national.voteCount != null
          ? `유권자 ${national.voterCount.toLocaleString()}명 중 ${national.voteCount.toLocaleString()}명 투표`
          : `${national.asOf} 기준 누적 투표율`
      }
      regions={regions.map((r) => ({ region: r.region, rate: r.turnoutRate }))}
      badge={resolvedBadge}
      asideLabel={resolvedAsideLabel}
      sourceNote={sourceNote}
      keepAfterClose
    />
  );
}
