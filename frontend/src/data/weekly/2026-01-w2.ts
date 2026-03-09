import type { WeeklyArticle } from "./types";

const article: WeeklyArticle = {
  id: "2026-01-w2",
  title: "1월 2주차",
  period: "2026.01.12 ~ 01.16",
  publishedDate: "2026-01-18",
  summary:
    "제431회 임시회 개회, 2차 종합특검법 본회의 통과, 장동혁 대표 무기한 단식 돌입, 천하람 18시간 필리버스터",
  tags: ["임시회 개회", "2차 종합특검법", "필리버스터", "단식 농성", "토큰증권법"],
  stats: {
    billsPassed: 13,
    votesHeld: 2,
    committeeMeetings: 8,
  },
  featuredBills: [
    {
      title: "2차 종합특검법",
      status: "passed",
      description:
        "윤석열·김건희에 의한 내란·외환 및 국정농단 17개 의혹을 수사하는 특별검사 임명 법안입니다. 1월 15일 본회의 상정 후 국민의힘·개혁신당이 필리버스터에 돌입했으나, 24시간 만에 종결되어 1월 16일 찬성 172표로 통과되었습니다.",
      proposer: "더불어민주당",
      voteResult: { yes: 172, no: 2, abstain: 0 },
      sources: [
        {
          title: "2차 종합특검법 국회 본회의 통과 - SBS",
          url: "https://www.youtube.com/watch?v=dmjY41gjvG4",
          type: "youtube",
        },
        {
          title:
            "필리버스터 종료, 2차 종합특검법 국회 통과 - 연합뉴스TV",
          url: "https://www.youtube.com/watch?v=DD4tro1-lns",
          type: "youtube",
        },
        {
          title: "2차 종합특검법 본회의 통과 - 이투데이",
          url: "https://www.etoday.co.kr/news/view/2546467",
          type: "article",
        },
      ],
    },
    {
      title: "토큰증권법 (자본시장법·전자증권법 개정안)",
      status: "passed",
      description:
        "블록체인 기반 토큰증권(STO) 발행·유통의 법적 근거를 마련하는 법안으로, 3년간 논의 끝에 1월 15일 본회의에서 통과되었습니다. 공포 후 1년(2027년 1월) 시행 예정이며, 2030년 367조 원 규모 시장이 전망됩니다.",
      sources: [
        {
          title:
            "2차 특검법 오늘 표결, 야당 단식·필리버스터 - SBS",
          url: "https://www.youtube.com/watch?v=D1u5T4gwwCc",
          type: "youtube",
        },
        {
          title: "토큰증권법 국회 본회의 통과 - 서울신문",
          url: "https://www.seoul.co.kr/news/economy/finance/2026/01/15/20260115500181",
          type: "article",
        },
      ],
    },
  ],
  highlights: [
    {
      category: "politics",
      title: "천하람 개혁신당 원내대표 18시간 필리버스터",
      description:
        "2차 종합특검법 반대를 위해 천하람 원내대표가 약 18시간 동안 무제한토론 첫 주자로 나섰습니다. 통일교·공천헌금 특검이 필요하다며 민주당의 강행 처리를 비판했습니다.",
    },
    {
      category: "politics",
      title: "장동혁 국민의힘 대표 무기한 단식 돌입",
      description:
        "장동혁 대표가 1월 15일부터 국회 로텐더홀에서 무기한 단식 농성에 돌입했습니다. 더불어민주당에 통일교 특검과 공천헌금 특검(쌍특검) 수용을 촉구했습니다.",
    },
    {
      category: "committee",
      title: "법사위, 2차 종합특검법 여당 주도 의결",
      description:
        "1월 12일 법사위 안건조정위원회와 전체회의에서 2차 종합특검법이 여당 주도로 의결되었습니다. 국민의힘 소속 위원들은 반발하며 퇴장했습니다.",
    },
    {
      category: "politics",
      title: "국회기록원 공식 출범",
      description:
        "국회기록원법 시행으로 1월 12일 국회기록원이 출범했습니다. 국회 의정활동 기록물의 수집·분류·보존을 전담하는 기관입니다.",
    },
  ],
};

export default article;
