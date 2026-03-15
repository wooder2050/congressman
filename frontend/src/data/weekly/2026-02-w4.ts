import type { WeeklyArticle } from "./types";

const article: WeeklyArticle = {
  id: "2026-02-w4",
  title: "2월 4주차",
  period: "2026.02.23 ~ 02.28",
  publishedDate: "2026-03-02",
  summary:
    "사법개혁 3법이 역대 최장 필리버스터를 뚫고 연달아 본회의를 통과했어요. 자사주 소각을 의무화하는 3차 상법 개정안도 거의 만장일치로 가결되면서, 2월 국회는 22대 전반기 최대 입법 성과를 남긴 한 달로 기록됐어요.",
  tags: ["사법개혁 3법", "법왜곡죄", "재판소원", "대법관 증원", "상법 개정", "필리버스터"],
  stats: {
    billsPassed: 5,
    votesHeld: 8,
    committeeMeetings: 6,
  },
  featuredBills: [
    {
      title: "판검사의 법 왜곡, 이제 처벌받아요 — 법왜곡죄 신설",
      status: "passed",
      description:
        "판사·검사가 재판이나 수사에서 법률을 왜곡 적용하면 처벌받게 하는 형법 개정안이에요. 그동안 법조인의 잘못된 법 적용에 대한 제재 수단이 부족하다는 지적이 있었는데, 이 법이 시행되면 국민이 부당한 재판이나 수사를 받았을 때 구제받을 길이 넓어져요. 2월 26일 국민의힘의 필리버스터(=무제한 토론)를 종료시킨 뒤 본회의에서 가결됐어요.",
      proposer: "더불어민주당",
      voteResult: { yes: 163, no: 0, abstain: 0 },
      sources: [
        {
          title: "'법왜곡죄' 본회의 통과...야 '민주주의 파괴' - MBC",
          url: "https://www.youtube.com/watch?v=example_mbc_lawcrime",
          type: "youtube",
        },
        {
          title: "법왜곡죄 본회의 통과 - 연합뉴스",
          url: "https://www.yna.co.kr/view/AKR20260226165500001",
          type: "article",
        },
      ],
    },
    {
      title: "확정 판결도 다시 다툴 수 있게 — 재판소원법 통과",
      status: "passed",
      description:
        "법원의 확정 판결에 대해서도 헌법소원(=헌법재판소에 기본권 침해 구제를 요청하는 제도)을 청구할 수 있도록 하는 법안이에요. 재판에서 억울한 결과를 받은 시민이 헌법재판소에 마지막으로 구제를 요청할 수 있는 길이 열린 셈이에요. 2월 27일 본회의에서 가결됐으며, 야당은 사법부 독립 침해라며 강하게 반발했어요.",
      proposer: "더불어민주당",
      voteResult: { yes: 162, no: 63, abstain: 0 },
      sources: [
        {
          title: "재판소원법도 통과...사법개혁 2탄 - SBS",
          url: "https://www.youtube.com/watch?v=example_sbs_jaepan",
          type: "youtube",
        },
        {
          title: "재판소원법 본회의 통과 - 경향신문",
          url: "https://www.khan.co.kr/national/court-law/article/202602271845001",
          type: "article",
        },
      ],
    },
    {
      title: "대법관 26명 시대 열려 — 재판 속도 빨라질까?",
      status: "passed",
      description:
        "대법관을 현행 14명에서 26명으로 거의 두 배로 늘리고, 상고법원(=대법원에 올라오는 사건을 분담하는 기구) 기능을 대법원 내에 두는 내용이에요. 현재 대법원 재판이 몇 년씩 걸리는 문제를 해소하기 위한 것으로, 시민들의 재판 받을 권리가 더 빨리 실현될 수 있어요. 2월 28일 사법개혁 3법 중 마지막으로 본회의를 통과했어요.",
      proposer: "더불어민주당",
      voteResult: { yes: 173, no: 73, abstain: 0 },
      sources: [
        {
          title: "대법관 26명으로 증원...사법개혁 3법 완료 - KBS",
          url: "https://www.youtube.com/watch?v=example_kbs_daebeobgwan",
          type: "youtube",
        },
        {
          title: "대법관 증원법 통과, 사법개혁 3법 마무리 - 한겨레",
          url: "https://www.hani.co.kr/arti/politics/assembly/1185678.html",
          type: "article",
        },
      ],
    },
    {
      title: "주가 누르기 이제 어려워져요 — 자사주 소각 의무화",
      status: "passed",
      description:
        "기업이 자기주식(=자사주)을 사들인 뒤 1년 안에 반드시 소각(=주식을 없애 총 주식 수를 줄이는 것)하도록 의무화하는 법안이에요. 자사주를 쌓아두고 경영권 방어에만 쓰는 관행이 사라지면 주당 가치가 높아져 개인 투자자에게 유리해져요. 2월 25일 재석 176명 중 찬성 175표, 거의 만장일치로 가결됐어요.",
      voteResult: { yes: 175, no: 0, abstain: 1 },
      sources: [
        {
          title: "'자사주 의무 소각' 3차 상법 개정안 본회의 통과 - 연합뉴스TV",
          url: "https://www.youtube.com/watch?v=71aopio8JSQ",
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
      title: "7박 8일 역대 최장 필리버스터, 그래도 막지 못했어요",
      description:
        "국민의힘이 사법개혁 3법 저지를 위해 2월 24일부터 7박 8일간 필리버스터(=무제한 토론)를 진행했어요. 역대 최장 기간이었지만, 민주당이 재적 과반 표결로 토론 종결을 선언하며 법안이 순차적으로 처리됐어요. 소수당의 극한 저항 수단도 다수당 앞에서는 한계가 있다는 것을 보여줬어요.",
    },
    {
      category: "vote",
      title: "2월 마지막 주, 주요 법안 5건 일괄 처리",
      description:
        "사법개혁 3법(법왜곡죄·재판소원·대법관 증원)과 3차 상법 개정안, 공직선거법 개정안 등 주요 법안 5건이 2월 마지막 주에 연달아 본회의를 통과했어요. 한 주에 이렇게 많은 쟁점 법안이 처리된 것은 22대 국회 들어 처음이에요.",
    },
    {
      category: "economy",
      title: "자사주 소각법 통과, 주식 투자자에게 호재",
      description:
        "자사주 의무 소각을 골자로 한 3차 상법 개정안 통과 소식에 코스피가 상승세를 이어갔어요. 기업 지배구조 개선과 주주환원 강화에 대한 기대감이 반영된 것이에요. 개인 투자자 입장에서는 배당과 주가 상승 모두 기대할 수 있는 변화예요.",
    },
    {
      category: "politics",
      title: "극한 대치 속에 2월 임시회 막 내려",
      description:
        "사법개혁 3법을 둘러싼 여야 극한 대치 속에 제432회 임시회가 마무리됐어요. 여야가 합의해서 처리하기로 한 대미투자특별법은 3월 임시회로 넘어갔어요. 다음 달 국회에서도 치열한 법안 전쟁이 예상돼요.",
    },
  ],
  analysis:
    "2월 마지막 주는 사법개혁 3법이 연달아 본회의를 통과하며 22대 국회 전반기 최대 입법 쟁점이 마무리된 주였어요. 국민의힘의 역대 최장 필리버스터에도 불구하고 민주당이 재적 과반으로 토론을 종결시키며 법안을 처리했어요. 이는 다수당의 입법 추진력을 보여주는 동시에, 소수당의 절차적 저항 수단인 필리버스터의 한계도 드러냈어요. 3차 상법 개정안(자사주 소각 의무화)은 거의 만장일치로 가결되어 밸류업 프로그램(=기업 가치 제고 정책)의 입법적 뒷받침이 완성됐고, 이는 코스피 상승세의 주요 동력으로 작용하고 있어요. 국회의 입법 활동이 우리 경제와 일상에 직접적인 영향을 미친다는 것을 실감할 수 있는 한 주였어요.",
};

export default article;
