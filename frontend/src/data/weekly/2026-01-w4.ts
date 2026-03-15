import type { WeeklyArticle } from "./types";

const article: WeeklyArticle = {
  id: "2026-01-w4",
  title: "1월 4주차",
  period: "2026.01.26 ~ 01.30",
  publishedDate: "2026-02-01",
  summary:
    "국회가 정말 바빴던 한 주예요. 민생법안 91건이 한꺼번에 본회의를 통과했고, 반도체 특별법과 제헌절 공휴일 복원까지 굵직한 법안이 줄줄이 처리됐어요. 한동훈 전 대표 제명이 확정되고, 트럼프 관세 인상 예고로 경제 불확실성도 커졌어요.",
  tags: ["반도체특별법", "민생법안 91건", "제헌절 공휴일", "한동훈 제명", "트럼프 관세"],
  stats: {
    billsPassed: 91,
    votesHeld: 7,
    committeeMeetings: 5,
  },
  featuredBills: [
    {
      title: "반도체 산업에 국가가 올인해요 — 반도체 특별법",
      status: "passed",
      description:
        "미국·중국·일본 등 주요국이 반도체 패권 경쟁을 벌이는 가운데, 우리나라도 본격적으로 국가 차원의 지원 체계를 갖추게 됐어요. 대통령 소속 '반도체산업경쟁력강화특별위원회' 설치, 특별회계(=특정 목적에만 쓰는 별도 예산) 신설, 비수도권 반도체 클러스터(=기업·연구소가 모인 산업단지) 지원 등을 담고 있어요. 1월 29일 재석 206명 중 찬성 199표로 가결됐어요. 반도체는 수출의 핵심이자 일자리와 직결되는 산업이라, 지역 경제에도 큰 영향을 미칠 전망이에요.",
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
      title: "7월 17일, 18년 만에 다시 빨간 날! — 제헌절 공휴일 복원",
      status: "passed",
      description:
        "2008년 이후 18년 만에 7월 17일 제헌절이 공휴일로 복원돼요. 이로써 5대 국경일(3·1절, 제헌절, 광복절, 개천절, 한글날) 모두 공휴일로 재편돼요. 재석 203명 중 찬성 198표로 가결됐어요. 직장인과 학생 모두에게 반가운 소식이에요. 올해부터 바로 적용되니 7월 여행 계획을 세워봐도 좋겠어요.",
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
      title: "우리 아이 급식, 더 안전해져요 — 학교급식법 개정안",
      status: "passed",
      description:
        "급식종사자의 법적 지위를 신설하고, 1인당 적정 식수인원 기준을 마련하며, 일정 규모 이상 학교에 영양교사 2인 이상 배치를 의무화하는 법안이에요. 재석 230명 중 찬성 229표로 사실상 만장일치 가결됐어요. 학부모 입장에서는 아이들의 급식 질이 높아지고, 급식 현장의 인력 부족 문제도 개선될 것으로 기대돼요.",
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
      title: "소수당도 목소리 낼 수 있도록 — 국회법 개정안(필리버스터 사회권 이양)",
      status: "passed",
      description:
        "필리버스터(=무제한 토론) 진행 시 국회의장 대신 부의장뿐 아니라 상임위원장에게도 사회권(=회의를 진행하는 권한)을 부여할 수 있도록 하는 법안이에요. 재석 239명 중 찬성 188표로 가결됐어요. 국회 운영의 유연성이 높아지지만, 야당에서는 다수당이 필리버스터를 무력화하려는 의도가 아니냐는 우려도 나왔어요.",
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
      title: "하루 만에 91건 처리, 국회가 속도를 냈어요 — 민생법안 일괄 통과",
      description:
        "이재명 대통령의 '국회가 너무 느리다' 발언 이틀 뒤인 1월 29일, 여야 원내부대표(=원내대표를 보좌하며 실무 협상을 담당하는 의원) 간 합의를 거쳐 비쟁점 민생법안 91건이 본회의에서 일괄 처리됐어요. 오랫동안 계류돼 있던 법안들이 한꺼번에 통과된 건 시민들에게 반가운 일이지만, 충분한 심의가 이뤄졌는지에 대한 지적도 있어요.",
    },
    {
      category: "politics",
      title: "5년간 재입당 불가 — 한동훈 전 대표 제명 확정",
      description:
        "1월 29일 국민의힘 최고위원회의에서 한동훈 전 대표에 대한 제명 징계안이 최종 확정됐어요. 향후 5년간 재입당이 불가해요. 한 전 대표의 정치 생명에 큰 타격이며, 국민의힘 내부 노선 갈등이 어떻게 정리될지 주목돼요.",
    },
    {
      category: "economy",
      title: "수출 기업 비상 — 트럼프 대통령, 한국 관세 25% 인상 예고",
      description:
        "1월 26일 트럼프 대통령이 한국 상호관세(=상대국에 부과하는 맞대응 관세)를 15%에서 25%로 인상한다고 예고했어요. '한국 국회가 무역 합의를 입법화하지 않았다'는 것이 이유로, 대미투자특별법 처리 압박이 가중됐어요. 관세가 오르면 수출 기업의 가격 경쟁력이 떨어지고, 결국 소비자 물가에도 영향을 줄 수 있어요.",
    },
    {
      category: "bill",
      title: "변호사와 나눈 이야기, 이제 법적으로 보호돼요 — 비밀유지권(ACP) 도입",
      description:
        "변호사와 의뢰인 간 법률 자문 목적의 비밀 의사 교환을 보호하는 변호사법 개정안이 재석 234명 중 찬성 201표로 통과됐어요. ACP(Attorney-Client Privilege, =변호사-의뢰인 비밀유지 특권)는 법조계의 오랜 숙원 과제였어요. 일반 시민도 변호사 상담 시 솔직하게 이야기할 수 있는 법적 보장이 생긴 거예요.",
    },
  ],
};

export default article;
