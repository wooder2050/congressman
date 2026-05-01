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

/** 내부 electionType → NEC 선거종류코드 (지역구 기준) */
export const ELECTION_TYPE_TO_NEC_CODES: Record<string, string[]> = {
  governor: ['2'],
  mayor: ['3'],
  'metro-council': ['4', '5'],
  'local-council': ['6', '7'],
  superintendent: ['10'],
};

/** 선거유형 한글 라벨 */
export const ELECTION_TYPE_LABEL: Record<string, string> = {
  governor: '광역단체장',
  mayor: '기초단체장',
  'metro-council': '광역의원',
  'local-council': '기초의원',
  superintendent: '교육감',
};

/** 17개 시도 목록 (NEC API 기준 정식 명칭) */
export const SIDO_LIST = [
  '서울특별시',
  '부산광역시',
  '대구광역시',
  '인천광역시',
  '광주광역시',
  '대전광역시',
  '울산���역시',
  '세종특별자치시',
  '경기도',
  '강원특별자치도',
  '충청북도',
  '충청남도',
  '전북특별자치도',
  '전라남도',
  '경상북도',
  '경상남도',
  '제주특별자치도',
] as const;

export type Sido = (typeof SIDO_LIST)[number];
