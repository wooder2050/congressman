import type { WeeklyArticle } from "./types";

const article: WeeklyArticle = {
  id: "2026-01-w1",
  title: "1월 1주차",
  period: "2026.01.05 ~ 01.09",
  publishedDate: "2026-01-11",
  summary:
    "비회기 기간, 이재명 대통령 중국 국빈방문, 장동혁 국민의힘 대표 비상계엄 공식 사과, 코스피 4500 돌파",
  tags: ["중국 국빈방문", "비상계엄 사과", "코스피 4500", "AI 토론회"],
  stats: {
    committeeMeetings: 1,
  },
  featuredBills: [
    {
      title: "토큰증권법 (자본시장법·전자증권법 개정안)",
      status: "committee",
      description:
        "블록체인 기반 토큰증권(STO) 발행·유통의 법적 근거를 마련하는 법안으로, 3년간 논의 끝에 1월 15일 본회의 통과를 앞두고 있습니다. 2030년 367조 원 시장 규모가 전망됩니다.",
      sources: [
        {
          title: "한중 정상회담 이재명 대통령 - MBC",
          url: "https://www.youtube.com/watch?v=EbeTKcE_OxA",
          type: "youtube",
        },
        {
          title: "토큰증권법 국회 본회의 통과 - 서울신문",
          url: "https://www.seoul.co.kr/news/economy/finance/2026/01/15/20260115500181",
          type: "article",
        },
      ],
    },
    {
      title: "인공지능기본법 개정안",
      status: "passed",
      description:
        "EU에 이어 세계 두 번째 포괄적 AI 규제 체계로, 2025년 12월 30일 본회의를 통과하여 1월 22일 시행을 앞두고 있습니다. 국가AI전략위 격상, AI연구소 설립 근거, 공공데이터 학습용 제공 등을 담고 있습니다.",
      sources: [
        {
          title: "코스피 사상 첫 4500 돌파 - 채널A",
          url: "https://www.youtube.com/watch?v=lolrDbhgjnw",
          type: "youtube",
        },
        {
          title: "인공지능기본법 개정안 국회 본회의 통과 - 법률신문",
          url: "https://www.lawtimes.co.kr/LawFirm-NewsLetter/214819",
          type: "article",
        },
      ],
    },
  ],
  highlights: [
    {
      category: "politics",
      title: "이재명 대통령 중국 국빈방문 (1/4~7)",
      description:
        "9년 만의 대통령 방중 국빈방문으로, 시진핑 주석과 정상회담을 갖고 14건의 MOU를 체결했습니다. 한한령 점진적 해제에 합의했으나, 북한 비핵화 등 외교안보 현안에서는 진전이 없었습니다.",
    },
    {
      category: "politics",
      title: "장동혁 국민의힘 대표 비상계엄 공식 사과",
      description:
        "장동혁 대표가 1월 7일 기자회견에서 '12.3 비상계엄은 잘못된 수단이었다'며 공식 사과했습니다. 청년 의무공천제, 공천비리신고센터, 당명 변경 등 3대 쇄신안을 발표했으나, 윤석열 전 대통령과의 절연 언급은 없었습니다.",
    },
    {
      category: "economy",
      title: "코스피 사상 첫 4500선 돌파",
      description:
        "1월 6일 코스피가 67.96포인트(1.52%) 상승하며 4525.48로 마감, 사상 최초로 4500선을 돌파했습니다. 반도체주 반등이 견인했으며, 증권가는 연간 목표치를 5200까지 상향했습니다.",
    },
    {
      category: "committee",
      title: "12.3 비상계엄 해제 유공 2차 특별포상",
      description:
        "우원식 국회의장이 1월 6일 비상계엄 해제 유공자 440여 명에게 특별포상을 수여했습니다. '여러분들이 국회를 지켜주었기에 비상계엄을 해제할 수 있었다'고 밝혔습니다.",
    },
  ],
};

export default article;
