/**
 * 지방선거 개표 모드 판단 및 결과 정렬 유틸.
 *
 * 개표 모드는 두 단계로 판단한다:
 *  - electionMode (전역): LocalElection.status === "completed" — 당선인이 1명이라도 sync되면 전환
 *  - raceTallied (race별): 후보 배열에 isWinner 또는 voteCount가 들어왔는지
 *
 * NEC 당선인 API 이관 시점에 따라 전역 개표 모드여도 일부 race는 아직 미개표일 수 있으므로,
 * race 화면은 raceTallied로 "개표 완료/개표 중"을 구분한다.
 */

interface ResultFields {
  isWinner: boolean;
  voteCount: number | null;
  voteRate?: number | null;
}

/**
 * 전역 개표 모드 여부.
 *  - 선거 상태가 completed면 개표 모드 (NEC 당선인 API 이관 완료)
 *  - 당선 확정 전에도 선관위 개표진행상황에서 끌어온 중간 득표(voteCount)가
 *    후보 중 하나라도 들어왔으면 개표 모드로 본다. (status는 active 유지)
 */
export function isElectionMode(
  status: string | null | undefined,
  candidates?: ResultFields[],
): boolean {
  if (status === "completed") return true;
  return candidates?.some((c) => c.voteCount != null) ?? false;
}

/** 이 race가 개표되었는지 — 후보 중 당선자 또는 득표수가 들어온 후보가 하나라도 있는가 */
export function isRaceTallied(candidates: ResultFields[]): boolean {
  return candidates.some((c) => c.isWinner || c.voteCount != null);
}

/**
 * 개표 결과 정렬: 당선자 우선 → 득표수 내림차순 → 기존 순서 유지(stable).
 * 원본 배열을 변경하지 않는다.
 */
export function sortByResult<T extends ResultFields>(candidates: T[]): T[] {
  return [...candidates].sort((a, b) => {
    if (a.isWinner !== b.isWinner) return a.isWinner ? -1 : 1;
    const av = a.voteCount ?? -1;
    const bv = b.voteCount ?? -1;
    if (av !== bv) return bv - av;
    return 0;
  });
}
