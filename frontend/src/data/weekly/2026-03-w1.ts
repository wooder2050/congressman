import type { WeeklyArticle } from "./types";

const article: WeeklyArticle = {
  id: "2026-03-w1",
  title: "3월 1주차",
  period: "2026.03.02 ~ 03.07",
  publishedDate: "2026-03-09",
  summary:
    "대미투자특별법 특위 만장일치 통과, 전남광주 행정통합법 40년 만에 본회의 가결, 아동수당 만 13세까지 확대",
  tags: ["대미투자특별법", "전남광주통합", "아동수당", "상법개정", "필리버스터"],
  stats: {
    billsPassed: 4,
    votesHeld: 6,
    committeeMeetings: 8,
  },
  featuredBills: [
    {
      title: "대미투자특별법 (한미전략투자공사 설립)",
      status: "committee",
      description:
        "미국의 추가 관세 인상 위협에 대응하기 위한 법안으로, 자본금 2조 원 규모의 한미전략투자공사를 설립해 3,500억 달러 규모 대미 투자 양해각서를 이행하는 내용입니다. 3월 4~5일 대미투자특위 법안소위에서 심사를 거쳐 여야 만장일치로 특위를 통과했으며, 3월 12일 본회의 처리가 합의되었습니다.",
      proposer: "정부 제출",
      sources: [
        {
          title: "특위 통과한 '대미투자특별법' - MBC뉴스",
          url: "https://www.youtube.com/watch?v=5eonzmQJhA8",
          type: "youtube",
        },
        {
          title: "대미투자특별법, 여야 만장일치 통과 - SBS",
          url: "https://www.youtube.com/watch?v=s7jemRDHMfA",
          type: "youtube",
        },
        {
          title: "국회 대미특위, 대미투자특별법 만장일치 통과 - MBC",
          url: "https://imnews.imbc.com/news/2026/politics/article/6805965_36911.html",
          type: "article",
        },
      ],
    },
    {
      title: "전남광주행정통합특별법",
      status: "passed",
      description:
        "40년 넘게 논의되어 온 전남-광주 행정통합의 법적 근거를 마련한 법안입니다. 통합특별시 설치를 위한 절차와 주민투표, 행정체계 전환 방안 등을 담고 있습니다. 3월 1일 본회의에서 재석 175명 중 찬성 159표로 가결되었습니다.",
      voteResult: { yes: 159, no: 2, abstain: 14 },
      sources: [
        {
          title: "40년 만의 통합...전남광주특별시, 기대와 우려는? - KBS",
          url: "https://www.youtube.com/watch?v=SUmFU6O_DFY",
          type: "youtube",
        },
        {
          title: "전남광주 통합 특별법 국회 통과 - 광주MBC",
          url: "https://www.youtube.com/watch?v=GXgGWu8aMfA",
          type: "youtube",
        },
        {
          title: "전남·광주 행정통합 40년 만에 본회의 통과 - 머니투데이",
          url: "https://www.mt.co.kr/politics/2026/03/01/2026030120481754627",
          type: "article",
        },
      ],
    },
    {
      title: "아동수당법 개정안",
      status: "passed",
      description:
        "아동수당 지급 대상을 2030년까지 만 13세 미만으로 단계적으로 확대하는 법안입니다. 인구감소지역에 대한 추가 지급과 2026년 1월분 소급 적용이 포함되어 있어, 저출생 대응 정책의 핵심 법안으로 주목받았습니다.",
      voteResult: { yes: 173, no: 0, abstain: 2 },
      sources: [
        {
          title: "아이가 2017년생인데, 아동수당 못 받나요? - KBS",
          url: "https://www.youtube.com/watch?v=akHsqylIBwc",
          type: "youtube",
        },
        {
          title: "만 12세까지 월 10만 원 아동수당 받는다 - MBN",
          url: "https://www.youtube.com/watch?v=tlzXz_SqaUM",
          type: "youtube",
        },
      ],
    },
    {
      title: "3차 상법 개정안 (자사주 소각 의무화)",
      status: "passed",
      description:
        "기업이 자기주식을 취득한 후 1년 이내에 소각하도록 의무화하고, 보유·처분 시 주주총회 승인을 받도록 하는 내용입니다. 밸류업 프로그램의 일환으로 기업 지배구조 개선과 주주가치 제고를 목표로 합니다. 2월 25일 재석 176명 중 찬성 175표로 가결되었습니다.",
      voteResult: { yes: 175, no: 0, abstain: 1 },
      sources: [
        {
          title: "'자사주 의무 소각' 3차 상법 개정안 본회의 통과 - 연합뉴스TV",
          url: "https://www.youtube.com/watch?v=71aopio8JSQ",
          type: "youtube",
        },
        {
          title: "'자사주 소각법'까지 통과...주가 누르기 멈춰 - MBC",
          url: "https://www.youtube.com/watch?v=FT8yduukk94",
          type: "youtube",
        },
        {
          title: "3차 상법 개정안 본회의 통과 - 조세일보",
          url: "http://www.joseilbo.com/news/htmls/2026/02/20260225563520.html",
          type: "article",
        },
      ],
    },
  ],
  highlights: [
    {
      category: "politics",
      title: "국민의힘 필리버스터 5박 6일 만에 종료",
      description:
        "2월 24일부터 시작된 국민의힘의 무제한토론이 3월 1일 종료되었습니다. TK통합법(대구-경북 행정통합법) 처리를 둘러싼 여야 갈등이 배경이었으나, TK통합법은 결국 이번 주 처리되지 못했습니다.",
    },
    {
      category: "economy",
      title: "이란 사태에 따른 경제 불안 국회 논의",
      description:
        "미국-이스라엘의 이란 공습으로 원/달러 환율이 급등하면서, 국회에서도 경제 비상대응 논의가 이어졌습니다. 대미투자특별법 심사 과정에서도 환율 급등에 따른 투자 재원 문제가 쟁점이 되었습니다.",
    },
    {
      category: "committee",
      title: "대미투자특위 집중 심사",
      description:
        "3월 4~5일 이틀간 대미투자특별위원회에서 법안 전체회의와 소위원회가 연이어 개최되며, 대미투자특별법을 집중 심사했습니다. 여야가 만장일치로 통과시키며 초당적 합의를 이끌어냈습니다.",
    },
    {
      category: "bill",
      title: "지방자치법 개정안 가결",
      description:
        "전남광주 통합특별시 설치 근거와 부시장 정수 4명 규정을 포함한 지방자치법 개정안이 재석 173명 중 찬성 165표로 본회의를 통과했습니다.",
    },
    {
      category: "politics",
      title: "6월 지방선거 앞둔 입법 경쟁 본격화",
      description:
        "2026년 6월 지방선거를 앞두고 반도체, 노동, 재정 등 쟁점 법안에서 여야 정면 충돌이 예고되고 있으며, 각 정당의 선거 전략에 따른 입법 경쟁이 본격화되고 있습니다.",
    },
  ],
  analysis:
    "3월 첫째 주는 대미투자특별법이 여야 만장일치로 특위를 통과하며 초당적 합의의 가능성을 보여준 한 주였습니다. 미국의 관세 압력에 대한 국회 차원의 대응이 빠르게 이루어진 것은 이례적입니다. 한편 전남광주 행정통합특별법의 가결은 40년 넘게 논의되어 온 지역 현안이 입법으로 결실을 맺은 사례로, 지방행정 개편의 새로운 장을 열었습니다. 6월 지방선거를 앞두고 반도체·노동·재정 등 쟁점 법안에서 여야 충돌이 예고되고 있어, 3월 이후 입법 경쟁이 더욱 치열해질 전망입니다.",
};

export default article;
