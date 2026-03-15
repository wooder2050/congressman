import type { WeeklyArticle } from "./types";

const article: WeeklyArticle = {
  id: "2025-12-w1",
  title: "12월 1주차",
  period: "2025.12.01 ~ 12.05",
  publishedDate: "2025-12-07",
  summary:
    "727.9조 원 예산안이 5년 만에 법정시한 내 통과됐어요. 12·3 비상계엄 1주년을 맞아 '국민주권의 날'이 지정됐고, 전자담배 규제와 사기죄 형량 강화 법안도 함께 처리됐어요.",
  tags: ["예산안 통과", "비상계엄 1주년", "담배사업법", "사기죄 강화"],
  stats: {
    billsPassed: 95,
    votesHeld: 3,
    committeeMeetings: 6,
  },
  featuredBills: [
    {
      title: "내년 나라 살림 727.9조, 5년 만에 제때 통과",
      status: "passed",
      description:
        "매년 12월 2일까지 통과해야 하는 예산안(=정부가 내년에 쓸 돈 계획)이 최근 5년간 계속 늦어졌는데, 이번에는 법정시한을 딱 맞춰 통과됐어요. 이재명 정부 첫 예산안으로, 용인 반도체 클러스터 지원에 500억 원이 추가되고 서민 금융 금리 인하 방안도 포함됐어요. 예산안이 제때 통과되면 정부 사업이 1월부터 바로 집행돼서, 경기 회복과 일자리 창출에 속도가 붙을 수 있어요.",
      voteResult: { yes: 248, no: 8, abstain: 6 },
      sources: [
        {
          title: "727.9조 내년도 예산안 국회 본회의 통과, 5년 만에 법정시한 준수 - YTN",
          url: "https://www.youtube.com/watch?v=d5wkfufq6qE",
          type: "youtube",
        },
        {
          title: "728조 규모 2026년 예산 국회 통과 - 정책브리핑",
          url: "https://www.korea.kr/news/policyNewsView.do?newsId=148955773",
          type: "article",
        },
      ],
    },
    {
      title: "액상 전자담배, 이제 진짜 '담배'로 규제돼요",
      status: "passed",
      description:
        "그동안 합성니코틴(=자연에서 추출하지 않고 인공으로 만든 니코틴)으로 만든 액상형 전자담배는 법적으로 '담배'가 아니어서 세금도, 광고 규제도 없었어요. 이번 개정안은 이런 제품도 담배로 분류해서 광고 제한, 온라인 판매 규제, 경고문구 의무화를 적용하도록 했어요. 연간 약 9,300억 원의 추가 세수가 예상되고, 청소년 흡연 접근을 줄이는 효과도 기대돼요.",
      voteResult: { yes: 247, no: 0, abstain: 3 },
      sources: [
        {
          title: "액상형 전자담배도 과세에 규제, 바뀌는 담배 정의 - YTN",
          url: "https://www.youtube.com/watch?v=IrNF9pdydhc",
          type: "youtube",
        },
        {
          title: "액상형 전자담배도 규제, 담배사업법 개정안 통과 - MBC",
          url: "https://imnews.imbc.com/news/2025/politics/article/6781290_36711.html",
          type: "article",
        },
      ],
    },
    {
      title: "사기치면 최대 20년, 형량 두 배로 올랐어요",
      status: "passed",
      description:
        "보이스피싱, 투자 사기 등 사기 범죄가 급증하면서 처벌이 너무 약하다는 비판이 계속됐어요. 이번 형법 개정으로 사기죄 최고 형량이 10년에서 20년으로, 벌금은 2,000만 원에서 5,000만 원으로 올랐고, 경합범(=여러 건의 범죄를 동시에 저지른 경우) 최고 형량도 30년까지 높아졌어요. 피해 사례가 늘어난 만큼, 더 강한 처벌로 억제력을 높이겠다는 취지예요.",
      sources: [
        {
          title: "사기 범죄 형량 대폭 강화, 최대 무기징역 권고 - 연합뉴스TV",
          url: "https://www.youtube.com/watch?v=WQ2-qm29OsQ",
          type: "youtube",
        },
        {
          title: "예산안·담배사업법·형법 개정안 등 통과 - 아주경제",
          url: "https://www.ajunews.com/view/20251202233918599",
          type: "article",
        },
      ],
    },
  ],
  highlights: [
    {
      category: "vote",
      title: "2026년 예산안 법정시한 내 통과",
      description:
        "이재명 정부 첫 예산안 727.9조 원이 12월 2일 재석 262명 중 찬성 248표로 통과됐어요. 5년 만에 법정시한(=법에서 정한 처리 기한)을 지킨 건데, 덕분에 내년 정부 사업이 연초부터 차질 없이 시작될 수 있어요. 예산안 외 비쟁점 법안 95건도 함께 처리됐어요.",
    },
    {
      category: "politics",
      title: "12·3 비상계엄 1주년, '국민주권의 날' 지정",
      description:
        "이재명 대통령이 12월 3일 특별성명을 발표하고, 이날을 '국민주권의 날'로 지정했어요. 1년 전 비상계엄(=대통령이 국가 비상사태를 선포해 군사적 통제를 하는 조치) 사태를 시민의 힘으로 막아낸 것을 기념하는 날이에요. 국회에서는 비상계엄 해제 과정 사진전과 다크투어(=역사적 비극의 현장을 방문하는 여행)가 진행됐어요.",
    },
    {
      category: "committee",
      title: "기획재정위원회 국유재산법 등 22건 의결",
      description:
        "12월 4일 기재위(=기획재정위원회) 전체회의에서 국유재산 처분 시 국회 보고 의무화, 조달사업 불공정행위 직권조사(=신고 없이도 정부가 직접 조사하는 것) 근거 신설 등 22건의 법안이 의결됐어요. 국민 세금으로 운영되는 국유재산의 투명성이 한층 높아질 전망이에요.",
    },
    {
      category: "politics",
      title: "국민의힘, 정기국회 마지막 날 필리버스터 예고",
      description:
        "국민의힘 송언석 원내대표가 12월 9일 본회의 상정 법안 전체에 필리버스터(=무제한 토론, 법안 처리를 지연시키기 위한 합법적 방법)를 예고했어요. '8대 악법 포기 전까지 모든 수단으로 저지하겠다'고 선언한 건데, 이대로라면 남은 법안 처리가 모두 막힐 수 있어요.",
    },
  ],
};

export default article;
