import type { WeeklyArticle } from "./types";

const article: WeeklyArticle = {
  id: "2025-11-w1",
  title: "11월 1주차",
  period: "2025.11.03 ~ 11.07",
  publishedDate: "2025-11-09",
  summary:
    "이재명 대통령 첫 시정연설 '728조 AI 시대 예산', 국민의힘 시정연설 전면 보이콧, 추경호 구속영장 청구, 국정감사 마무리",
  tags: ["시정연설", "728조 예산안", "국민의힘 보이콧", "추경호 영장", "국정감사"],
  stats: {
    committeeMeetings: 8,
  },
  featuredBills: [
    {
      title: "2026년도 예산안 (728조 원)",
      status: "committee",
      description:
        "이재명 대통령이 'AI 시대를 여는 첫 예산'이라는 기조로 728조 원 규모의 예산안을 국회에 제출했습니다. AI 투자 10.1조, R&D 역대 최대 35.3조 원이 편성되었으며, 예결위 종합정책질의가 시작되었습니다.",
      proposer: "정부",
      sources: [
        {
          title: "이재명 대통령 시정연설 풀영상 - KBS",
          url: "https://www.youtube.com/watch?v=Ni_apd0lt5c",
          type: "youtube",
        },
        {
          title: "이재명 대통령 시정연설 전문 - 경향신문",
          url: "https://www.khan.co.kr/article/202511041048001",
          type: "article",
        },
      ],
    },
  ],
  highlights: [
    {
      category: "politics",
      title: "이재명 대통령 취임 후 첫 시정연설",
      description:
        "11월 4일 이재명 대통령이 23분간 시정연설을 진행했습니다. 'AI'를 28회, '국민'을 21회 언급하며 AI 3대 강국 도약, 아동수당 확대, 대중교통 정액 패스 도입 등을 제시했습니다.",
    },
    {
      category: "politics",
      title: "국민의힘 시정연설 전면 보이콧",
      description:
        "국민의힘은 추경호 전 원내대표 구속영장 청구에 반발해 시정연설을 전면 보이콧했습니다. 국회 로텐더홀에서 검은 양복 차림으로 침묵시위를 벌이며 '야당탄압 불법특검'을 규탄했습니다.",
    },
    {
      category: "politics",
      title: "특검, 추경호 전 원내대표 구속영장 청구",
      description:
        "11월 3일 조은석 내란특검이 추경호 전 원내대표에 대해 내란중요임무종사 혐의로 구속영장을 청구했습니다. 12·3 비상계엄 당시 소속 의원들의 계엄해제 의결 참여를 방해한 혐의입니다.",
    },
    {
      category: "committee",
      title: "국정감사 마무리 및 예결위 심사 착수",
      description:
        "정보위·성평등가족위·국회운영위의 국정감사가 마무리되었습니다. 성평등가족부 첫 국감에서 부처 역할을 놓고 여야가 격돌했으며, 예결위는 공청회와 종합정책질의를 시작했습니다.",
    },
  ],
};

export default article;
