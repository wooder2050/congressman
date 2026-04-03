import type { BreakingNewsItem } from "./types";

const breakingNews: BreakingNewsItem[] = [
  {
    id: "2026-04-03-constitutional-amendment",
    title: "여야 6당, 계엄 요건 강화 개헌안 발의 — 국민투표 추진",
    description:
      "국민의힘을 제외한 여야 6당과 우원식 국회의장이 4월 3일 계엄 관련 개헌안을 발의했습니다. 대통령의 계엄 선포 시 48시간 내 국회 승인을 의무화하고, 승인이 없으면 즉시 무효화하는 내용입니다. 6·3 지방선거와 동시에 국민투표를 추진하며, 의결 정족수(197명) 충족을 위해 국민의힘에서 최소 10명의 찬성이 필요합니다.",
    date: "2026-04-03",
    category: "politics",
    items: [
      {
        label: "핵심 내용",
        value: "계엄 선포 시 48시간 내 국회 승인 의무화",
      },
      {
        label: "헌법 전문 확대",
        value: "4·19혁명, 부마항쟁, 5·18민주화운동 명시",
      },
      {
        label: "의결 정족수",
        value: "재적의원 2/3 이상 (197명)",
      },
      {
        label: "국민투표",
        value: "6·3 지방선거와 동시 실시 추진",
      },
    ],
    sources: [
      {
        title: "국힘 뺀 여야 6당 '국회 계엄 승인권' 담은 개헌안 발의 착수 — 경향신문",
        url: "https://www.khan.co.kr/article/202603312020005/",
      },
      {
        title: "여야 6당, 내일 개헌안 발의…국힘 '이탈표' 관건 — 헤럴드경제",
        url: "https://biz.heraldcorp.com/article/10708980",
      },
    ],
    active: true,
  },
  {
    id: "2026-04-02-supplementary-budget",
    title: "이재명 대통령, 26.2조 원 '전쟁 추경' 국회 시정연설",
    description:
      "이재명 대통령이 4월 2일 국회 본회의에서 2026년도 제1회 추가경정예산안에 대한 시정연설을 했습니다. 중동 전쟁 장기화에 따른 고유가·고물가 대응을 위해 26.2조 원 규모의 추경안이 편성되었으며, 국채 발행 없이 초과 세수로 재원을 마련합니다.",
    date: "2026-04-02",
    category: "legislation",
    items: [
      {
        label: "고유가 대응",
        value: "10.1조 원",
      },
      {
        label: "지방정부 투자 여력 확충",
        value: "9.7조 원",
      },
      {
        label: "민생 안정",
        value: "2.8조 원",
      },
      {
        label: "산업 피해 최소화·공급망 안정",
        value: "2.6조 원",
      },
    ],
    sources: [
      {
        title: "이 대통령, '전쟁 추경안' 시정연설...\"경제 회생 골든타임\" — YTN",
        url: "https://www.ytn.co.kr/_cs/_ln_0101_202604021600165558_005.html",
      },
      {
        title: "여야, 25조원 추경 추진…목요일 시정연설, 내달 10일까지 본회의 처리 — 헤럴드경제",
        url: "https://biz.heraldcorp.com/article/10705960",
      },
    ],
    active: true,
  },
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
    active: false,
  },
];

/** 현재 활성화된 속보 목록 (최신순) */
export function getActiveBreakingNews(): BreakingNewsItem[] {
  return breakingNews.filter((n) => n.active).sort((a, b) => b.date.localeCompare(a.date));
}
