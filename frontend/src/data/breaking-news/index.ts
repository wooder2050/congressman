import type { BreakingNewsItem } from "./types";

const breakingNews: BreakingNewsItem[] = [
  {
    id: "2026-03-31-committee-chairs",
    title: "상임위원장 4곳 교체 · 6·3 보궐선거 확대",
    description:
      "6·3 지방선거 출마를 위해 상임위원장 4명이 사퇴하고, 3월 31일 본회의에서 후임 위원장이 선출됩니다. 사퇴 의원들의 지역구는 보궐선거 대상에 추가됩니다.",
    date: "2026-03-31",
    category: "committee",
    items: [
      {
        label: "법제사법위원회",
        value: "추미애 사퇴 → 경기도지사 출마",
        memberId: "PNR4930",
      },
      {
        label: "보건복지위원회",
        value: "박주민 사퇴 → 서울시장 출마",
        memberId: "OZZ7962",
      },
      {
        label: "행정안전위원회",
        value: "신정훈 사퇴 → 전남광주특별시장 출마",
        memberId: "KBA4948",
      },
      {
        label: "기후에너지환경노동위원회",
        value: "안호영 사퇴 → 전북도지사 출마",
        memberId: "GEK3882",
      },
    ],
    sources: [
      {
        title: '한병도 "31일 공석 상임위원장 임명하겠다" — 경향신문',
        url: "https://www.khan.co.kr/article/202603271600001/",
      },
      {
        title: "상임위원장 4곳 31일 일괄 임명 — 아주경제",
        url: "https://www.ajunews.com/view/20260327134100959",
      },
    ],
    active: true,
  },
];

/** 현재 활성화된 속보 목록 (최신순) */
export function getActiveBreakingNews(): BreakingNewsItem[] {
  return breakingNews.filter((n) => n.active).sort((a, b) => b.date.localeCompare(a.date));
}

