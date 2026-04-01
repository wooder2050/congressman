import type { BreakingNewsItem } from "./types";

const breakingNews: BreakingNewsItem[] = [
  {
    id: "2026-03-31-committee-chairs",
    title: "상임위원장 3곳 교체 완료 · 6·3 보궐선거 확대",
    description:
      "6·3 지방선거 출마로 공석이 된 상임위원장 3곳의 후임이 3월 31일 본회의에서 선출되었습니다. 안호영 기후에너지환경노동위원장은 전북도지사 출마를 철회하여 유임됩니다.",
    date: "2026-03-31",
    category: "committee",
    items: [
      {
        label: "법제사법위원회",
        value: "추미애 사퇴 → 서영교 선출",
        memberId: "TKJ4800F",
      },
      {
        label: "보건복지위원회",
        value: "박주민 사퇴 → 소병훈 선출",
        memberId: "ZDR63255",
      },
      {
        label: "행정안전위원회",
        value: "신정훈 사퇴 → 권칠승 선출",
        memberId: "C7E79345",
      },
      {
        label: "기후에너지환경노동위원회",
        value: "안호영 유임 (전북도지사 출마 철회)",
        memberId: "XEF29171",
      },
    ],
    sources: [
      {
        title: "국회, 신임 상임위원장 선출…법사위 서영교·행안위 권칠승·복지위 소병훈 — 아주경제",
        url: "https://www.ajunews.com/view/20260331152533135",
      },
      {
        title: "안호영, 전북도지사 도전 '중도하차' — 아주경제",
        url: "https://www.ajunews.com/view/20260331165258265",
      },
    ],
    active: true,
  },
];

/** 현재 활성화된 속보 목록 (최신순) */
export function getActiveBreakingNews(): BreakingNewsItem[] {
  return breakingNews.filter((n) => n.active).sort((a, b) => b.date.localeCompare(a.date));
}
