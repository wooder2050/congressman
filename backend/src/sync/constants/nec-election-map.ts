/**
 * NEC 선거종류코드 → 내부 electionType 매핑.
 *
 * 2026-05-15 검증 결과 NEC API가 2018·2022와 다른 코드 체계를 사용함을 확인.
 * sgTypecode=2는 국회의원 재보궐로 매핑되며, 본 지방선거 데이터는 아래 표와 같음.
 *
 * | code | totalCount(20260603) | 의미 |
 * |------|-----------------------|------|
 * | 2    | 47    | 국회의원 재보궐 (sync 대상 아님)                 |
 * | 3    | 54    | 광역단체장 (시·도지사)                           |
 * | 4    | 585   | 기초단체장 (시장·군수·구청장)                    |
 * | 5    | 1,657 | 광역의원 지역구                                  |
 * | 6    | 4,402 | 기초의원 지역구                                  |
 * | 7    | INFO-03 | (제공 없음 — 기초의원 비례는 9번으로 추정)    |
 * | 8    | 354   | 광역의원 비례 (정당 단위, wiwName 비어있음)      |
 * | 9    | 672   | 기초의원 비례 (시·군·구 단위)                    |
 * | 10   | INFO-03 | (제공 없음)                                   |
 * | 11   | 58    | 교육감 (정당명 없음)                             |
 */
export const NEC_TYPE_TO_ELECTION_TYPE: Record<string, string> = {
  '3': 'governor', // 시도지사 — sd 단위, sgg=sd, wiw=''
  '4': 'mayor', // 시장·군수·구청장 — sd+wiw(=시군구) 단위, sgg=시군구
  '5': 'metro-council', // 광역의원 지역구 — sd+wiw 단위, sgg=선거구명(예: "종로구제1선거구")
  '6': 'local-council', // 기초의원 지역구 — sd+wiw 단위, sgg=선거구명(예: "종로구가선거구")
  '8': 'metro-proportional', // 광역의원 비례 — sd 단위, sgg=sd, wiw=''
  '9': 'local-proportional', // 기초의원 비례 — sd+wiw 단위
  '11': 'superintendent', // 교육감 — sd 단위, sgg=sd, wiw='', jdName=''
};

/** 비례대표 코드 (race를 후보자별이 아닌 scope 단위 1개로 통합) */
export const PROPORTIONAL_NEC_CODES = new Set(['8', '9']);

/**
 * race scope가 '시도 전체'인 코드(시도 단위 1개 race).
 * 광역단체장·교육감·광역의원 비례는 시도당 1개 race.
 */
export const SIDO_WIDE_NEC_CODES = new Set(['3', '8', '11']);
