import type { WeeklyArticle } from "./types";

const article: WeeklyArticle = {
  id: "2026-01-w3",
  title: "1월 3주차",
  period: "2026.01.19 ~ 01.23",
  publishedDate: "2026-01-25",
  summary:
    "2차 종합특검법 국무회의 의결, 이혜훈 기획예산처 장관 후보 인사청문회, 12.29 여객기 참사 국정조사 청문회",
  tags: ["종합특검법 의결", "인사청문회", "여객기 참사", "AI기본법 시행", "당명 변경"],
  stats: {
    committeeMeetings: 7,
  },
  featuredBills: [
    {
      title: "2차 종합특검법 국무회의 의결",
      status: "passed",
      description:
        "1월 20일 이재명 대통령이 거부권 행사 없이 2차 종합특검법을 국무회의에서 의결했습니다. 국민의힘과 개혁신당의 거부권 행사 요구에도 불구하고 서명하여, 6·3 지방선거 기간 중 특검 수사가 진행됩니다.",
      sources: [
        {
          title: "종합특검법 국무회의 통과, 지방선거까지 특검 정국 - KBS",
          url: "https://www.youtube.com/watch?v=OYEFU99snI0",
          type: "youtube",
        },
        {
          title: "2차 종합특검법 국무회의 의결 - 서울신문",
          url: "https://www.seoul.co.kr/news/politics/2026/01/20/20260120500149",
          type: "article",
        },
      ],
    },
    {
      title: "인공지능기본법 (1/22 시행)",
      status: "passed",
      description:
        "EU에 이어 세계 두 번째 포괄적 AI 규제 체계인 인공지능기본법이 1월 22일 본격 시행되었습니다. 고영향 AI 사업자 특별 책무, 투명성·안전성 확보 의무, AI 영향평가 제도가 도입됩니다.",
      sources: [
        {
          title: "세계 최초 AI 기본법 오늘부터 전면 시행 - MBC",
          url: "https://www.youtube.com/watch?v=CvoAG_u72i8",
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
      category: "committee",
      title: "이혜훈 기획예산처 장관 후보 인사청문회",
      description:
        "1월 23일 재정경제기획위원회에서 이혜훈 장관 후보자 인사청문회가 열렸습니다. 위장미혼, 특혜입학 등 각종 의혹으로 여야 총공세를 받았으며, 약 15시간 만에 자정을 넘겨 산회했습니다. 이틀 후 지명이 철회되었습니다.",
    },
    {
      category: "committee",
      title: "12.29 여객기 참사 국정조사 청문회",
      description:
        "1월 20일 무안공항 로컬라이저 시설 현장조사에 이어, 22일 국정조사 특위 청문회가 열렸습니다. 시뮬레이션 결과 로컬라이저 규정 준수 시 전원 생존이 가능했다는 보고가 공개되었습니다.",
    },
    {
      category: "politics",
      title: "국민의힘 당명 변경 추진",
      description:
        "장동혁 대표 체제의 국민의힘이 당명 변경을 추진하고 있습니다. '미래연대'와 '미래를 여는 공화당' 2개 후보로 압축되었으며, 3·1절 당명 교체를 목표로 하고 있습니다.",
    },
    {
      category: "politics",
      title: "장동혁 대표 단식 8일차 중단",
      description:
        "1월 15일부터 시작된 장동혁 대표의 무기한 단식이 8일차인 22일 중단되었습니다. 산소포화도가 위험 수치 이하로 하락하여 의료진이 긴급이송을 권고했으며, 박근혜 전 대통령의 설득으로 단식을 종료했습니다.",
    },
  ],
};

export default article;
