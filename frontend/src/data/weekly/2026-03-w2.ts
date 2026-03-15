import type { WeeklyArticle } from "./types";

const article: WeeklyArticle = {
  id: "2026-03-w2",
  title: "3월 2주차",
  period: "2026.03.09 ~ 03.13",
  publishedDate: "2026-03-15",
  summary:
    "대미투자특별법 본회의 가결, 임금체불 처벌 강화 근로기준법 통과, 가습기살균제 국가 책임 명문화, 법안 52건 일괄 처리",
  tags: ["대미투자특별법", "근로기준법", "임금체불", "가습기살균제", "보이스피싱"],
  stats: {
    billsPassed: 52,
    votesHeld: 52,
    committeeMeetings: 27,
  },
  featuredBills: [
    {
      title: "대미투자특별법 (한미전략투자공사 설립)",
      status: "passed",
      description:
        "3,500억 달러 규모 대미 투자 이행을 위해 자본금 2조 원의 한미전략투자공사를 설립하는 법안입니다. 대미투자특위를 거쳐 3월 12일 본회의에서 재석 242명 중 찬성 226표로 여야 합의 가결되었습니다. 미국의 관세 인상 위협에 대한 국회 차원의 신속한 대응으로 평가받고 있습니다.",
      proposer: "정부 제출",
      voteResult: { yes: 226, no: 8, abstain: 8 },
      sources: [
        {
          title: '대미투자특별법 국회 통과…"3,500억 달러 규모 투자" - SBS 뉴스',
          url: "https://www.youtube.com/watch?v=gjFrxgnNXYM",
          type: "youtube",
        },
        {
          title: "'대미투자특별법' 여야 합의로 국회 본회의 통과 - MBC 5시뉴스",
          url: "https://www.youtube.com/watch?v=5uPElfrYETQ",
          type: "youtube",
        },
        {
          title: "여야 정쟁 뚫은 '대미투자특별법', 국회 본회의 통과 - 매일신문",
          url: "https://www.imaeil.com/page/view/2026031215140247581",
          type: "article",
        },
      ],
    },
    {
      title: "근로기준법 개정안 (임금체불 처벌 강화)",
      status: "passed",
      description:
        "임금체불 사업주에 대한 처벌을 현행 3년 이하 징역에서 5년 이하 징역, 벌금도 3천만 원에서 5천만 원으로 상향하는 법안입니다. 73년 만에 '근로감독관' 명칭을 '노동감독관'으로 변경하는 노동감독관 직무집행법도 함께 통과되었습니다.",
      voteResult: { yes: 177, no: 1, abstain: 1 },
      sources: [
        {
          title: "'임금체불' 고통…\"사전 대책·처벌 강화 절실\" - KBS 뉴스",
          url: "https://www.youtube.com/watch?v=HqnMCl7Das4",
          type: "youtube",
        },
        {
          title: "임금 체불 시 '5년 이하 징역'...근로기준법 개정안 국회 본회의 통과 - 서울경제",
          url: "https://www.sedaily.com/article/20018624",
          type: "article",
        },
      ],
    },
    {
      title: "가습기살균제 피해구제 특별법 전부개정안",
      status: "passed",
      description:
        "가습기살균제 사건을 '참사'로 규정하고 국가 책임을 명문화한 법안입니다. 기존 피해구제위원회를 국무총리 소속 배상심의위원회로 개편하는 내용을 담고 있습니다.",
      voteResult: { yes: 179, no: 0, abstain: 2 },
      sources: [
        {
          title: "가습기살균제피해구제법 개정안 통과…국가 책임 명문화 - CBC뉴스",
          url: "https://www.cbci.co.kr/news/articleView.html?idxno=560621",
          type: "article",
        },
        {
          title: "정부, 가습기살균제 사건 '참사'로 규정…국가 주도 배상체계로 전환 - 정책브리핑",
          url: "https://www.korea.kr/news/policyNewsView.do?newsId=148957088",
          type: "article",
        },
      ],
    },
    {
      title: "전기통신금융사기 피해방지법 개정안 (보이스피싱 대응 강화)",
      status: "passed",
      description:
        "가상자산거래소에 금융회사와 동일한 수준의 보이스피싱 방지 의무를 부과하는 법안입니다. 최근 가상자산을 이용한 보이스피싱 범죄가 급증함에 따라, 피해자 자산 보호와 환급 체계를 강화했습니다.",
      voteResult: { yes: 210, no: 0, abstain: 6 },
      sources: [
        {
          title:
            "보이스피싱 의심계좌 실시간 정보 공유…통신사기피해환급법 개정안 국회 통과 - 데일리안",
          url: "https://www.dailian.co.kr/news/view/1598846",
          type: "article",
        },
        {
          title:
            "가상자산 악용 보이스피싱까지 대응…통신사기피해환급법 개정안 국회 통과 - 정책브리핑",
          url: "https://www.korea.kr/briefing/pressReleaseView.do?newsId=156748788",
          type: "article",
        },
      ],
    },
  ],
  highlights: [
    {
      category: "vote",
      title: "3월 12일 본회의 법안 52건 일괄 처리",
      description:
        "3월 12일 본회의에서 대미투자특별법을 포함해 총 52건의 법안이 일괄 처리되었습니다. 대부분 여야 합의로 가결되었으며, 22대 국회 단일 본회의 처리 건수로는 최대 규모입니다.",
    },
    {
      category: "bill",
      title: "감염병예방법 개정안 통과",
      description:
        "감염병관리위원회 심의 사항에 예방접종 실시 대상·시기·주의사항을 추가하고, 소독업자 사망 시 상속인에 대한 지위 승계를 허용하는 감염병예방법 개정안이 통과되었습니다.",
    },
    {
      category: "bill",
      title: "응급의료법 개정 — 지역 간 격차 해소",
      description:
        "모든 국민이 거주지역을 이유로 차별받지 않고 응급의료를 받을 권리를 명시하는 응급의료법 개정안이 본회의를 통과했습니다.",
    },
    {
      category: "economy",
      title: "중동 사태에 따른 경제 불안 지속",
      description:
        "미국-이스라엘의 이란 공습 여파로 국제 유가가 급등하고 원/달러 환율 변동성이 확대되면서, 국회에서도 경제 비상대응 논의가 이어졌습니다. 대미투자특별법 처리 과정에서도 환율 급등에 따른 투자 재원 문제가 쟁점이 되었습니다.",
    },
    {
      category: "committee",
      title: "12·29 여객기참사 특별법 개정안 가결",
      description:
        "12·29 여객기참사 피해구제 특별법 개정안이 재석 171명 중 찬성 167표로 본회의를 통과했습니다. 피해자 및 유가족에 대한 지원 범위를 확대하는 내용을 담고 있습니다.",
    },
  ],
  analysis:
    "3월 2주차는 단일 본회의에서 52건의 법안이 일괄 처리되며 22대 국회의 입법 생산성이 절정에 달한 주였습니다. 특히 대미투자특별법이 찬성 226표로 여야 합의 가결된 것은 통상 위기 속에서 초당적 대응이 가능함을 다시 한번 보여주었습니다. 근로기준법 개정으로 임금체불 처벌이 대폭 강화되고, 가습기살균제 국가 책임이 법제화되는 등 민생·안전 분야에서도 의미 있는 진전이 이루어졌습니다. 한편 중동 사태로 인한 경제 불안이 지속되면서, 앞으로 국회의 경제 대응 입법이 더욱 중요해질 전망입니다.",
};

export default article;
