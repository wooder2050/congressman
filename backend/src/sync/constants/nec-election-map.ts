/** NEC 선거종류코드 → 내부 electionType 매핑 */
export const NEC_TYPE_TO_ELECTION_TYPE: Record<string, string> = {
  '2': 'governor', // 시도지사
  '3': 'mayor', // 시장·군수·구청장
  '4': 'metro-council', // 시도의원 지역구
  '5': 'metro-council', // 시도의원 비례대표
  '6': 'local-council', // 구시군의원 지역구
  '7': 'local-council', // 구시군의원 비례대표
  '10': 'superintendent', // 교육감
};
