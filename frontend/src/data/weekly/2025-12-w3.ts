import type { WeeklyArticle } from "./types";

const article: WeeklyArticle = {
  id: "2025-12-w3",
  title: "12월 3주차",
  period: "2025.12.15 ~ 12.19",
  publishedDate: "2025-12-21",
  summary:
    "정통망법·내란전담재판부법 본회의 처리 임박, 상임위 집중 심사, 이재명 대통령 부처 업무보고 생중계",
  tags: [
    "정통망법",
    "내란전담재판부",
    "상임위 심사",
    "부처 업무보고",
    "12.29 참사",
  ],
  stats: {
    committeeMeetings: 15,
  },
  featuredBills: [
    {
      title: "정보통신망법 개정안 (허위조작정보근절법)",
      status: "committee",
      description:
        "허위·조작정보 유통 시 최대 5배 징벌적 손해배상과 10억 원 이하 과징금을 부과하는 법안입니다. 12월 16일 과방위, 18일 법사위 체계·자구심사를 거쳐 본회의 상정을 앞두고 있습니다. 위헌성 지적에 따라 민주당이 막판 수정안을 발의했습니다.",
      proposer: "더불어민주당",
      sources: [
        {
          title:
            "최대 5배 손배 정보통신망법, 법사위 통과 - KBS",
          url: "https://www.youtube.com/watch?v=AJSYrIZtHTw",
          type: "youtube",
        },
        {
          title: "정통망법 막판 수정, 상정 날짜 변경 - 중앙일보",
          url: "https://www.koreadaily.com/article/20251221014846135",
          type: "article",
        },
      ],
    },
    {
      title: "내란전담재판부 설치법",
      status: "committee",
      description:
        "서울중앙지법과 서울고등법원에 각각 2개 이상 내란전담재판부를 설치하고, 영장전담판사를 2명 이상 배치하는 법안입니다. 법사위 심사를 마치고 12월 22일 본회의 상정이 예정되어 있습니다.",
      proposer: "더불어민주당",
      sources: [
        {
          title:
            "내란전담재판부, 법왜곡죄 법안 법사위 소위 통과 - KBS",
          url: "https://www.youtube.com/watch?v=gLvJxq0faDk",
          type: "youtube",
        },
        {
          title: "내란전담재판부법 상정 예고 - 이투데이",
          url: "https://www.etoday.co.kr/news/view/2538570",
          type: "article",
        },
      ],
    },
  ],
  highlights: [
    {
      category: "committee",
      title: "상임위 15건 집중 심사",
      description:
        "12월 3주차에 과방위, 법사위, 행안위, 국토위, 농해수위, 문체위, 기후에너지환경노동위 등 전체회의와 소위가 집중적으로 열려 정통망법, 내란전담재판부법 등의 심사가 진행되었습니다.",
    },
    {
      category: "politics",
      title: "이재명 대통령 부처 업무보고 역대 최초 생중계",
      description:
        "12월 16~19일 각 정부부처 업무보고가 진행되었습니다. 외교부, 통일부, 금융위, 공정위, 법무부, 성평등가족부 등이 보고했으며, 역대 최초로 전 과정이 생중계되었습니다.",
    },
    {
      category: "politics",
      title: "국민의힘, 사법개혁 법안 '5대 악법' 규정",
      description:
        "국민의힘은 내란전담재판부법, 정통망법, 법왜곡죄, 대법관 증원, 4심제 도입을 '사법 파괴 5대 악법'으로 규정하고, 전면 저지를 예고했습니다.",
    },
    {
      category: "committee",
      title: "12.29 여객기 참사 특위 소위 활동",
      description:
        "12월 16일과 18일 12.29 여객기 참사 국정조사특별위원회 소위원회가 열려 피해자유가족지원 방안을 논의했습니다.",
    },
  ],
};

export default article;
