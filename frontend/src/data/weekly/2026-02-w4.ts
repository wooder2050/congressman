import type { WeeklyArticle } from "./types";

const article: WeeklyArticle = {
  id: "2026-02-w4",
  title: "2월 4주차",
  period: "2026.02.23 ~ 02.28",
  publishedDate: "2026-03-02",
  summary:
    "사법개혁 3법 본회의 연달아 통과, 3차 상법 개정안 가결, 국민의힘 7박 8일 필리버스터",
  tags: [
    "사법개혁 3법",
    "법왜곡죄",
    "재판소원",
    "대법관 증원",
    "상법 개정",
    "필리버스터",
  ],
  stats: {
    billsPassed: 5,
    votesHeld: 8,
    committeeMeetings: 6,
  },
  featuredBills: [
    {
      title: "법왜곡죄 신설 (형법 개정안)",
      status: "passed",
      description:
        "판사·검사가 재판이나 수사에서 법률을 왜곡 적용하는 행위를 처벌하는 법왜곡죄를 신설하는 형법 개정안입니다. 2월 26일 국민의힘의 필리버스터를 종료시킨 뒤 본회의에서 가결되었습니다.",
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
      title: "재판소원법 (헌법재판소법 개정안)",
      status: "passed",
      description:
        "확정 판결에 대해 헌법소원을 청구할 수 있도록 하는 재판소원제를 도입하는 법안입니다. 2월 27일 본회의에서 가결되었으며, 야당은 사법부 독립 침해라며 강하게 반발했습니다.",
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
      title: "대법관 증원법 (법원조직법 개정안)",
      status: "passed",
      description:
        "대법관을 현행 14명에서 26명으로 증원하고, 상고법원 기능을 대법원 내에 두는 내용입니다. 2월 28일 본회의에서 가결되었으며, 사법개혁 3법 중 마지막으로 처리되었습니다.",
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
      title: "3차 상법 개정안 (자사주 소각 의무화)",
      status: "passed",
      description:
        "기업이 자기주식을 취득한 후 1년 이내에 소각하도록 의무화하고, 보유·처분 시 주주총회 승인을 받도록 하는 내용입니다. 2월 25일 재석 176명 중 찬성 175표로 가결되었습니다.",
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
      title: "국민의힘 7박 8일 필리버스터",
      description:
        "국민의힘이 사법개혁 3법 저지를 위해 2월 24일부터 7박 8일간 무제한토론(필리버스터)을 진행했습니다. 역대 최장 기간 필리버스터였으나, 민주당이 재적 과반 표결로 토론 종결을 선언하며 법안이 순차 처리되었습니다.",
    },
    {
      category: "vote",
      title: "2월 마지막 주 법안 5건 일괄 처리",
      description:
        "사법개혁 3법(법왜곡죄·재판소원·대법관 증원)과 3차 상법 개정안, 공직선거법 개정안 등 주요 법안 5건이 2월 마지막 주에 연달아 본회의를 통과했습니다.",
    },
    {
      category: "economy",
      title: "자사주 소각법 통과에 증시 호재",
      description:
        "자사주 의무 소각을 골자로 한 3차 상법 개정안 통과 소식에 코스피가 상승세를 이어갔습니다. 기업 지배구조 개선과 주주환원 강화에 대한 기대감이 반영되었습니다.",
    },
    {
      category: "politics",
      title: "여야 극한 대치 속 2월 임시회 종료",
      description:
        "사법개혁 3법을 둘러싼 여야 극한 대치 속에 제432회 임시회가 마무리되었습니다. 대미투자특별법은 합의 처리를 위해 3월 임시회로 이월되었습니다.",
    },
  ],
};

export default article;
