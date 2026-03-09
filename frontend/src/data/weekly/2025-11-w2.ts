import type { WeeklyArticle } from "./types";

const article: WeeklyArticle = {
  id: "2025-11-w2",
  title: "11월 2주차",
  period: "2025.11.10 ~ 11.14",
  publishedDate: "2025-11-16",
  summary:
    "본회의 비쟁점 법안 53건 일괄 처리, 국민의힘 집단 퇴장, 추경호 체포동의안 본회의 보고, 한미 관세 팩트시트 발표",
  tags: [
    "비쟁점 법안 53건",
    "국민의힘 퇴장",
    "추경호 체포동의안",
    "한미 관세",
    "예산 심사",
  ],
  stats: {
    billsPassed: 53,
    votesHeld: 1,
    committeeMeetings: 10,
  },
  featuredBills: [
    {
      title: "비쟁점 법안 53건 일괄 처리",
      status: "passed",
      description:
        "11월 13일 본회의에서 비쟁점 법안 53건이 일괄 처리되었습니다. 국민의힘은 여당 단독 처리를 규탄하며 집단 퇴장했습니다.",
      sources: [
        {
          title:
            "비쟁점법안 50여건 본회의 처리, 추경호 체포동의안 보고 - MBC",
          url: "https://www.youtube.com/watch?v=kFh0MPYIos0",
          type: "youtube",
        },
        {
          title: "본회의 53건 처리, 국민의힘 집단 퇴장 - 뉴시스",
          url: "https://www.newsis.com/view/NISX20251113_0003401615",
          type: "article",
        },
      ],
    },
    {
      title: "추경호 체포동의안",
      status: "pending",
      description:
        "정부가 제출한 추경호 전 원내대표 체포동의안이 11월 13일 본회의에 보고되었습니다. 헌법 규정에 따라 보고 후 24시간~72시간 내 표결해야 하며, 11월 27일 표결이 예정되었습니다.",
      sources: [
        {
          title: "추경호 체포동의안 본회의 보고 생중계 - KBS",
          url: "https://www.youtube.com/watch?v=WfA7NnhpzHg",
          type: "youtube",
        },
        {
          title: "추경호 체포동의안 본회의 보고, 27일 표결 - 뉴시스",
          url: "https://www.newsis.com/view/NISX20251113_0003401615",
          type: "article",
        },
      ],
    },
  ],
  highlights: [
    {
      category: "vote",
      title: "본회의 비쟁점 법안 53건 처리",
      description:
        "11월 13일 본회의에서 여야 합의가 이뤄진 비쟁점 법안 53건이 일괄 처리되었습니다. 국민의힘은 야당 의견 무시를 이유로 전원 퇴장했습니다.",
    },
    {
      category: "politics",
      title: "추경호 체포동의안 본회의 보고",
      description:
        "내란특검이 청구한 추경호 전 원내대표 구속영장에 대한 체포동의안이 본회의에 보고되었습니다. 국회법에 따라 11월 27일 표결이 예정되었습니다.",
    },
    {
      category: "economy",
      title: "한미 관세 팩트시트 발표",
      description:
        "11월 12일 한미 양국이 관세 협상 결과를 담은 팩트시트를 동시 발표했습니다. 한국산 자동차·철강 관세 인하 조건 등이 포함되어 국회 통상 논의에 영향을 미쳤습니다.",
    },
    {
      category: "committee",
      title: "728조 예산안 부별심사 본격화",
      description:
        "예결위에서 경제부처(11/10~11)와 비경제부처(11/12~13) 부별심사가 진행되었습니다. 각 부처 장관이 출석해 소관 예산에 대한 질의·답변이 이루어졌습니다.",
    },
  ],
};

export default article;
