import type { WeeklyArticle } from "./types";

const article: WeeklyArticle = {
  id: "2026-02-w2",
  title: "2월 2주차",
  period: "2026.02.09 ~ 02.13",
  publishedDate: "2026-02-15",
  summary:
    "3일간 대정부질문 진행, 집단소송법 발의, 민주-조국혁신당 합당 무산, 전남광주·대구경북 행정통합 면담",
  tags: ["대정부질문", "집단소송법", "합당 무산", "행정통합", "차별금지법"],
  stats: {
    committeeMeetings: 12,
  },
  featuredBills: [
    {
      title: "집단소송법 (증권 외 전 분야 확대)",
      status: "committee",
      description:
        "소비자·환경·개인정보 등 전 분야에 걸쳐 집단소송을 허용하는 법안으로, 용혜인 의원이 대표발의했습니다. 기존 증권 분야에만 한정되던 집단소송 제도를 대폭 확대하여 소비자 피해 구제를 강화하는 내용입니다.",
      proposer: "용혜인 의원 (기본소득당)",
      sources: [
        {
          title: "용혜인, 전 분야 집단소송법 발의 - 한겨레",
          url: "https://www.hani.co.kr/arti/politics/assembly/1183456.html",
          type: "article",
        },
      ],
    },
    {
      title: "차별금지법",
      status: "committee",
      description:
        "성별, 장애, 나이, 출신, 성적 지향 등을 이유로 한 차별을 금지하는 포괄적 차별금지법안입니다. 2월 11일 국회에서 공청회가 열렸으며, 시민단체와 종교계의 찬반 의견이 팽팽하게 대립했습니다.",
      sources: [
        {
          title: "차별금지법 공청회, 찬반 팽팽 - 경향신문",
          url: "https://www.khan.co.kr/national/national-general/article/202602111530001",
          type: "article",
        },
      ],
    },
    {
      title: "대미투자특별법 (한미전략투자공사 설립)",
      status: "committee",
      description:
        "트럼프 행정부의 관세 압박에 대응하기 위해 2월 임시회 내 처리를 목표로 했으나, 사법개혁 3법을 둘러싼 여야 갈등으로 처리가 지연되었습니다. 대미투자특위에서 법안심사가 계속 진행 중입니다.",
      proposer: "정부 제출",
      sources: [
        {
          title: "대미투자법 2월 처리 불투명 - 연합뉴스",
          url: "https://www.yna.co.kr/view/AKR20260211098500001",
          type: "article",
        },
      ],
    },
  ],
  highlights: [
    {
      category: "politics",
      title: "대정부질문 3일간 진행",
      description:
        "2월 10~12일 3일간 대정부질문이 진행되었습니다. 정치외교·통일·안보(10일), 경제(11일), 교육·사회·문화(12일) 분야별로 여야 의원들이 이재명 정부의 국정 운영 전반에 대해 질의했습니다.",
    },
    {
      category: "politics",
      title: "민주당-조국혁신당 합당 무산",
      description:
        "더불어민주당과 조국혁신당 간 합당 협상이 최종 결렬되었습니다. 비례대표 의석 배분과 당명 문제에서 이견을 좁히지 못했으며, 조국혁신당은 독자 노선을 선언했습니다.",
    },
    {
      category: "politics",
      title: "전남광주·대구경북 행정통합 면담",
      description:
        "김민석 국무총리가 전남-광주, 대구-경북 행정통합에 대해 관련 지자체장들과 면담을 진행했습니다. 전남광주통합은 여야 공감대가 형성되었으나, 대구경북(TK) 통합은 지역 내 이견이 남아 있는 상황입니다.",
    },
    {
      category: "committee",
      title: "사법개혁 3법 법사위 본격 심사",
      description:
        "법왜곡죄·재판소원제·대법관 증원 등 사법개혁 3법에 대한 법사위 심사가 본격화되었습니다. 야당은 사법부 독립 침해를 우려하며 반대 입장을 밝혔습니다.",
    },
  ],
};

export default article;
