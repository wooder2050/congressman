import type { WeeklyArticle } from "./types";

const article: WeeklyArticle = {
  id: "2025-12-w4",
  title: "12월 4주차",
  period: "2025.12.22 ~ 12.31",
  publishedDate: "2026-01-04",
  summary:
    "내란전담재판부법·정통망법 본회의 통과, 장동혁 대표 역대 최장 22시간 필리버스터, 12·29 참사 1주기 추모, 쿠팡 연석청문회",
  tags: [
    "내란전담재판부",
    "정통망법",
    "필리버스터",
    "12.29 1주기",
    "쿠팡 청문회",
  ],
  stats: {
    billsPassed: 2,
    votesHeld: 2,
    committeeMeetings: 8,
  },
  featuredBills: [
    {
      title: "내란전담재판부 설치법",
      status: "passed",
      description:
        "서울중앙지법·서울고등법원에 각 2개 이상 내란전담재판부를 설치하는 법안입니다. 장동혁 국민의힘 대표가 야당 대표 최초로 22시간 이상 역대 최장 필리버스터를 진행했으나, 12월 23일 찬성 175표로 가결되었습니다.",
      proposer: "더불어민주당",
      voteResult: { yes: 175, no: 2, abstain: 2 },
      sources: [
        {
          title:
            "내란재판부법 통과, 찬성 175명 반대 2명 기권 2 - YTN",
          url: "https://www.youtube.com/watch?v=-hAE7jqvFnA",
          type: "youtube",
        },
        {
          title: "내란전담재판부법 여당 주도 본회의 통과 - 서울신문",
          url: "https://www.seoul.co.kr/news/politics/congress/2025/12/23/20251223500114",
          type: "article",
        },
      ],
    },
    {
      title: "정보통신망법 개정안 (허위조작정보근절법)",
      status: "passed",
      description:
        "허위·조작정보 유통 시 최대 5배 징벌적 손해배상, 2회 이상 유통 시 10억 원 이하 과징금을 부과하는 법안입니다. 12월 24일 찬성 170표로 가결되었습니다. 미 국무부가 '검열권 우려'를 표명하며 국제적 논란으로 확대되었습니다.",
      proposer: "더불어민주당",
      voteResult: { yes: 170, no: 3, abstain: 4 },
      sources: [
        {
          title:
            "허위조작정보 5배 징벌 배상 본회의 통과에 野 반발 - MBC",
          url: "https://www.youtube.com/watch?v=ruWtuZlTt2s",
          type: "youtube",
        },
        {
          title: "정통망법 본회의 통과 - 경향신문",
          url: "https://www.khan.co.kr/article/202512241252001",
          type: "article",
        },
      ],
    },
  ],
  highlights: [
    {
      category: "politics",
      title: "장동혁 대표 역대 최장 22시간 필리버스터",
      description:
        "장동혁 국민의힘 대표가 내란전담재판부법 저지를 위해 헌정사상 최초로 야당 대표가 직접 필리버스터에 나서 22시간 이상 발언하며 역대 최장 기록을 세웠습니다.",
    },
    {
      category: "committee",
      title: "12·29 참사 1주기 추모 및 국정조사 착수",
      description:
        "12월 29일 무안공항에서 1,200여 명이 참석한 추모식이 열렸습니다. 국회는 12월 22일 재석 246명 중 찬성 245표로 국정조사 계획서를 채택하고 40일간의 진상규명에 착수했습니다.",
    },
    {
      category: "committee",
      title: "쿠팡 6개 상임위 연석청문회",
      description:
        "12월 30~31일 과방위 등 6개 상임위 합동으로 쿠팡 청문회가 열렸습니다. 김범석 의장이 불출석하고, 해롤드 로저스 임시대표가 동문서답을 반복하며 파행되었습니다. 과방위는 임원 7명을 불출석·위증 혐의로 고발했습니다.",
    },
    {
      category: "politics",
      title: "정통망법 국제 논란 확대",
      description:
        "미국 국무부가 정통망법에 대해 '검열권 우려, 기술협력 위협'이라는 입장을 밝히며 한미 통상 변수로 부상했습니다. 국민의힘은 위헌 소송을 예고했습니다.",
    },
  ],
};

export default article;
