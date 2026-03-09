import type { WeeklyArticle } from "./types";

const article: WeeklyArticle = {
  id: "2025-12-w2",
  title: "12월 2주차",
  period: "2025.12.08 ~ 12.14",
  publishedDate: "2025-12-14",
  summary:
    "정기국회 마지막 날 전면 필리버스터로 59건 법안 무산, 의장 마이크 차단 61년 만에 재현, 가맹사업법·형사소송법 통과",
  tags: [
    "전면 필리버스터",
    "마이크 차단",
    "가맹사업법",
    "형사소송법",
    "연금특위 연장",
  ],
  stats: {
    billsPassed: 4,
    votesHeld: 5,
    committeeMeetings: 8,
  },
  featuredBills: [
    {
      title: "가맹사업거래 공정화법 개정안",
      status: "passed",
      description:
        "가맹점사업자단체 등록제를 도입하고, 가맹본부와의 협의를 의무화하는 법안입니다. 12월 11일 재석 241명 중 찬성 238표로 여야 합의 가결되었습니다. 우원식 의장은 '소상공인들의 눈물을 닦아줄 법안'이라고 평가했습니다.",
      voteResult: { yes: 238, no: 0, abstain: 3 },
      sources: [
        {
          title: "가맹사업법 개정안 통과, 국민의힘 필리버스터 돌입 - SBS",
          url: "https://www.youtube.com/watch?v=rB7WSwBTX8c",
          type: "youtube",
        },
        {
          title: "가맹사업법 개정안 국회 본회의 통과 - 아주경제",
          url: "https://www.ajunews.com/view/20251211171110208",
          type: "article",
        },
      ],
    },
    {
      title: "형사소송법 개정안 (하급심 판결문 공개 확대)",
      status: "passed",
      description:
        "확정되지 않은 형사 사건의 1심·2심 판결문도 열람·복사할 수 있도록 확대하고, 부다페스트 협약 가입을 위한 전자증거 보전요청 제도를 도입하는 법안입니다. 12월 12일 재석 160명 만장일치로 가결되었습니다.",
      voteResult: { yes: 160, no: 0, abstain: 0 },
      sources: [
        {
          title:
            "여야 정기국회 마지막날도 극한 대치, 필리버스터 충돌 - KBS",
          url: "https://www.youtube.com/watch?v=T02zKblzM3g",
          type: "youtube",
        },
        {
          title: "하급심 판결문 공개확대법 본회의 통과 - 아주경제",
          url: "https://www.ajunews.com/view/20251212145025777",
          type: "article",
        },
      ],
    },
    {
      title: "은행법 개정안 (가산금리 규제)",
      status: "passed",
      description:
        "은행이 예금자보호법상 보험료, 상호금융업권 출연금 등을 대출 가산금리에 반영하는 것을 금지하여 소비자 금융비용을 낮추는 법안입니다. 12월 13일 재석 171명 중 찬성 170표로 가결되었습니다.",
      voteResult: { yes: 170, no: 1, abstain: 0 },
      sources: [
        {
          title:
            "마이크 또 꺼지자 나경원에 '쓱', 우원식 민주당 반응 - JTBC",
          url: "https://www.youtube.com/watch?v=tGMMeXtYY6M",
          type: "youtube",
        },
        {
          title: "은행법 개정안 표결 - 아주경제",
          url: "https://www.ajunews.com/view/20251213061200060",
          type: "article",
        },
      ],
    },
  ],
  highlights: [
    {
      category: "politics",
      title: "정기국회 마지막 날 전면 필리버스터, 59건 법안 무산",
      description:
        "12월 9일 국민의힘이 비쟁점 법안 59건 전부에 필리버스터를 신청하며, 반도체특별법 등 모든 법안 처리가 무산되었습니다. 정기국회 종료(자정)와 함께 필리버스터가 자동 종결되었습니다.",
    },
    {
      category: "politics",
      title: "우원식 의장, 나경원 의원 마이크 차단 — 61년 만",
      description:
        "나경원 의원이 필리버스터 중 의제와 무관한 발언을 하자, 우원식 의장이 마이크를 차단했습니다. 1964년 김대중 의원 필리버스터 이후 61년 만의 전례로, 여야 간 격렬한 충돌이 발생했습니다.",
    },
    {
      category: "vote",
      title: "연금개혁특별위원회 활동 1년 연장",
      description:
        "12월 11일 재석 250명 중 찬성 249표로 연금개혁특위 활동기한이 2026년 12월 31일까지 1년 연장되었습니다. 구조개혁 등 추가 논의를 위한 조치입니다.",
    },
    {
      category: "economy",
      title: "은행법 통과로 대출 가산금리 규제 강화",
      description:
        "은행의 보험료·출연금을 대출금리에 전가하는 관행을 금지하는 은행법 개정안이 통과되었습니다. 소비자 금융비용 인하 효과가 기대됩니다.",
    },
  ],
};

export default article;
