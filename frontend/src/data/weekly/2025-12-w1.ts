import type { WeeklyArticle } from "./types";

const article: WeeklyArticle = {
  id: "2025-12-w1",
  title: "12월 1주차",
  period: "2025.12.01 ~ 12.05",
  publishedDate: "2025-12-07",
  summary:
    "2026년도 예산안 727.9조 원 법정시한 내 통과, 12·3 비상계엄 1주년 '국민주권의 날' 지정, 담배사업법 개정안 통과",
  tags: ["예산안 통과", "비상계엄 1주년", "담배사업법", "사기죄 강화"],
  stats: {
    billsPassed: 95,
    votesHeld: 3,
    committeeMeetings: 6,
  },
  featuredBills: [
    {
      title: "2026년도 예산안 (727조 9,000억 원)",
      status: "passed",
      description:
        "이재명 정부 첫 예산안이 12월 2일 법정시한 내에 통과되었습니다. 2021년 이후 5년 만에 기한을 준수한 것으로, 용인 반도체 클러스터 지원(+500억), 서민 금융 금리 인하 등이 포함되었습니다.",
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
      title: "담배사업법 개정안 (합성니코틴 규제)",
      status: "passed",
      description:
        "합성니코틴 액상형 전자담배를 법적 '담배'로 규정하여 광고 제한, 온라인 판매 규제, 경고문구 의무화를 적용하는 법안입니다. 연간 약 9,300억 원 추가 세수가 전망됩니다.",
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
      title: "형법 개정안 (사기죄 형량 강화)",
      status: "passed",
      description:
        "사기죄 법정형을 10년 이하 징역에서 20년 이하 징역으로, 벌금을 2,000만 원에서 5,000만 원으로 상향하는 법안입니다. 경합범 최고 형량도 30년까지 올랐습니다.",
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
        "이재명 정부 첫 예산안 727.9조 원이 12월 2일 재석 262명 중 찬성 248표로 통과되었습니다. 5년 만에 법정시한을 준수했으며, 예산안 외 비쟁점 법안 95건도 함께 처리되었습니다.",
    },
    {
      category: "politics",
      title: "12·3 비상계엄 1주년, '국민주권의 날' 지정",
      description:
        "이재명 대통령이 12월 3일 특별성명을 발표하고, 12월 3일을 '국민주권의 날'로 지정했습니다. 국회에서는 비상계엄 해제 과정 사진전과 다크투어가 진행되었습니다.",
    },
    {
      category: "committee",
      title: "기획재정위원회 국유재산법 등 22건 의결",
      description:
        "12월 4일 기재위 전체회의에서 국유재산 처분 시 국회 보고 의무화, 조달사업 불공정행위 직권조사 근거 신설 등 22건의 법안이 의결되었습니다.",
    },
    {
      category: "politics",
      title: "국민의힘, 정기국회 마지막 날 필리버스터 예고",
      description:
        "국민의힘 송언석 원내대표가 12월 9일 본회의 상정 법안 전체에 필리버스터를 예고했습니다. '8대 악법 포기 전까지 모든 수단으로 저지하겠다'고 선언했습니다.",
    },
  ],
};

export default article;
