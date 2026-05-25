/**
 * NESDC 결과표 PDF 파서 공통 인터페이스
 *
 * 조사기관마다 PDF 포맷이 달라 어댑터 패턴으로 처리한다.
 * - 입력: PDF 텍스트 (pdftotext -layout 결과)
 * - 출력: ParsedQuestion[] — 각 질문별 후보·정당 지지율 행
 */

/** 한 질문(question)에서 추출된 응답 행 */
export type ParsedResponse = {
  /** 응답 대상 정당명 (예: "더불어민주당", null이면 후보·정당 미식별) */
  partyName: string | null;
  /** 응답 대상 후보명 (예: "정원오", null이면 정당 단위 지지율) */
  candidateName: string | null;
  /** 응답률 (%) */
  rate: number;
  /** 부분 집단 (예: "전체", "남성", "20대") */
  subgroup: string;
  /** 정규화 키 (예: "total", "gender:male", "age:20s") */
  subgroupKey: string;
  /** 해당 subgroup의 가중값 적용 사례수 */
  sampleSize: number | null;
};

/** 한 질문(question) — 후보 지지도 / 정당 지지도 / 적합도 / 양자대결 등 */
export type ParsedQuestion = {
  questionType: 'candidate_support' | 'party_support' | 'approval' | 'turnout_intent' | 'other';
  questionText: string | null;
  /** PDF에서 race 식별에 쓸 명칭 (예: "서울시장", "경남도지사") — race 자동 매칭에 사용 */
  raceLabel: string | null;
  pageNumber: number | null;
  responses: ParsedResponse[];
};

export type ParserContext = {
  agency: string;
  fileName: string;
  text: string;
};

export type PollPdfParser = {
  /** 이 파서가 해당 PDF를 처리할 수 있는지 판단 */
  canParse: (ctx: ParserContext) => boolean;
  /** 추출 — 실패 시 빈 배열 반환 (예외 던지지 않음) */
  parse: (ctx: ParserContext) => ParsedQuestion[];
  /** 디버깅용 파서 이름 */
  name: string;
};
