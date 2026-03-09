import type { WeeklyArticle } from "./types";

const article: WeeklyArticle = {
  id: "2026-01-w4",
  title: "1월 4주차",
  period: "2026.01.26 ~ 01.30",
  publishedDate: "2026-02-01",
  summary:
    "민생법안 91건 본회의 일괄 처리, 반도체 특별법 통과, 제헌절 공휴일 복원, 한동훈 제명 확정, 트럼프 관세 25% 인상 예고",
  tags: ["반도체특별법", "민생법안 91건", "제헌절 공휴일", "한동훈 제명", "트럼프 관세"],
  stats: {
    billsPassed: 91,
    votesHeld: 7,
    committeeMeetings: 5,
  },
  featuredBills: [
    {
      title: "반도체 특별법 (국가첨단전략산업법 개정안)",
      status: "passed",
      description:
        "대통령 소속 '반도체산업경쟁력강화특별위원회' 설치, 특별회계 신설, 비수도권 반도체 클러스터 지원 등을 담은 법안입니다. 1월 29일 재석 206명 중 찬성 199표로 가결되었습니다. R&D 인력 주 52시간 예외 조항은 최종안에서 제외되었습니다.",
      voteResult: { yes: 199, no: 0, abstain: 7 },
      sources: [
        {
          title: "반도체 특별법·국회법 개정안 국회 본회의 통과 - YTN",
          url: "https://www.youtube.com/watch?v=z7u482YQutA",
          type: "youtube",
        },
        {
          title: "반도체특별법 등 91건 본회의 통과 - 서울신문",
          url: "https://www.seoul.co.kr/news/politics/congress/2026/01/30/20260130004002",
          type: "article",
        },
      ],
    },
    {
      title: "제헌절 공휴일 재지정 (공휴일법 개정안)",
      status: "passed",
      description:
        "2008년 이후 18년 만에 7월 17일 제헌절을 공휴일로 복원하는 법안입니다. 5대 국경일 모두 공휴일로 재편됩니다. 재석 203명 중 찬성 198표로 가결되었습니다.",
      voteResult: { yes: 198, no: 2, abstain: 3 },
      sources: [
        {
          title: "제헌절 18년 만에 공휴일로, 올해부터 다시 빨간 날 - SBS",
          url: "https://www.youtube.com/watch?v=1EELgzSjXvM",
          type: "youtube",
        },
        {
          title: "제헌절 공휴일 18년 만에 복원 - 아주경제",
          url: "https://www.ajunews.com/view/20260129152318809",
          type: "article",
        },
      ],
    },
    {
      title: "학교급식법 개정안",
      status: "passed",
      description:
        "급식종사자의 법적 지위를 신설하고, 1인당 적정 식수인원 기준을 마련하며, 일정 규모 이상 학교에 영양교사 2인 이상 배치를 의무화하는 법안입니다. 재석 230명 중 찬성 229표로 사실상 만장일치 가결되었습니다.",
      voteResult: { yes: 229, no: 0, abstain: 1 },
      sources: [
        {
          title: "여야 비쟁점 법안 91개 처리, 대미투자특별법 뇌관 - 연합뉴스TV",
          url: "https://www.youtube.com/watch?v=EHzj-QOEZCk",
          type: "youtube",
        },
        {
          title: "학교급식법 개정안 통과, 급식노동자 눈물 - 경향신문",
          url: "https://www.khan.co.kr/article/202601291616001",
          type: "article",
        },
      ],
    },
    {
      title: "국회법 개정안 (필리버스터 사회권 이양)",
      status: "passed",
      description:
        "필리버스터 진행 시 국회의장 대신 부의장뿐 아니라 상임위원장에게도 사회권을 부여할 수 있도록 하는 법안입니다. 재석 239명 중 찬성 188표로 가결되었습니다.",
      voteResult: { yes: 188, no: 39, abstain: 12 },
      sources: [
        {
          title: "국민의힘, 한동훈 전 대표 제명 최종 확정 - YTN",
          url: "https://www.youtube.com/watch?v=xOz4CIFoeRs",
          type: "youtube",
        },
        {
          title: "국회법 개정안 통과, 필리버스터 사회권 이양 - 뉴스1",
          url: "https://www.news1.kr/politics/assembly/6055216",
          type: "article",
        },
      ],
    },
  ],
  highlights: [
    {
      category: "vote",
      title: "민생법안 91건 본회의 일괄 처리",
      description:
        "이재명 대통령의 '국회가 너무 느리다' 발언 이틀 뒤인 1월 29일, 여야 원내부대표 간 합의를 거쳐 비쟁점 민생법안 91건이 본회의에서 일괄 처리되었습니다.",
    },
    {
      category: "politics",
      title: "한동훈 전 대표 제명 확정",
      description:
        "1월 29일 국민의힘 최고위원회의에서 한동훈 전 대표에 대한 제명 징계안이 최종 확정되었습니다. 향후 5년간 재입당이 불가합니다.",
    },
    {
      category: "economy",
      title: "트럼프 대통령, 한국 관세 25% 인상 예고",
      description:
        "1월 26일 트럼프 대통령이 한국 상호관세를 15%에서 25%로 인상한다고 예고했습니다. '한국 국회가 무역 합의를 입법화하지 않았다'는 것이 이유로, 대미투자특별법 처리 압박이 가중되었습니다.",
    },
    {
      category: "bill",
      title: "변호사-의뢰인 비밀유지권(ACP) 도입",
      description:
        "변호사와 의뢰인 간 법률 자문 목적의 비밀 의사 교환을 보호하는 변호사법 개정안이 재석 234명 중 찬성 201표로 통과되었습니다. 법조계의 오랜 숙원 과제였습니다.",
    },
  ],
};

export default article;
