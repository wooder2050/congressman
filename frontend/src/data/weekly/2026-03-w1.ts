import type { WeeklyArticle } from "./types";

const article: WeeklyArticle = {
  id: "2026-03-w1",
  title: "3월 1주차",
  period: "2026.03.02 ~ 03.07",
  publishedDate: "2026-03-09",
  summary:
    "미국 관세에 대응하는 대미투자특별법이 여야 만장일치로 특위를 통과했어요. 40년 넘게 논의됐던 전남광주 행정통합이 드디어 법적 근거를 얻었고, 아동수당이 만 13세까지 확대되면서 더 많은 가정이 혜택을 받게 됐어요.",
  tags: ["대미투자특별법", "전남광주통합", "아동수당", "상법개정", "필리버스터"],
  stats: {
    billsPassed: 4,
    votesHeld: 6,
    committeeMeetings: 8,
  },
  featuredBills: [
    {
      title: "관세 전쟁에 국회가 답했어요 — 대미투자특별법 특위 통과",
      status: "committee",
      description:
        "미국의 추가 관세 인상 위협이 커지면서, 한미전략투자공사를 세워 3,500억 달러 규모의 대미 투자 양해각서(=정부 간 투자 약속)를 이행하기 위한 법안이에요. 수출 기업들의 관세 부담을 줄이고 한미 경제 관계를 안정시키려는 목적이에요. 3월 4~5일 대미투자특위에서 여야 만장일치로 통과했으며, 3월 12일 본회의 처리가 합의됐어요. 여야가 손잡고 통과시킨 만큼, 국민 경제를 위한 초당적 협력의 좋은 사례예요.",
      proposer: "정부 제출",
      sources: [
        {
          title: "특위 통과한 '대미투자특별법' - MBC뉴스",
          url: "https://www.youtube.com/watch?v=5eonzmQJhA8",
          type: "youtube",
        },
        {
          title: "대미투자특별법, 여야 만장일치 통과 - SBS",
          url: "https://www.youtube.com/watch?v=s7jemRDHMfA",
          type: "youtube",
        },
        {
          title: "국회 대미특위, 대미투자특별법 만장일치 통과 - MBC",
          url: "https://imnews.imbc.com/news/2026/politics/article/6805965_36911.html",
          type: "article",
        },
      ],
    },
    {
      title: "40년 숙원이 드디어 — 전남광주 하나 되는 법 통과",
      status: "passed",
      description:
        "전남과 광주를 하나의 행정구역으로 합치는 법적 근거를 마련한 법안이에요. 40년 넘게 논의만 되던 행정통합이 마침내 법으로 결실을 맺었어요. 통합특별시 설치를 위한 절차, 주민투표, 행정체계 전환 방안 등이 담겨 있어요. 해당 지역 주민들의 행정 서비스와 생활 편의에 직접적인 변화가 생길 수 있어요. 3월 1일 본회의에서 재석 175명 중 찬성 159표로 가결됐어요.",
      voteResult: { yes: 159, no: 2, abstain: 14 },
      sources: [
        {
          title: "40년 만의 통합...전남광주특별시, 기대와 우려는? - KBS",
          url: "https://www.youtube.com/watch?v=SUmFU6O_DFY",
          type: "youtube",
        },
        {
          title: "전남광주 통합 특별법 국회 통과 - 광주MBC",
          url: "https://www.youtube.com/watch?v=GXgGWu8aMfA",
          type: "youtube",
        },
        {
          title: "전남·광주 행정통합 40년 만에 본회의 통과 - 머니투데이",
          url: "https://www.mt.co.kr/politics/2026/03/01/2026030120481754627",
          type: "article",
        },
      ],
    },
    {
      title: "아동수당, 초등학생까지 받아요 — 아동수당법 개정안",
      status: "passed",
      description:
        "아동수당 지급 대상을 2030년까지 만 13세 미만으로 단계적으로 넓히는 법안이에요. 현재 만 8세까지만 받을 수 있는 아동수당을 초등학생 전체로 확대하는 것이에요. 인구감소지역(=젊은 인구가 줄어드는 지역)에 대한 추가 지급과 2026년 1월분 소급 적용(=과거 시점부터 적용)도 포함돼 있어요. 자녀를 키우는 가정의 경제적 부담을 줄이는 데 직접적인 도움이 되는 법안이에요.",
      voteResult: { yes: 173, no: 0, abstain: 2 },
      sources: [
        {
          title: "아이가 2017년생인데, 아동수당 못 받나요? - KBS",
          url: "https://www.youtube.com/watch?v=akHsqylIBwc",
          type: "youtube",
        },
        {
          title: "만 12세까지 월 10만 원 아동수당 받는다 - MBN",
          url: "https://www.youtube.com/watch?v=tlzXz_SqaUM",
          type: "youtube",
        },
      ],
    },
    {
      title: "자사주 쌓아두기 이제 안 돼요 — 3차 상법 개정안",
      status: "passed",
      description:
        "기업이 자기주식(=자사주)을 사들인 뒤 1년 안에 반드시 소각(=주식을 없애는 것)하고, 보유·처분할 때는 주주총회 승인을 받도록 의무화하는 법안이에요. 밸류업 프로그램(=기업 가치 제고 정책)의 일환으로, 대주주의 자사주 활용을 통한 경영권 방어를 막고 소액주주의 이익을 보호하려는 취지예요. 2월 25일 재석 176명 중 찬성 175표로 가결됐어요.",
      voteResult: { yes: 175, no: 0, abstain: 1 },
      sources: [
        {
          title: "'자사주 의무 소각' 3차 상법 개정안 본회의 통과 - 연합뉴스TV",
          url: "https://www.youtube.com/watch?v=71aopio8JSQ",
          type: "youtube",
        },
        {
          title: "'자사주 소각법'까지 통과...주가 누르기 멈춰 - MBC",
          url: "https://www.youtube.com/watch?v=FT8yduukk94",
          type: "youtube",
        },
        {
          title: "3차 상법 개정안 본회의 통과 - 조세일보",
          url: "http://www.joseilbo.com/news/htmls/2026/02/20260225563520.html",
          type: "article",
        },
      ],
    },
  ],
  highlights: [
    {
      category: "politics",
      title: "5박 6일 필리버스터, 결국 종료",
      description:
        "2월 24일부터 시작된 국민의힘의 필리버스터(=무제한 토론)가 3월 1일 종료됐어요. TK통합법(대구-경북 행정통합법) 처리를 둘러싼 여야 갈등이 배경이었지만, TK통합법은 결국 이번 주 처리되지 못했어요. 지역 간 형평성 문제가 남아 있어 향후 논의가 계속될 전망이에요.",
    },
    {
      category: "economy",
      title: "이란 사태에 환율 급등, 국회도 비상",
      description:
        "미국-이스라엘의 이란 공습으로 원/달러 환율이 급등하면서 국회에서도 경제 비상대응 논의가 이어졌어요. 대미투자특별법 심사 과정에서도 환율 급등에 따른 투자 재원 문제가 쟁점이 됐어요. 환율이 오르면 수입 물가가 올라 생활비에 직접 영향을 미치기 때문에 관심을 가질 필요가 있어요.",
    },
    {
      category: "committee",
      title: "대미투자특위, 이틀간 집중 심사로 여야 합의 이끌어내",
      description:
        "3월 4~5일 이틀간 대미투자특별위원회에서 전체회의와 소위원회가 연이어 열리며 대미투자특별법을 집중 심사했어요. 여야가 만장일치로 통과시키며 초당적 합의를 이끌어냈어요. 대립이 잦은 국회에서 보기 드문 협력 사례예요.",
    },
    {
      category: "bill",
      title: "지방자치법 개정안도 함께 가결",
      description:
        "전남광주 통합특별시 설치 근거와 부시장 정수(=인원수) 4명 규정을 포함한 지방자치법 개정안이 재석 173명 중 찬성 165표로 본회의를 통과했어요. 행정통합 후 지역 운영 체계의 법적 기반이 마련됐어요.",
    },
    {
      category: "politics",
      title: "6월 지방선거 앞두고 입법 경쟁 본격화",
      description:
        "2026년 6월 지방선거를 앞두고 반도체, 노동, 재정 등 쟁점 법안에서 여야 정면 충돌이 예고되고 있어요. 각 정당이 선거를 의식한 입법 경쟁에 나서면서, 시민 생활에 영향을 미칠 법안들이 쏟아질 것으로 보여요.",
    },
  ],
  analysis:
    "3월 첫째 주는 대미투자특별법이 여야 만장일치로 특위를 통과하며 초당적 합의의 가능성을 보여준 한 주였어요. 미국의 관세 압력에 대한 국회 차원의 대응이 빠르게 이루어진 것은 이례적이에요. 전남광주 행정통합특별법의 가결은 40년 넘게 논의되어 온 지역 현안이 입법으로 결실을 맺은 사례로, 지방행정 개편의 새로운 장을 열었어요. 아동수당 확대는 저출생 시대에 자녀를 키우는 가정에 실질적인 도움이 되는 법안이에요. 6월 지방선거를 앞두고 반도체·노동·재정 등 쟁점 법안에서 여야 충돌이 예고되고 있어서, 3월 이후 입법 경쟁이 더욱 치열해질 전망이에요.",
};

export default article;
