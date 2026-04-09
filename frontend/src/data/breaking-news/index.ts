import type { BreakingNewsItem } from "./types";

const breakingNews: BreakingNewsItem[] = [
  {
    id: "2026-04-09-supplementary-budget-final",
    title: "추경 31.4조 → 감액 심사 중 — 내일 본회의 의결 예정",
    description:
      "예결위 조정소위(9일)가 상임위 증액분에 대한 감액 심사를 진행하고 있습니다. 정부 원안 26.2조 원이 상임위 심사 과정에서 31.4조 원으로 5.2조 원 증액되었으며, '전쟁 추경과 무관한 끼워넣기 예산'이라는 비판 속에 중국인 관광객 짐 캐리 지원(25억), 프로스포츠 관람권(200억), 베란다 태양광(475억) 등이 삭감 대상으로 거론되고 있습니다. 10일 예결위 전체회의와 본회의에서 최종 의결될 예정입니다.",
    date: "2026-04-09",
    category: "legislation",
    items: [
      {
        label: "4/9 조정소위",
        value: "상임위 증액분 감액 심사 진행",
      },
      {
        label: "증액 규모",
        value: "26.2조 → 31.4조 (8개 상임위에서 +5.2조)",
      },
      {
        label: "주요 감액 대상",
        value: "짐 캐리 지원 25억·프로스포츠 관람권 200억·베란다 태양광 475억·TBS 49억 등",
      },
      {
        label: "4/10",
        value: "예결위 전체회의 + 본회의 최종 의결 예정",
      },
    ],
    sources: [
      {
        title: "'전쟁 추경' 처리 임박..\"증액이냐 감액이냐\" 기로에 — 파이낸셜뉴스",
        url: "https://www.fnnews.com/news/202604091511508387",
      },
      {
        title: "전쟁 추경이라는데 수상한 '끼워넣기'…예결위 '칼질' 기로 — 헤럴드경제",
        url: "https://biz.heraldcorp.com/article/10713416",
      },
      {
        title: "'전쟁추경'이라더니 곳곳에 끼워넣기 예산…국회 삭감 주목 — 헤럴드경제",
        url: "https://biz.heraldcorp.com/article/10713499",
      },
    ],
    active: true,
  },
  {
    id: "2026-04-06-constitutional-amendment-cabinet",
    title: "개헌안 국무회의 의결 — 20일 공고 후 국회 표결·국민투표 수순",
    description:
      "이재명 대통령이 4월 6일 국무회의에서 헌법 개정안 공고안을 의결했습니다. 여야 6당이 발의한 개헌안은 대통령의 비상계엄 선포에 대한 국회 통제를 강화하고, 헌법 전문에 5·18민주화운동·부마항쟁 정신을 명시하는 내용입니다. 20일 이상 공고 후 5월 10일까지 국회 본회의 가결이 필요하며, 6·3 지방선거와 동시 국민투표를 추진합니다.",
    date: "2026-04-06",
    category: "politics",
    items: [
      {
        label: "국무회의 의결",
        value: "4/6 개헌안 공고안 의결 완료",
      },
      {
        label: "국회 의결 시한",
        value: "5월 10일까지 본회의 가결 필요",
      },
      {
        label: "의결 정족수",
        value: "재적의원 2/3 이상 (197명) — 국민의힘 최소 10표 이탈 필요",
      },
      {
        label: "국민투표",
        value: "6·3 지방선거와 동시 실시 추진",
      },
    ],
    sources: [
      {
        title: "'6·3 지방선거 동시 개헌 국민투표' 공고안, 국무회의 의결 — 경향신문",
        url: "https://www.khan.co.kr/article/202604061310001",
      },
      {
        title: "4월 국회 시작…추경·개헌 몰아치는 與 — 헤럴드경제",
        url: "https://biz.heraldcorp.com/article/10709638",
      },
    ],
    active: true,
  },
  {
    id: "2026-04-08-supplementary-budget-review",
    title: "추경 26.2조 → 30조로 증액 논란 — 내일 조정소위, 10일 본회의",
    description:
      "예결위 종합정책질의(7~8일)가 완료되었습니다. 정부 원안 26.2조 원이 상임위 심사 과정에서 약 3.4조 원 증액되어 30조 원 규모로 불어났습니다. 국민의힘은 '끼워넣기 예산'이라며 반발하고 있으며, 예결위 조정소위(9일)에서 증액분에 대한 감액 검증이 예정되어 있습니다. 10일 본회의 처리가 목표입니다.",
    date: "2026-04-08",
    category: "legislation",
    items: [
      {
        label: "4/7~8",
        value: "예결위 종합정책질의 완료",
      },
      {
        label: "4/9",
        value: "조정소위 — 상임위 증액분 감액 검증",
      },
      {
        label: "4/10",
        value: "본회의 추경안 처리 목표",
      },
      {
        label: "새 쟁점",
        value: "상임위 증액 3.4조 원 — 농해수위 9,739억·기후환노위 6,100억·복지위 3,446억 등",
      },
    ],
    sources: [
      {
        title: "26조가 30조로…기막힌 추경 끼워넣기 — 서울경제",
        url: "https://www.sedaily.com/article/20029507",
      },
      {
        title: "국회 예결위, '26조 추경안' 심사 시작···대정부 종합정책질의 — 경향신문",
        url: "https://www.khan.co.kr/article/202604070820001/",
      },
    ],
    active: false,
  },
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
        title: "여야 6당, 개헌안 발의 착수…국힘은 불참 — 연합뉴스TV",
        url: "https://www.youtube.com/watch?v=V_aark30f8o",
      },
      {
        title: "39년 만에 국회에서 개헌안 발의…국회 문턱 넘을 수 있을까? — KBS",
        url: "https://www.youtube.com/watch?v=OPLBCZg4754",
      },
      {
        title: "국힘 뺀 여야 6당 '국회 계엄 승인권' 담은 개헌안 발의 착수 — 경향신문",
        url: "https://www.khan.co.kr/article/202603312020005/",
      },
    ],
    active: false,
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
    active: false,
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
