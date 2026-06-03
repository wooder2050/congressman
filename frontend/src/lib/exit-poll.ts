import { createClient } from "@/lib/supabase/client";

/**
 * 출구조사 예측 — Supabase `ExitPoll` 테이블을 프론트에서 직접 조회한다.
 *
 * 투표 마감(6/3 18시) 직후 발표되는 방송사 출구조사 예측치를 표시한다.
 * 출처(방송3사 공동 / JTBC 등)가 여러 개일 수 있어 `source`로 묶어 반환하며,
 * 화면에서는 출처별 탭으로 전환한다.
 *
 * `ElectionTurnout`과 동일하게 백엔드 API/ISR을 거치지 않고 직접 조회하므로,
 * SQL UPSERT만으로 배포·캐시 무효화 없이 화면에 즉시 반영된다.
 */

/**
 * 출구조사 스코프.
 * - governor: 시도지사(광역단체장) 17곳
 * - superintendent: 교육감 17곳
 * - by-election: 재보궐 국회의원 14곳
 */
export type ExitPollScope = "governor" | "superintendent" | "by-election";

/** 레이스(예: 서울시장) 내 한 후보의 예측치 */
export interface ExitPollCandidate {
  candidate: string;
  party: string;
  partyColor: string;
  /** 예측 득표율 하한(%) */
  rateLow: number;
  /** 예측 득표율 상한(%) — 단일값이면 rateLow와 동일 */
  rateHigh: number;
  /** 당선 유력/경합 우세 표시 */
  isLeading: boolean;
  note: string;
  sortOrder: number;
}

/** 한 레이스(선거구)의 출구조사 결과 */
export interface ExitPollRace {
  raceKey: string;
  raceLabel: string;
  region: string;
  asOf: string;
  sortOrder: number;
  candidates: ExitPollCandidate[];
}

/** 한 출처(방송사)의 출구조사 결과 — 탭 하나에 대응 */
export interface ExitPollSource {
  /** 출처명 (예: "방송3사", "JTBC") — 탭 라벨로도 쓰인다 */
  source: string;
  /** 탭 정렬 순서 (작을수록 앞) */
  sourceOrder: number;
  races: ExitPollRace[];
}

interface RawRow {
  source: string | null;
  sourceOrder: number;
  raceKey: string;
  raceLabel: string;
  region: string | null;
  candidate: string;
  party: string | null;
  partyColor: string | null;
  rateLow: number;
  rateHigh: number;
  isLeading: boolean;
  asOf: string | null;
  note: string | null;
  sortOrder: number;
}

/**
 * 한 스코프의 출구조사 결과를 출처별 → 레이스별로 묶어 반환한다.
 * 데이터가 없거나 Supabase 미설정 시 null을 반환해 섹션을 숨길 수 있게 한다.
 */
export async function getExitPoll(scope: ExitPollScope): Promise<ExitPollSource[] | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("ExitPoll")
    .select(
      'source, "sourceOrder", raceKey, raceLabel, region, candidate, party, "partyColor", "rateLow", "rateHigh", "isLeading", asOf, note, "sortOrder"',
    )
    .eq("scope", scope)
    .eq("isActive", true)
    .order("sourceOrder", { ascending: true })
    .order("sortOrder", { ascending: true });

  if (error || !data || data.length === 0) return null;

  // source → raceKey 2단계로 묶되, 행 순서(sourceOrder, sortOrder 오름차순)를 유지한다.
  const sourceMap = new Map<string, ExitPollSource>();
  for (const r of data as RawRow[]) {
    const sourceName = r.source ?? "방송3사";
    let src = sourceMap.get(sourceName);
    if (!src) {
      src = { source: sourceName, sourceOrder: r.sourceOrder, races: [] };
      sourceMap.set(sourceName, src);
    }

    let race = src.races.find((x) => x.raceKey === r.raceKey);
    if (!race) {
      race = {
        raceKey: r.raceKey,
        raceLabel: r.raceLabel,
        region: r.region ?? "",
        asOf: r.asOf ?? "",
        sortOrder: r.sortOrder,
        candidates: [],
      };
      src.races.push(race);
    }
    race.candidates.push({
      candidate: r.candidate,
      party: r.party ?? "",
      partyColor: r.partyColor ?? "#9ca3af",
      rateLow: r.rateLow,
      rateHigh: r.rateHigh,
      isLeading: r.isLeading,
      note: r.note ?? "",
      sortOrder: r.sortOrder,
    });
  }

  // 출처는 sourceOrder순, 레이스는 첫 등장(최소 sortOrder)순, 후보는 득표율 내림차순.
  const sources = [...sourceMap.values()].sort((a, b) => a.sourceOrder - b.sourceOrder);
  for (const src of sources) {
    src.races.sort((a, b) => a.sortOrder - b.sortOrder);
    for (const race of src.races) {
      race.candidates.sort((a, b) => b.rateHigh - a.rateHigh);
    }
  }

  return sources;
}

Object.defineProperty(getExitPoll, "queryKey", { value: "exitPoll" });
