import type { WeeklyArticle } from "./types";

const article: WeeklyArticle = {
  id: "2025-12-w2",
  title: "12월 2주차",
  period: "2025.12.08 ~ 12.14",
  publishedDate: "2025-12-14",
  summary:
    "정기국회 마지막 날 국민의힘이 전면 필리버스터(=무제한 토론)를 걸어 59건 법안이 무산됐어요. 61년 만에 의장이 마이크를 차단하는 초유의 사태가 벌어졌고, 그 와중에 가맹사업법과 은행법 등 민생 법안은 통과됐어요.",
  tags: ["전면 필리버스터", "마이크 차단", "가맹사업법", "형사소송법", "연금특위 연장"],
  stats: {
    billsPassed: 4,
    votesHeld: 5,
    committeeMeetings: 8,
  },
  featuredBills: [
    {
      title: "프랜차이즈 가맹점주, 이제 목소리 낼 수 있어요",
      status: "passed",
      description:
        "그동안 프랜차이즈 가맹점주들은 본사의 일방적인 정책 변경에 개별적으로 대응할 수밖에 없었어요. 이번 가맹사업거래 공정화법 개정안은 가맹점사업자단체 등록제를 도입하고, 본부와의 협의를 의무화해서 가맹점주들이 단체로 목소리를 낼 수 있게 됐어요. 우원식 의장은 '소상공인들의 눈물을 닦아줄 법안'이라고 평가했어요. 편의점, 치킨집 등 프랜차이즈 점주라면 주목할 변화예요.",
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
      title: "재판 결과, 확정 전에도 볼 수 있게 됐어요",
      status: "passed",
      description:
        "그동안 형사사건 판결문(=법원이 유·무죄와 그 이유를 적은 문서)은 대법원에서 확정된 뒤에만 열람할 수 있어서, 진행 중인 재판의 투명성에 한계가 있었어요. 이번 형사소송법 개정안은 1심·2심 판결문도 열람·복사할 수 있도록 확대하고, 부다페스트 협약(=사이버범죄 관련 국제조약) 가입을 위한 전자증거 보전요청 제도도 도입했어요. 사법 투명성이 높아져서 국민이 재판 과정을 더 가까이 지켜볼 수 있게 돼요.",
      voteResult: { yes: 160, no: 0, abstain: 0 },
      sources: [
        {
          title: "여야 정기국회 마지막날도 극한 대치, 필리버스터 충돌 - KBS",
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
      title: "대출받을 때 몰래 붙던 수수료, 이제 금지돼요",
      status: "passed",
      description:
        "은행들이 예금자보호 보험료나 상호금융 출연금 같은 비용을 슬쩍 대출 가산금리(=기준금리에 더하는 추가 이자)에 얹어왔다는 지적이 있었어요. 이번 은행법 개정안은 이런 비용을 대출금리에 전가하는 것을 명확히 금지했어요. 대출을 받고 있는 분이라면 금리가 조금이나마 낮아질 수 있는 변화예요.",
      voteResult: { yes: 170, no: 1, abstain: 0 },
      sources: [
        {
          title: "마이크 또 꺼지자 나경원에 '쓱', 우원식 민주당 반응 - JTBC",
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
        "12월 9일 국민의힘이 비쟁점 법안 59건 전부에 필리버스터(=무제한 토론)를 신청하면서, 반도체특별법 등 모든 법안 처리가 무산됐어요. 정기국회 종료 시각(자정)과 함께 필리버스터가 자동 종결됐는데, 여야 대치가 계속되면 법안 처리 공백이 길어질 수 있어요.",
    },
    {
      category: "politics",
      title: "우원식 의장, 나경원 의원 마이크 차단 — 61년 만",
      description:
        "나경원 의원이 필리버스터 중 의제와 무관한 발언을 하자, 우원식 의장이 마이크를 차단했어요. 1964년 김대중 의원 필리버스터 이후 61년 만의 전례로, 국회 운영 관행에 큰 파장을 일으켰어요. 여야 간 격렬한 충돌이 이어졌어요.",
    },
    {
      category: "vote",
      title: "연금개혁특별위원회 활동 1년 연장",
      description:
        "12월 11일 재석 250명 중 찬성 249표로 연금개혁특위(=국민연금 개혁을 논의하는 국회 특별위원회) 활동기한이 2026년 12월 31일까지 1년 연장됐어요. 국민연금 고갈 시기가 다가오는 만큼, 구조개혁(=보험료율, 수급 연령 등 제도의 뼈대를 바꾸는 것) 등 추가 논의를 위한 조치예요.",
    },
    {
      category: "economy",
      title: "은행법 통과로 대출 가산금리 규제 강화",
      description:
        "은행이 보험료·출연금을 대출금리에 몰래 전가하는 관행을 금지하는 은행법 개정안이 통과됐어요. 대출이 있는 분들은 이자 부담이 줄어들 수 있어요. 금융당국이 구체적인 시행 시기와 기준을 정할 예정이에요.",
    },
  ],
};

export default article;
