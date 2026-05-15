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
