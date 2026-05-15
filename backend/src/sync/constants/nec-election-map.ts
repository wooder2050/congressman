/** NEC 선거종류코드 → 내부 electionType 매핑 */
export const NEC_TYPE_TO_ELECTION_TYPE: Record<string, string> = {
  '2': 'governor', // 시도지사
  '3': 'mayor', // 시장·군수·구청장
  '4': 'metro-council', // 시도의원 지역구
  '5': 'metro-proportional', // 시도의원 비례대표 (시도 단위 1개 race로 통합)
  '6': 'local-council', // 구시군의원 지역구
  '7': 'local-proportional', // 구시군의원 비례대표 (시도+시군구 단위 1개 race로 통합)
  '10': 'superintendent', // 교육감
};

/** 비례대표 코드 (race를 후보자별이 아닌 scope 단위 1개로 통합) */
export const PROPORTIONAL_NEC_CODES = new Set(['5', '7']);
