import type { LocalElectionType } from "@/types";

export const SIDO_LIST = [
  { id: "서울특별시", short: "서울" },
  { id: "부산광역시", short: "부산" },
  { id: "대구광역시", short: "대구" },
  { id: "인천광역시", short: "인천" },
  { id: "광주광역시", short: "광주" },
  { id: "대전광역시", short: "대전" },
  { id: "울산광역시", short: "울산" },
  { id: "세종특별자치시", short: "세종" },
  { id: "경기도", short: "경기" },
  { id: "강원특별자치도", short: "강원" },
  { id: "충청북도", short: "충북" },
  { id: "충청남도", short: "충남" },
  { id: "전북특별자치도", short: "전북" },
  { id: "전라남도", short: "전남" },
  { id: "경상북도", short: "경북" },
  { id: "경상남도", short: "경남" },
  { id: "제주특별자치도", short: "제주" },
] as const;

export const ELECTION_TYPES: {
  id: LocalElectionType;
  label: string;
  shortLabel: string;
}[] = [
  { id: "governor", label: "광역단체장", shortLabel: "시도지사" },
  { id: "mayor", label: "기초단체장", shortLabel: "시장·군수" },
  { id: "metro-council", label: "광역의원", shortLabel: "시도의원" },
  { id: "metro-proportional", label: "광역의원 비례", shortLabel: "광역 비례" },
  { id: "local-council", label: "기초의원", shortLabel: "구시군의원" },
  { id: "local-proportional", label: "기초의원 비례", shortLabel: "기초 비례" },
  { id: "superintendent", label: "교육감", shortLabel: "교육감" },
];

/**
 * 6·3 지방선거 투표용지 7장 순서 (한국 유권자 mental model).
 * 사용자가 투표소에서 받는 용지 순서와 동일하게 정렬해
 * "내 투표용지" 메타포를 페이지에 그대로 반영한다.
 *
 * 일부 지역(세종·제주 등) 또는 재보궐 대상 지역에서는 추가/생략이 있을 수 있어
 * `kind`로 인물(person)·정당(party)·인물·정당무관(non-partisan)을 구분한다.
 */
export const BALLOT_ORDER: {
  number: number;
  type: LocalElectionType;
  ballotLabel: string;
  kind: "person" | "party" | "non-partisan";
}[] = [
  { number: 1, type: "governor", ballotLabel: "광역단체장 (시·도지사)", kind: "person" },
  { number: 2, type: "superintendent", ballotLabel: "교육감", kind: "non-partisan" },
  { number: 3, type: "metro-council", ballotLabel: "광역의원 (시·도의원)", kind: "person" },
  {
    number: 4,
    type: "metro-proportional",
    ballotLabel: "광역의원 비례대표 (정당투표)",
    kind: "party",
  },
  { number: 5, type: "mayor", ballotLabel: "기초단체장 (시장·군수·구청장)", kind: "person" },
  { number: 6, type: "local-council", ballotLabel: "기초의원 (구·시·군의원)", kind: "person" },
  {
    number: 7,
    type: "local-proportional",
    ballotLabel: "기초의원 비례대표 (정당투표)",
    kind: "party",
  },
];

/** 지역(시군구)에 종속되는 선거: 사용자가 시군구를 선택해야 후보가 달라짐 */
export const SIGUNGU_SCOPED_TYPES = new Set<LocalElectionType>([
  "mayor",
  "metro-council",
  "local-council",
  "local-proportional",
]);

/** 시도 전체 공통 선거: 시군구 선택과 무관하게 후보가 같음 */
export const SIDO_WIDE_TYPES = new Set<LocalElectionType>([
  "governor",
  "superintendent",
  "metro-proportional",
]);

/** SIDO_LIST에서 short → id 변환 */
export function sidoFromShort(short: string): string | undefined {
  return SIDO_LIST.find((s) => s.short === short)?.id;
}

/** SIDO_LIST에서 id → short 변환 */
export function sidoToShort(id: string): string {
  return SIDO_LIST.find((s) => s.id === id)?.short ?? id.slice(0, 2);
}

/** electionType → 한글 라벨 */
export function electionTypeLabel(type: LocalElectionType): string {
  return ELECTION_TYPES.find((t) => t.id === type)?.label ?? type;
}
