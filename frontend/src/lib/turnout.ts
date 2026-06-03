import { createClient } from "@/lib/supabase/client";

/**
 * 선거 투표율 — Supabase `ElectionTurnout` 테이블을 프론트에서 직접 조회한다.
 *
 * 배포 없이 SQL UPDATE만으로 화면에 즉시 반영하기 위한 동적 콘텐츠다.
 * (백엔드 API/ISR을 거치지 않으므로 캐시 무효화 불필요)
 */

export type TurnoutScope = "local" | "by-election";

export interface TurnoutRow {
  region: string;
  turnoutRate: number;
  voterCount: number | null;
  voteCount: number | null;
  asOf: string;
  note: string;
  sortOrder: number;
}

export interface TurnoutData {
  /** 전국(region === "전국") 행 */
  national: TurnoutRow | null;
  /** 지역별 행 (sortOrder 오름차순) */
  regions: TurnoutRow[];
}

interface RawRow {
  region: string;
  turnoutRate: number;
  voterCount: number | null;
  voteCount: number | null;
  asOf: string | null;
  note: string | null;
  sortOrder: number;
}

/**
 * 한 선거(scope)의 투표율을 조회한다.
 * 데이터가 없거나 Supabase 미설정 시 null을 반환해 배너를 숨길 수 있게 한다.
 */
export async function getElectionTurnout(scope: TurnoutScope): Promise<TurnoutData | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("ElectionTurnout")
    .select('region, turnoutRate, voterCount, voteCount, asOf, note, "sortOrder"')
    .eq("scope", scope)
    .eq("isActive", true)
    .order("sortOrder", { ascending: true });

  if (error || !data || data.length === 0) return null;

  const rows: TurnoutRow[] = (data as RawRow[]).map((r) => ({
    region: r.region,
    turnoutRate: r.turnoutRate,
    voterCount: r.voterCount,
    voteCount: r.voteCount,
    asOf: r.asOf ?? "",
    note: r.note ?? "",
    sortOrder: r.sortOrder,
  }));

  const national = rows.find((r) => r.region === "전국") ?? null;
  const regions = rows.filter((r) => r.region !== "전국");

  return { national, regions };
}

Object.defineProperty(getElectionTurnout, "queryKey", { value: "electionTurnout" });
