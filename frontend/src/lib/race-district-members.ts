import { SIDO_LIST } from "@/constants/local-elections";

/**
 * 지방선거 선거구 → 그 지역을 대표하는 22대 지역구 국회의원 매칭.
 *
 * 선거구 페이지(지방선거 아카이브)는 유입이 가장 크지만 사이트 안 다른 콘텐츠로 가는 길이 없었다
 * (2026-09-23 분석: 랜딩 세션의 36%, 선거구 764개에 분산). 광고는 붙이지 않고, 그 지역 의원
 * 페이지로 이어지는 동선만 만든다.
 *
 * 표기 차이:
 * - 선거 데이터는 시·도 정식명("경기도"), 의원 지역구는 약칭 접두("경기 수원시갑").
 * - 광주·전남은 선거 데이터에선 따로("광주광역시"/"전라남도"), 의원 지역구는 통합 표기
 *   ("전남광주통합특별시 광산구갑"). 세종은 공백 없이 "세종특별자치시갑".
 * - 선거 시·군·구는 구 단위까지("수원시장안구"), 의원 지역구는 시 단위("수원시갑")와
 *   시+구 단위("성남시분당구갑")가 섞여 있다.
 * - 부분 문자열 오매칭을 막는다: "강서구"에 "서구"가, "달서구"에 "서구"가 들어 있다.
 *   행정구역 이름은 시·군·구로 끝나므로, 일치 위치 바로 앞이 문자열 시작이거나 앞 구역의
 *   끝 글자(시·군·구)일 때만 인정한다.
 */

const MERGED_GWANGJU_JEONNAM = "전남광주통합특별시";

/**
 * 2026 지방선거부터 쓰인 새 구 → 22대 총선(2024) 당시 구 이름. 의원 지역구에는 새 이름이 없다.
 * 인천 행정체제 개편: 서구 → 서구·검단구, 중구·동구 → 제물포구(중구 내륙+동구)·영종구(중구 영종).
 */
const SIGUNGU_ALIASES: Record<string, string[]> = {
  "인천광역시:검단구": ["서구"],
  "인천광역시:제물포구": ["중구", "동구"],
  "인천광역시:영종구": ["중구"],
};

interface DistrictMemberLike {
  id: string;
  term: { district: string; proportional: boolean };
}

/** 선거 데이터의 시·도 → 의원 지역구 접두어. 알 수 없으면 null */
function memberDistrictPrefix(sido: string): string | null {
  if (sido === "광주광역시" || sido === "전라남도") return MERGED_GWANGJU_JEONNAM;
  if (sido === "세종특별자치시") return "세종특별자치시";
  return SIDO_LIST.find((s) => s.id === sido)?.short ?? null;
}

/** 의원 지역구에서 시·도 접두어를 떼어 낸 본문. 해당 시·도가 아니면 null */
function districtBody(district: string, prefix: string): string | null {
  const d = district.trim();
  if (!d.startsWith(prefix)) return null;
  return d.slice(prefix.length).trim();
}

/** body 안에 행정구역 unit이 "구역 경계"에서 시작하는지 */
function hasUnit(body: string, unit: string): boolean {
  let from = 0;
  for (;;) {
    const i = body.indexOf(unit, from);
    if (i === -1) return false;
    if (i === 0 || /[시군구]/.test(body[i - 1])) return true;
    from = i + 1;
  }
}

/** "수원시갑"처럼 시 단위로만 나뉜 지역구인지(시 뒤에 구 이름이 이어지지 않음) */
function cityHasGu(body: string, city: string): boolean {
  const i = body.indexOf(city);
  if (i === -1) return false;
  return /^[가-힣]*?구/.test(body.slice(i + city.length).replace(/[갑을병정무]$/, ""));
}

/** 선거 시·군·구 하나가 의원 지역구 본문에 해당하는지 */
function matchesUnit(body: string, unit: string): boolean {
  const cityGu = unit.match(/^([가-힣]+?시)([가-힣]+구)$/);
  if (!cityGu) return hasUnit(body, unit);
  const [, city, gu] = cityGu;
  if (!hasUnit(body, city)) return false;
  // 의원 지역구가 구 단위까지 나뉘어 있으면 구까지 맞아야 하고, 시 단위면 시만 맞으면 된다
  return cityHasGu(body, city) ? hasUnit(body, gu) : true;
}

interface RaceMemberMatch<T> {
  /** "sigungu": 시·군·구 단위로 좁힘 / "sido": 시·도 전체(광역 선거이거나 시·군·구 매칭 실패) */
  scope: "sigungu" | "sido";
  members: T[];
}

export function matchRaceDistrictMembers<T extends DistrictMemberLike>(
  race: { sido: string; sigungu: string },
  members: T[],
): RaceMemberMatch<T> {
  const prefix = memberDistrictPrefix(race.sido);
  if (!prefix) return { scope: "sido", members: [] };

  const inSido = members
    .filter((m) => !m.term.proportional)
    .map((m) => ({ m, body: districtBody(m.term.district, prefix) }))
    .filter((x): x is { m: T; body: string } => x.body !== null);

  const units = race.sigungu
    ? (SIGUNGU_ALIASES[`${race.sido}:${race.sigungu}`] ?? [race.sigungu])
    : [];
  if (units.length > 0) {
    const matched = inSido.filter(({ body }) => units.some((unit) => matchesUnit(body, unit)));
    if (matched.length > 0) return { scope: "sigungu", members: matched.map((x) => x.m) };
  }
  return { scope: "sido", members: inSido.map((x) => x.m) };
}
