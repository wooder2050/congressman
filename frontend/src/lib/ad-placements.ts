/**
 * AdSense 광고 단위 ID와 배치(placement) 설정.
 *
 * - 단위 ID는 콘솔(광고 > 광고 단위 기준)에서 만든 디스플레이 단위. 위치별로 단위를 나누는 것은
 *   정책 의무가 아니라 보고서에서 위치별 성과를 가르기 위한 측정 목적이다.
 * - 배치 키는 `data-ad-placement`로 DOM에 남아 GA4 자리 노출 이벤트와 Playwright 검증에 쓰인다.
 * - 슬롯 ID가 비어 있으면 AdSlot은 아무것도 렌더링하지 않는다(fail-closed). 기존 ID로 조용히
 *   대체하지 않는다.
 * - 페이지당 1개가 기본. 기사형 본문에서 두 번째(하단)를 허용하는 조건은 lib/article-ad-plan.ts.
 *
 * 2026-09-13 codex(gpt-6-astra) 설계 검토 반영. 자동 광고(Auto ads)는 사용하지 않는다 —
 * SPA에서 상태가 잔존해 noindex 법안 페이지에도 광고가 붙기 때문(components/ads/AdSlot.tsx 주석).
 */

const AD_UNITS = {
  /** 기존 단위(2026-08-15 생성) — 기사·법안·용어·가이드의 본문 쪽 슬롯 */
  articleInline: "9599985939",
  /** 섹션 사이(주간뉴스 허브·용어 목록·개각·오늘의 국회) — 콘솔 단위 lawmake-section(2026-09-13 생성). 홈은 9/23 전용 단위로 분리 */
  section: "1538618342",
  // 측정 전용 단위(2026-09-23 생성) — 유입이 큰 네 자리의 수익·노출을 보고서에서 따로 보기 위해 분리했다.
  // 형식은 기존과 같은 반응형 디스플레이라 분리 전후 성과를 그대로 비교할 수 있다.
  /** 의원 상세 — 콘솔 단위 lawmake-member */
  member: "7742549131",
  /** 일정 목록 — 콘솔 단위 lawmake-schedule */
  schedule: "4852661914",
  /** 위원회 상세 — 콘솔 단위 lawmake-committee */
  committee: "1951166409",
  /** 홈 — 콘솔 단위 lawmake-home */
  home: "9638084739",
} as const;

type AdSizing = "content-250";

interface AdPlacementConfig {
  slot: string;
  sizing: AdSizing;
}

export const AD_PLACEMENTS = {
  "home-after-picks": { slot: AD_UNITS.home, sizing: "content-250" },
  "weekly-hub-picks": { slot: AD_UNITS.section, sizing: "content-250" },
  "glossary-list": { slot: AD_UNITS.section, sizing: "content-250" },
  "cabinet-after-ministries": { slot: AD_UNITS.section, sizing: "content-250" },
  "today-feed": { slot: AD_UNITS.section, sizing: "content-250" },
  // 2026 국정감사 이슈 페이지(편집) — 상임위별 일정 뒤
  "audit-hub": { slot: AD_UNITS.section, sizing: "content-250" },
  "article-inline": { slot: AD_UNITS.articleInline, sizing: "content-250" },
  "article-bottom": { slot: AD_UNITS.articleInline, sizing: "content-250" },
  "bill-after-discussion": { slot: AD_UNITS.articleInline, sizing: "content-250" },
  "weekly-issue-inline": { slot: AD_UNITS.articleInline, sizing: "content-250" },
  "glossary-term-inline": { slot: AD_UNITS.articleInline, sizing: "content-250" },
  "guide-inline": { slot: AD_UNITS.articleInline, sizing: "content-250" },
  // PR 2(2026-09-15) — 검색 유입·조회수 상위 데이터 페이지. 데이터가 충실한 화면에만 렌더한다
  "member-detail": { slot: AD_UNITS.member, sizing: "content-250" },
  "committee-detail": { slot: AD_UNITS.committee, sizing: "content-250" },
  "schedule-list": { slot: AD_UNITS.schedule, sizing: "content-250" },
} as const satisfies Record<string, AdPlacementConfig>;

export type AdPlacementKey = keyof typeof AD_PLACEMENTS;

/** 광고 높이 예약(CLS 방지). 광고 250px + 라벨·여백 ≈ 280px */
export const AD_RESERVED_HEIGHT: Record<AdSizing, number> = {
  "content-250": 280,
};
