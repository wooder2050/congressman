import type { WeeklyArticle } from "./types";

const article: WeeklyArticle = {
  id: "2026-02-w3",
  title: "2월 3주차",
  period: "2026.02.16 ~ 02.20",
  publishedDate: "2026-02-22",
  summary:
    "윤석열 전 대통령 내란 1심 무기징역 선고, 상법 개정안 법사위 소위 통과, 코스피 5600 돌파",
  tags: ["내란 1심", "무기징역", "상법 개정", "코스피 5600", "사법개혁"],
  stats: {
    committeeMeetings: 9,
  },
  featuredBills: [
    {
      title: "2차 상법 개정안 (감사위원 분리선출 확대)",
      status: "committee",
      description:
        "감사위원 분리선출 대상을 자산총액 2조 원 이상 상장사에서 전체 상장사로 확대하는 내용입니다. 2월 20일 법사위 법안심사소위에서 찬성 7, 반대 4로 가결되어 법사위 전체회의 상정이 예고되었습니다.",
      proposer: "더불어민주당",
      sources: [
        {
          title: "'상법 개정안' 법사위 소위 통과, 본회의 향하나 - JTBC",
          url: "https://www.youtube.com/watch?v=example_jtbc_sangbub",
          type: "youtube",
        },
        {
          title: "상법 개정안 법사위 소위 통과 - 한국경제",
          url: "https://www.hankyung.com/economy/article/2026022050001",
          type: "article",
        },
      ],
    },
    {
      title: "사법개혁 3법 (법왜곡죄·재판소원·대법관 증원)",
      status: "committee",
      description:
        "사법개혁 3법에 대한 법사위 심사가 진행되었습니다. 민주당은 2월 말 본회의 처리를 목표로 속도를 내고 있으며, 국민의힘은 필리버스터를 예고하며 강력 반대 입장을 밝혔습니다.",
      proposer: "더불어민주당",
      sources: [
        {
          title: "사법개혁 3법 법사위 심사 본격화 - KBS",
          url: "https://news.kbs.co.kr/news/pc/view/view.do?ncd=8159321",
          type: "article",
        },
      ],
    },
  ],
  highlights: [
    {
      category: "politics",
      title: "윤석열 전 대통령 내란 1심 무기징역 선고",
      description:
        "2월 19일 서울중앙지법은 윤석열 전 대통령에게 내란 혐의로 무기징역을 선고했습니다. 재판부는 비상계엄 선포가 헌정질서 파괴를 목적으로 한 내란에 해당한다고 판단했습니다. 피고인 측은 즉시 항소했습니다.",
    },
    {
      category: "economy",
      title: "코스피 5600 돌파, 사상 최고치 경신",
      description:
        "상법 개정안 통과 기대감과 밸류업 프로그램 효과로 코스피가 5600선을 돌파하며 사상 최고치를 경신했습니다. 외국인 투자자 순매수가 이어지며 한국 증시에 대한 재평가가 진행 중입니다.",
    },
    {
      category: "committee",
      title: "법사위, 상법 개정안 소위 표결",
      description:
        "법사위 법안심사소위에서 2차 상법 개정안(감사위원 분리선출 확대)이 찬성 7, 반대 4로 가결되었습니다. 경제계는 경영권 침해를 우려하고, 시민단체는 지배구조 개선을 환영하며 엇갈린 반응을 보였습니다.",
    },
    {
      category: "politics",
      title: "여야, 2월 임시회 마무리 공방",
      description:
        "2월 임시회 마지막 주를 앞두고 사법개혁 3법과 상법 개정안 처리를 둘러싼 여야 공방이 격화되었습니다. 국민의힘은 필리버스터를 예고하며 저지 의사를 밝혔습니다.",
    },
  ],
  analysis:
    "2월 셋째 주는 윤석열 전 대통령 내란 1심 무기징역 선고라는 헌정사적 사건과 함께, 상법 개정안의 법사위 소위 통과가 겹치며 정치·경제 모두 큰 변동이 있었습니다. 코스피 5600 돌파는 밸류업 정책과 상법 개정에 대한 시장의 기대를 반영하며, 입법이 자본시장에 미치는 영향력을 보여주는 사례입니다. 사법개혁 3법을 둘러싼 여야 대치는 2월 마지막 주 본회의 처리를 앞두고 극한으로 치닫고 있어, 필리버스터를 포함한 치열한 공방이 예상됩니다.",
};

export default article;
