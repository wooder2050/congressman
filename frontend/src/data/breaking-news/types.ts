export interface BreakingNewsItem {
  /** 고유 식별자 */
  id: string;
  /** 속보 제목 */
  title: string;
  /** 상세 설명 */
  description: string;
  /** 발행일 (YYYY-MM-DD) */
  date: string;
  /** 카테고리 */
  category: "committee" | "election" | "legislation" | "politics";
  /** 관련 항목 (변경된 위원장, 보궐선거 선거구 등) */
  items?: BreakingNewsDetail[];
  /** 관련 뉴스 출처 */
  sources?: { title: string; url: string }[];
  /** 상세 페이지 링크 */
  linkUrl?: string;
  /** 활성 여부 — false면 홈에서 숨김 */
  active: boolean;
}

export interface BreakingNewsDetail {
  /** 라벨 (예: "법제사법위원회") */
  label: string;
  /** 설명 (예: "추미애 → 후임 미정") */
  value: string;
  /** 관련 의원 ID (lawmake 링크용) */
  memberId?: string;
}
