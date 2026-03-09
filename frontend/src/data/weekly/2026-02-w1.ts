import type { WeeklyArticle } from "./types";

const article: WeeklyArticle = {
  id: "2026-02-w1",
  title: "2월 1주차",
  period: "2026.02.02 ~ 02.06",
  publishedDate: "2026-02-08",
  summary:
    "제432회 임시회 개회, 민주당 '입법 고속도로' 선언, 국민의힘 선거연령 16세 하향 제안, 기후특위 공론화위원회 출범",
  tags: ["임시회 개회", "교섭단체 대표연설", "입법 고속도로", "선거연령 16세", "기후특위"],
  stats: {
    committeeMeetings: 10,
  },
  featuredBills: [
    {
      title: "사법개혁 3법 (법왜곡죄·재판소원·대법관 증원)",
      status: "committee",
      description:
        "2월 임시회의 최대 쟁점 법안으로 예고되었습니다. 판검사의 법 왜곡 적용을 처벌하는 법왜곡죄 신설, 확정 판결에 대한 헌법소원을 허용하는 재판소원제 도입, 대법관을 14명에서 26명으로 증원하는 내용입니다. 이 주에 발의·예고되었으며, 2월 하순 본회의에서 연달아 처리되었습니다.",
      proposer: "더불어민주당",
      sources: [
        {
          title: "여당 2월 국회 '개혁 입법' 속도전 - 이투데이",
          url: "https://www.etoday.co.kr/news/view/2554293",
          type: "article",
        },
      ],
    },
    {
      title: "대미투자특별법 (한미전략투자공사 설립)",
      status: "committee",
      description:
        "트럼프 행정부의 관세 압박에 대응하기 위한 법안으로, 2월 임시회 내 처리를 목표로 추진되었습니다. 그러나 사법개혁 3법을 둘러싼 여야 갈등으로 처리가 지연되어 3월 임시회로 이월되었습니다.",
      proposer: "정부 제출",
      sources: [
        {
          title: "민주당 '대미투자법 2월 임시국회 내 처리' - SBS",
          url: "https://news.sbs.co.kr/amp/news.amp?news_id=N1008426205",
          type: "article",
        },
      ],
    },
  ],
  highlights: [
    {
      category: "politics",
      title: "한병도 원내대표 '입법 고속도로' 선언",
      description:
        "더불어민주당 한병도 원내대표가 교섭단체 대표연설에서 '민생개혁 입법 고속도로'를 선언하고, 사법개혁·검찰개혁·자본시장 개혁 입법을 예고했습니다. 5·18 정신의 헌법 전문 수록을 위한 원포인트 개헌도 제안했습니다.",
    },
    {
      category: "politics",
      title: "장동혁 대표 선거연령 16세 하향 제안",
      description:
        "국민의힘 장동혁 대표가 교섭단체 대표연설에서 선거 연령을 16세로 낮추자고 제안하고, 대장동·통일교·공천뇌물 3대 특검 도입을 촉구했습니다. 이재명 대통령에게 영수회담도 요청했습니다.",
    },
    {
      category: "committee",
      title: "기후위기특위 공론화위원회 출범",
      description:
        "국회 기후위기특별위원회 산하 공론화위원회가 2월 3일 공식 출범하여, 장기 온실가스 감축경로에 관한 공론화를 시작했습니다. 우원식 국회의장이 출범식에 참석했습니다.",
    },
    {
      category: "economy",
      title: "다주택자 양도세 중과 유예 종료 확정",
      description:
        "정부가 다주택자 양도세 중과 유예 연장은 없다고 재확인했습니다. 2026년 5월 9일까지 매매계약 완료 시 잔금 지급에 4~6개월 유예가 제공됩니다.",
    },
  ],
};

export default article;
