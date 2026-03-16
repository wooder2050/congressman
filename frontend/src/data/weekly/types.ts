export interface WeeklyArticle {
  /** 고유 식별자 (예: "2026-03-w1") */
  id: string;
  /** 표시 제목 (예: "3월 1주차") */
  title: string;
  /** 기간 (예: "2026.03.02 ~ 03.07") */
  period: string;
  /** 발행일 */
  publishedDate: string;
  /** 한 줄 요약 */
  summary: string;
  /** 핵심 키워드 태그 */
  tags: string[];
  /** 주요 법안 소개 */
  featuredBills: FeaturedBill[];
  /** 주간 하이라이트 */
  highlights: WeeklyHighlight[];
  /** 주간 통계 */
  stats?: WeeklyStats;
  /** 이번 주 분석 — 입법 동향에 대한 맥락과 전망 */
  analysis?: string;
}

export interface FeaturedBill {
  /** 법안 제목 */
  title: string;
  /** URL 슬러그 (기사 페이지용, 예: "대미투자특별법") */
  slug?: string;
  /** lawmake.kr 법안 ID (있으면 링크 연결) */
  billId?: string;
  /** 상태: passed, pending, committee 등 */
  status: "passed" | "pending" | "committee" | "rejected";
  /** 법안 설명 (왜 주목할 만한지) */
  description: string;
  /** 기사 본문 (신문 기사 스타일, 섹션별 배열) */
  article?: ArticleSection[];
  /** 발의자/대표발의자 */
  proposer?: string;
  /** 표결 결과 (본회의 통과 법안의 경우) */
  voteResult?: {
    yes: number;
    no: number;
    abstain: number;
  };
  /** 관련 뉴스/영상 출처 */
  sources?: { title: string; url: string; type?: "article" | "youtube" }[];
}

export interface ArticleSection {
  /** 소제목 (질문형 권장) */
  heading: string;
  /** 본문 (여러 문단이면 \n\n으로 구분) */
  body: string;
}

export interface WeeklyHighlight {
  /** 카테고리 */
  category: "vote" | "bill" | "committee" | "politics" | "economy";
  /** 제목 */
  title: string;
  /** 설명 */
  description: string;
  /** URL 슬러그 (기사 페이지 연결용) */
  slug?: string;
  /** 기사 본문 */
  article?: ArticleSection[];
}

export interface WeeklyStats {
  /** 이번 주 통과 법안 수 */
  billsPassed?: number;
  /** 이번 주 발의 법안 수 */
  billsProposed?: number;
  /** 이번 주 본회의 표결 수 */
  votesHeld?: number;
  /** 이번 주 위원회 회의 수 */
  committeeMeetings?: number;
}
