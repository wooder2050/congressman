import type { WeeklyArticle } from "./types";

const article: WeeklyArticle = {
  id: "2025-11-w3",
  title: "11월 3주차",
  period: "2025.11.17 ~ 11.21",
  publishedDate: "2025-11-23",
  summary:
    "예산소위 가동, 기재위 조세소위 세법개정안 심사, 한미 MOU 후속 입법 논의, 추경호 체포동의안 27일 표결 대기",
  tags: [
    "예산소위",
    "세법개정안",
    "한미 MOU",
    "추경호 표결",
    "상임위 심사",
  ],
  stats: {
    committeeMeetings: 12,
  },
  featuredBills: [
    {
      title: "2026년도 세법개정안 패키지",
      status: "committee",
      description:
        "기재위 조세소위에서 소득세법·법인세법·부가가치세법 등 세법개정안 심사가 진행되었습니다. AI·반도체 R&D 세액공제 확대와 서민 감세 항목을 놓고 여야 간 이견이 나타났습니다.",
      proposer: "정부",
      sources: [
        {
          title: "국회 728조 예산안 증감액 심사 돌입 - YTN",
          url: "https://www.youtube.com/watch?v=VsmDTW7Jsd4",
          type: "youtube",
        },
        {
          title: "기재위 조세소위 세법개정안 심사 착수 - 뉴스1",
          url: "https://www.news1.kr/politics/assembly/5950406",
          type: "article",
        },
      ],
    },
    {
      title: "한미 통상 MOU 후속 입법안",
      status: "committee",
      description:
        "한미 관세 팩트시트에 따른 후속 입법 방안이 산업통상자원위에서 논의되었습니다. 자동차 원산지 규정 완화, 철강 관세 할당 확대 등 이행법안 마련이 과제로 떠올랐습니다.",
      sources: [
        {
          title:
            "산업장관 '적절한 시일 내 대미투자 MOU, 이달 내 입법' - KBS",
          url: "https://www.youtube.com/watch?v=QWxEw4necB0",
          type: "youtube",
        },
        {
          title: "한미 관세 후속 입법 논의 - 아주경제",
          url: "https://www.ajunews.com/view/20251118142500000",
          type: "article",
        },
      ],
    },
  ],
  highlights: [
    {
      category: "committee",
      title: "예산소위 가동, 728조 예산안 세부 심사",
      description:
        "11월 17일부터 예결위 예산소위가 가동되어 728조 원 예산안의 세부 항목별 심사에 돌입했습니다. AI 투자 10.1조 원 배분과 복지 예산 증감을 놓고 집중 논의가 이루어졌습니다.",
    },
    {
      category: "committee",
      title: "기재위 조세소위 세법개정안 심사",
      description:
        "소득세법, 법인세법 등 세법개정안 심사가 기재위 조세소위에서 진행되었습니다. 반도체·AI R&D 세액공제 확대와 서민 감세 항목이 핵심 쟁점이었습니다.",
    },
    {
      category: "politics",
      title: "추경호 체포동의안 27일 표결 대기",
      description:
        "추경호 전 원내대표 체포동의안 표결이 11월 27일로 예정되면서, 여야 간 공방이 격화되었습니다. 국민의힘은 '정치보복'이라며 반발하고, 민주당은 '사법 절차의 정상화'라고 맞섰습니다.",
    },
    {
      category: "economy",
      title: "한미 MOU 후속 입법 논의 시작",
      description:
        "산업통상자원위에서 한미 관세 팩트시트에 따른 후속 입법 방안이 논의되었습니다. 자동차 원산지 규정, 철강 관세 할당 확대 등 이행 방안 마련이 과제입니다.",
    },
  ],
};

export default article;
