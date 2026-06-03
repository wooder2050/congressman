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

/**
 * race 개표 상태.
 *  - "won"      : 공식 당선 확정 (isWinner=true 또는 status=completed). NEC 당선인 API 기반.
 *  - "leading"  : 당선 유력 (우리가 추정). 보수적 — 남은 표로 역전 불가 + 개표율 50%+일 때만.
 *  - "counting" : 개표 진행 중 (득표는 들어왔으나 유력 단정 불가).
 *  - "pending"  : 개표 전 (득표 없음).
 *
 * ⚠️ "leading"(유력)은 추정이며 "won"(당선 확정)과 시각·문구를 반드시 구분할 것.
 *    잘못된 유력 표시는 신뢰도에 치명적 → 확실할 때만(엄격) 판단한다.
 */
export type RaceCallStatus = "won" | "leading" | "counting" | "pending";

interface CallCandidate {
  isWinner: boolean;
  voteCount: number | null;
}

interface CallRace {
  /** 선거 유형 — *-proportional(비례)는 유력 추정에서 제외 */
  electionType?: string | null;
  /** 의석 수 — 2 이상(다인선거구)이면 단일 당선 가정이 깨지므로 제외 */
  seatCount?: number | null;
  /** 개표율 (%) — race 레벨, 없으면 후보 득표로 근사 */
  countedRate?: number | null;
  /** 투표수(유효+무효) — race 레벨, 있으면 남은 표 상한을 보수적으로 산출 */
  totalVotes?: number | null;
}

/** 다수대표제(단일 당선) race인지 — 비례·다인선거구는 유력 추정 대상이 아님 */
function isSingleWinnerRace(race: CallRace): boolean {
  const type = race.electionType ?? "";
  if (type.endsWith("-proportional")) return false;
  if ((race.seatCount ?? 1) > 1) return false;
  return true;
}

/**
 * race의 개표 상태를 판단한다. 후보 배열은 정렬돼 있지 않아도 된다(내부에서 득표순 처리).
 *
 * 유력(leading) 판단 공식(보수적):
 *   counted = Σ 후보 voteCount(현재 개표된 유효표)
 *   개표율 p(%) = race.countedRate (없으면 산출 불가 → 유력 보류)
 *   remaining = totalVotes 있으면 (totalVotes - counted), 없으면 counted*(100-p)/p
 *   조건: (1위 - 2위) > remaining  AND  p >= 50   → "leading" (마진 없이 엄격)
 * isWinner=true면 유력 계산을 건너뛰고 "won" 우선.
 */
export function getRaceCallStatus(race: CallRace, candidates: CallCandidate[]): RaceCallStatus {
  // 공식 당선 확정 최우선
  if (candidates.some((c) => c.isWinner)) return "won";

  const tallied = candidates.filter((c) => c.voteCount != null);
  if (tallied.length === 0) return "pending";

  // 다수대표제가 아니면 유력 추정 안 함 — 득표만 있으면 "counting"
  if (!isSingleWinnerRace(race)) return "counting";

  const p = race.countedRate;
  // 개표율을 모르거나 50% 미만이면 유력 보류(보수적)
  if (p == null || p < 50) return "counting";

  const sorted = [...tallied].sort((a, b) => (b.voteCount ?? 0) - (a.voteCount ?? 0));
  if (sorted.length < 2) return "counting"; // 단독 후보 등 비교 불가 → 단정 안 함

  const counted = tallied.reduce((s, c) => s + (c.voteCount ?? 0), 0);
  const lead = (sorted[0].voteCount ?? 0) - (sorted[1].voteCount ?? 0);

  // 남은 표 상한 — totalVotes 있으면 무효표 포함 보수적, 없으면 개표율로 근사
  const remaining =
    race.totalVotes != null
      ? Math.max(0, race.totalVotes - counted)
      : p > 0
        ? (counted * (100 - p)) / p
        : Infinity;

  return lead > remaining ? "leading" : "counting";
}
