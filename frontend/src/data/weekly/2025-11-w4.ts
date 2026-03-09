import type { WeeklyArticle } from "./types";

const article: WeeklyArticle = {
  id: "2025-11-w4",
  title: "11월 4주차",
  period: "2025.11.24 ~ 11.28",
  publishedDate: "2025-11-30",
  summary:
    "추경호 체포동의안 가결(찬성 172), 예산 소소위 가동, 대미투자특별법 발의, 비쟁점 법안 54건 처리",
  tags: ["추경호 체포동의안", "예산 소소위", "대미투자특별법", "비쟁점 법안", "정기국회"],
  stats: {
    billsPassed: 54,
    votesHeld: 2,
    committeeMeetings: 10,
  },
  featuredBills: [
    {
      title: "추경호 체포동의안",
      status: "passed",
      description:
        "11월 27일 추경호 전 원내대표에 대한 체포동의안이 재석 180명 중 찬성 172표, 반대 4표, 기권 2표, 무효 2표로 가결되었습니다. 국민의힘 의원 대부분이 표결에 불참했습니다.",
      voteResult: { yes: 172, no: 4, abstain: 2 },
      sources: [
        {
          title: "추경호 체포동의안 국회 본회의 가결 - KBS",
          url: "https://www.youtube.com/watch?v=hoGL5yMl4-M",
          type: "youtube",
        },
        {
          title: "추경호 체포동의안 본회의 가결 - MBC",
          url: "https://imnews.imbc.com/news/2025/politics/article/6779811_36711.html",
          type: "article",
        },
      ],
    },
    {
      title: "대미투자특별법",
      status: "committee",
      description:
        "한미 관세 팩트시트 후속으로 미국 내 한국기업 투자를 지원하는 대미투자특별법이 발의되었습니다. 투자 인센티브, 현지 법인 설립 지원, 인력 파견 제도 등을 담고 있습니다.",
      proposer: "더불어민주당",
      sources: [
        {
          title: "대미투자특별법 발의, 자동차 관세 15% 소급 - SBS",
          url: "https://www.youtube.com/watch?v=kJjIZedHgQ8",
          type: "youtube",
        },
        {
          title: "대미투자특별법 발의 - 이투데이",
          url: "https://www.etoday.co.kr/news/view/2525000",
          type: "article",
        },
      ],
    },
    {
      title: "비쟁점 법안 54건 일괄 처리",
      status: "passed",
      description:
        "11월 27일 본회의에서 여야 합의 비쟁점 법안 54건이 일괄 처리되었습니다. 생활밀착형 법안과 행정 절차 개선 법안이 주를 이루었습니다.",
      sources: [
        {
          title: "여야 비쟁점 법안 91개 처리, 대미투자특별법 뇌관 - 연합뉴스TV",
          url: "https://www.youtube.com/watch?v=EHzj-QOEZCk",
          type: "youtube",
        },
        {
          title: "비쟁점 법안 54건 처리 - 뉴시스",
          url: "https://www.newsis.com/view/NISX20251127_0003420000",
          type: "article",
        },
      ],
    },
  ],
  highlights: [
    {
      category: "vote",
      title: "추경호 체포동의안 가결",
      description:
        "11월 27일 추경호 전 원내대표 체포동의안이 찬성 172표로 가결되었습니다. 국민의힘은 '정치보복'이라며 대부분 표결에 불참했고, 이후 12월 3일 법원에서 구속영장이 기각되었습니다.",
    },
    {
      category: "committee",
      title: "예산 소소위 가동, 세부 조정 착수",
      description:
        "예결위 산하 소소위가 가동되어 728조 원 예산안의 부처별 세부 조정 작업에 돌입했습니다. 12월 2일 법정시한 내 처리를 위해 속도를 높였습니다.",
    },
    {
      category: "economy",
      title: "대미투자특별법 발의",
      description:
        "한미 관세 팩트시트 후속 조치로 미국 내 한국기업 투자 지원을 위한 대미투자특별법이 발의되었습니다. 투자 인센티브와 현지 법인 설립 지원 제도를 포함하고 있습니다.",
    },
    {
      category: "politics",
      title: "정기국회 법안 처리 막바지 돌입",
      description:
        "12월 9일 정기국회 종료를 앞두고 주요 법안 처리를 둘러싼 여야 공방이 가열되었습니다. 국민의힘은 '8대 악법 저지'를 선언하며 필리버스터 카드를 예고했습니다.",
    },
  ],
};

export default article;
