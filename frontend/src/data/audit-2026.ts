/**
 * 2026년 국정감사 — /issues/audit-2026 편집 데이터.
 *
 * 원칙:
 * - 상임위별 일정은 해당 위원회가 채택한 국정감사계획서를 보도한 2026년 9월 기사로 확인한 것만 적는다.
 *   확인되지 않은 위원회는 status "pending"으로 두고 날짜를 추측해 채우지 않는다.
 *   (검색 결과에 과거 연도 기사가 섞여 나온다 — 교육위 "10월 8~24일"은 2024년 기사였다.)
 * - 쟁점은 발언자·주체를 밝혀 인용하고, 여야 입장을 함께 적는다.
 * - 갱신: 국감 기간 중 계획서가 추가로 확정되면 committees를, 주요 공방이 생기면 issues를 고치고
 *   updatedAt을 바꾼다. 실제 회의 일정은 daily sync가 채우는 일정 데이터에서 자동으로 보여 준다.
 */

export interface AuditSource {
  title: string;
  url: string;
}

interface AuditDay {
  /** "10-06" 또는 "10-11~10-22"처럼 표시용 날짜 */
  date: string;
  target: string;
}

export interface AuditCommittee {
  /** /committees/[name] 경로와 같은 정식 명칭 */
  name: string;
  short: string;
  status: "confirmed" | "pending";
  /** 위원회 감사 기간(표시용) */
  period?: string;
  /** 대상 기관 규모 등 한 줄 요약 */
  scope?: string;
  days: AuditDay[];
  /** 증인·참고인 등 보충 메모 */
  note?: string;
  sources: AuditSource[];
}

interface AuditIssue {
  title: string;
  committees: string[];
  body: string;
  /** 발언·입장 인용 — 주체를 밝힌다 */
  quotes?: { who: string; text: string }[];
  sources: AuditSource[];
}

export const AUDIT_2026 = {
  slug: "audit-2026",
  path: "/issues/audit-2026",
  title: "2026 국정감사 일정 — 상임위별 감사 기간·피감기관·주요 쟁점",
  description:
    "2026년 국정감사는 10월 6일부터 27일까지 3주간 열립니다(정보위·성평등가족위는 30일까지). 상임위원회별 감사 일정과 피감기관, 증인 채택 공방과 주요 쟁점을 한곳에 정리했습니다.",
  publishedAt: "2026-09-24",
  updatedAt: "2026-09-24",
  start: "2026-10-06",
  end: "2026-10-27",
  extendedEnd: "2026-10-30",
  extendedCommittees: ["정보위원회", "성평등가족위원회"],
  agreedOn: "2026-08-25",
  periodSources: [
    {
      title: "다음 달 1일 정기국회 개회...10월 6일부터 국정감사 / YTN",
      url: "https://www.ytn.co.kr/_ln/0101_202608251819207042",
    },
  ] as AuditSource[],

  committees: [
    {
      name: "법제사법위원회",
      short: "법사위",
      status: "confirmed",
      period: "10월 6일~27일(22일)",
      scope: "82개 기관",
      days: [
        { date: "10-06", target: "대법원(조희대 대법원장 기관증인)" },
        { date: "10-13", target: "헌법재판소(김상환 헌법재판소장 기관증인)" },
      ],
      note: "9월 21일 계획서 의결. 일반증인 채택은 미정.",
      sources: [
        {
          title: '법사위, 조희대 국감 기관증인 의결…국힘 "결단코 반대" 불참 / 뉴스웍스',
          url: "https://www.newsworks.co.kr/news/articleView.html?idxno=854480",
        },
      ],
    },
    {
      name: "재정경제기획위원회",
      short: "재경위",
      status: "confirmed",
      period: "10월 6일~23일(18일)",
      days: [
        { date: "10-06", target: "재정경제부" },
        { date: "10-13", target: "국세청 본청·서울·중부·인천지방국세청(세종)" },
        { date: "10-15", target: "관세청(대전)" },
        { date: "10-16", target: "부산·대전·대구·광주지방국세청" },
        { date: "10-22", target: "종합감사(재정경제부·국세청·관세청 등)" },
      ],
      sources: [
        {
          title: "2026년 국세청 국정감사 10월 13일…종합감사 22일 / 일간NTN",
          url: "https://www.intn.co.kr/news/articleView.html?idxno=2053315",
        },
      ],
    },
    {
      name: "과학기술정보방송통신위원회",
      short: "과방위",
      status: "confirmed",
      period: "10월 6일~23일(18일)",
      scope: "87개 기관",
      days: [
        { date: "10-06", target: "과학기술정보통신부·우정사업본부·국립중앙과학관" },
        { date: "10-12", target: "방송미디어통신위원회·방송미디어통신사무소" },
        { date: "10-13", target: "원자력안전위원회·우주항공청" },
        { date: "10-15", target: "ICT 공공기관(정보통신산업진흥원·한국인터넷진흥원 등)" },
        { date: "10-16", target: "MBC 업무현황, KBS·EBS·방송문화진흥회 등" },
        { date: "10-20", target: "국가과학기술연구회 등 과학기술 공공기관" },
        { date: "10-22~10-23", target: "종합감사" },
      ],
      note: "증인 29명·참고인 13명 — 통신 3사 해킹, 티빙 해킹, AI 챗봇 위험, 구글·애플 앱마켓 등.",
      sources: [
        {
          title: "과방위, 국정감사 일정 확정…10월6일 과기정통부·12일 방미통위 / 블로터",
          url: "https://www.bloter.net/news/articleView.html?idxno=673651",
        },
        {
          title: "과방위 국정감사 '개인정보·플랫폼·AI' 정조준 / 머니투데이방송",
          url: "https://news.mtn.co.kr/news-detail/2026092213341522467",
        },
      ],
    },
    {
      name: "외교통일위원회",
      short: "외통위",
      status: "confirmed",
      period: "10월 6일~27일(22일)",
      days: [
        { date: "10-06", target: "외교부·재외동포청" },
        { date: "10-07", target: "통일부·민주평화통일자문회의사무처" },
        { date: "10-11~10-22", target: "재외공관 현장감사(37개 공관, 미주·구주·아주 3개 반)" },
        { date: "10-27", target: "종합감사" },
      ],
      sources: [
        {
          title: "국회 외통위, 소위원장 선출·국감계획 확정 / 한국철도일보",
          url: "https://www.korearailroad.kr/news/articleView.html?idxno=196613",
        },
      ],
    },
    {
      name: "행정안전위원회",
      short: "행안위",
      status: "confirmed",
      period: "10월 6일~26일(21일)",
      scope: "국가기관 7곳·지방자치단체 8곳",
      days: [{ date: "10-22", target: "제주특별자치도·제주경찰청(지방2반)" }],
      note: "2개 반으로 나눠 진행.",
      sources: [
        {
          title: "국회 행안위, 제주도·제주경찰청 국정감사 내달 22일 실시 / 헤드라인제주",
          url: "https://www.headlinejeju.co.kr/news/articleView.html?idxno=599198",
        },
      ],
    },
    {
      name: "농림축산식품해양수산위원회",
      short: "농해수위",
      status: "confirmed",
      period: "10월 7일 시작",
      days: [{ date: "10-07", target: "농림축산식품부" }],
      note: "9월 17일 계획서·증인 채택. 농식품부 증인 10명 — 농지 전수조사·농협 개혁이 쟁점.",
      sources: [
        {
          title: "국회 농해수위, 2026년 국감 10월 7일 시작 / 푸드투데이",
          url: "https://www.foodtoday.or.kr/news/article.html?no=208101",
        },
        {
          title: "농식품부 국감 증인 10명 채택... 농지 전수조사·농협 개혁 '쟁점' / 파이낸셜뉴스",
          url: "https://www.fnnews.com/news/202609221828083960",
        },
      ],
    },
    {
      name: "산업통상자원중소벤처기업위원회",
      short: "산자중기위",
      status: "confirmed",
      period: "10월 6일~23일(18일)",
      scope: "42개 기관·단체",
      days: [
        { date: "10-06", target: "산업통상부" },
        { date: "10-07", target: "중소벤처기업부" },
        { date: "10-12", target: "한국전력공사·한국수력원자력 등" },
        { date: "10-13", target: "지식재산처 및 산하기관" },
        { date: "10-15", target: "중소벤처기업진흥공단 등" },
        { date: "10-19", target: "한국가스공사·한국석유공사 등 에너지 공기업(대구)" },
        { date: "10-20", target: "경북 구미 현장시찰" },
        { date: "10-22", target: "산업통상부 종합감사" },
        { date: "10-23", target: "중소벤처기업부·지식재산처 종합감사" },
      ],
      note: "증인: 김병주 MBK파트너스 회장 등 채택, 이재용·최태원 회장은 여당 반대로 불발(9월 22일, 추가 협의 여지).",
      sources: [
        {
          title: "산자중기위 국감 10월 6일 돌입…에너지 공기업 19일 집중감사 / 에너지데일리",
          url: "https://www.energydaily.co.kr/news/articleView.html?idxno=203563",
        },
        {
          title: "산자위, 이소영 중기장관 청문보고서 채택…野 '부적격' 의견 / 서플",
          url: "https://supple.kr/news/cmubzdozc002ru70m0gkamf9v",
        },
      ],
    },
    {
      name: "보건복지위원회",
      short: "복지위",
      status: "confirmed",
      period: "10월 7일~27일",
      days: [
        { date: "10-07", target: "보건복지부·질병관리청" },
        { date: "10-08", target: "국립대병원(교육부→복지부 이관 후 첫 국감)" },
        { date: "10-13~10-14", target: "식품의약품안전처 및 소속 기관, 국민연금공단" },
        { date: "10-16", target: "국민건강보험공단·건강보험심사평가원(원주)" },
        { date: "10-20", target: "보건산업진흥원·국립암센터 등 보건의료기관" },
        { date: "10-22", target: "노인인력개발원·사회보장정보원 등 복지기관" },
        { date: "10-27", target: "종합감사" },
      ],
      sources: [
        {
          title: "내달 7일 막 오르는 복지위 국감…국립대병원, 소관부처 이관 후 첫 검증 / 뉴스핌",
          url: "https://www.newspim.com/news/view/20260923000400",
        },
      ],
    },
    {
      name: "기후에너지환경노동위원회",
      short: "기후환노위",
      status: "confirmed",
      period: "10월 6일~27일",
      days: [
        { date: "10-06", target: "기후에너지환경부" },
        { date: "10-08", target: "기상청 및 소속·산하기관" },
        { date: "10-13", target: "고용노동부" },
        { date: "10-15", target: "환경 분야 산하기관(한국환경공단 등)" },
        { date: "10-16", target: "중앙노동위원회·최저임금위원회·경제사회노동위원회" },
        { date: "10-19", target: "에너지 분야(한국전력공사·발전사 등)" },
        { date: "10-23", target: "근로복지공단·산업안전보건공단·산업인력공단" },
        { date: "10-26", target: "기후에너지환경부·기상청 종합감사" },
        { date: "10-27", target: "고용노동부·경사노위 종합감사" },
      ],
      note: "증인·참고인 명단은 9월 23일 기준 미확정.",
      sources: [
        {
          title: "'노동국감' 10월13일 돌입, 증인·참고인 '안갯속' / 매일노동뉴스",
          url: "https://www.labortoday.co.kr/news/articleView.html?idxno=236914",
        },
      ],
    },
    {
      name: "국토교통위원회",
      short: "국토위",
      status: "confirmed",
      period: "10월 7일~23일",
      days: [
        { date: "10-07", target: "국토교통부" },
        { date: "10-12", target: "한국토지주택공사(LH)" },
        { date: "10-19", target: "서울특별시" },
        { date: "10-23", target: "종합감사(국토교통부 등)" },
      ],
      sources: [
        {
          title: "추석 이후 국토위 국감 돌입···주택공급부터 LH 개혁까지 / 뉴스웨이",
          url: "https://www.newsway.co.kr/news/view?ud=2026092309190933103",
        },
      ],
    },
    {
      name: "정무위원회",
      short: "정무위",
      status: "pending",
      days: [],
      note: "이억원 금융위원장·이찬진 금융감독원장 출석 예정. 여당 박홍배 의원이 5대 금융지주 회장·5대 은행장을 증인으로 신청.",
      sources: [
        {
          title: "금융 CEO 줄소환 예고…정무위 국감 증인 신청 본격화 / 중앙이코노미뉴스",
          url: "https://www.joongangenews.com/news/articleView.html?idxno=550096",
        },
      ],
    },
    { name: "교육위원회", short: "교육위", status: "pending", days: [], sources: [] },
    { name: "국방위원회", short: "국방위", status: "pending", days: [], sources: [] },
    { name: "문화체육관광위원회", short: "문체위", status: "pending", days: [], sources: [] },
    {
      name: "국회운영위원회",
      short: "운영위",
      status: "pending",
      days: [],
      note: "국민의힘이 김현지·정진상 등 청와대 인사검증 관련 증인을 신청.",
      sources: [
        {
          title: "野, 김승원·김현지부터 김용범까지... 국정감사서 '의혹 총공세' / 한국일보",
          url: "https://www.hankookilbo.com/news/article/A2026092116060003400",
        },
      ],
    },
    {
      name: "정보위원회",
      short: "정보위",
      status: "pending",
      period: "10월 30일까지",
      days: [],
      sources: [],
    },
    {
      name: "성평등가족위원회",
      short: "성평등가족위",
      status: "pending",
      period: "10월 30일까지",
      days: [],
      sources: [],
    },
  ] satisfies AuditCommittee[],

  issues: [
    {
      title: "여야 기조 — '민생·개혁 입법' 대 '실정 검증'",
      committees: [],
      body: "정기국회 개회를 앞두고 여당은 입법·예산 속도를, 야당은 정부 정책 검증을 앞세웠습니다. 국정감사는 양측 기조가 가장 직접 부딪히는 무대입니다.",
      quotes: [
        {
          who: "한병도 더불어민주당 원내대표",
          text: "이번 정기국회 100일은 이재명 정부의 성공은 물론 민주당의 성패를 가를 골든타임… 민생·개혁 입법과 내년도 예산안 처리에 속도를 내겠다",
        },
        {
          who: "임이자 국민의힘 정책위의장",
          text: "이번 정기국회에 정책 역량을 총집결하겠다. '파괴왕' 이재명의 7대 실정에 맞춰 7대 분야 130여개 중점 입법과제를 추진하겠다",
        },
      ],
      sources: [
        {
          title:
            '막 오르는 李정부 2년차 정기국회...與 "입법 속도전" vs 野 "실정 송곳 검증" / 뉴스핌',
          url: "https://www.newspim.com/news/view/20260828000986",
        },
      ],
    },
    {
      title: "대법원장·헌재소장 기관증인 — 법사위",
      committees: ["법제사법위원회"],
      body: "법사위는 9월 21일 계획서를 의결하며 조희대 대법원장(10월 6일)과 김상환 헌법재판소장(10월 13일)을 기관증인으로 부르기로 했습니다. 국민의힘은 회의에 불참했습니다.",
      quotes: [
        {
          who: "김의겸 법사위 민주당 간사",
          text: "사법부의 독립은 중요하지만 조희대 대법원장이 관례를 존중받을 만큼의 행동을 했는지에 대해선 의문",
        },
        {
          who: "박형수 국민의힘 의원",
          text: "대법원장을 증인으로 출석시키는 것에 대해 결단코 반대한다… 삼권분립을 형해화하고 사법부의 독립과 정치적 중립성을 완전히 허물어뜨리는 것",
        },
      ],
      sources: [
        {
          title: '법사위, 조희대 국감 기관증인 의결…국힘 "결단코 반대" 불참 / 뉴스웍스',
          url: "https://www.newsworks.co.kr/news/articleView.html?idxno=854480",
        },
      ],
    },
    {
      title: "증인 채택 공방 — 청와대 인사라인·재계 총수",
      committees: [
        "국회운영위원회",
        "보건복지위원회",
        "정무위원회",
        "산업통상자원중소벤처기업위원회",
      ],
      body: "국민의힘은 청와대 인사검증(김현지·정진상, 운영위), 김승원 전 법무부 장관 후보자의 신약 임상 청탁 의혹(복지위), 레버리지 ETF 도입 의혹(김용범·박현주, 정무위), 호남 반도체 클러스터(이재용·최태원, 산자중기위) 등을 겨냥해 증인을 신청했습니다. 여당은 재계 총수 증인 채택은 받아들일 수 없다는 입장이고, 산자중기위에서는 9월 22일 이재용·최태원 회장 채택이 불발됐습니다(위원장은 추가 협의 여지를 남김).",
      sources: [
        {
          title: "野, 김승원·김현지부터 김용범까지... 국정감사서 '의혹 총공세' / 한국일보",
          url: "https://www.hankookilbo.com/news/article/A2026092116060003400",
        },
        {
          title: "산자위, 이소영 중기장관 청문보고서 채택…野 '부적격' 의견 / 서플",
          url: "https://supple.kr/news/cmubzdozc002ru70m0gkamf9v",
        },
      ],
    },
    {
      title: "기업인 무더기 증인, 올해도 되풀이되나",
      committees: [
        "정무위원회",
        "기후에너지환경노동위원회",
        "산업통상자원중소벤처기업위원회",
        "과학기술정보방송통신위원회",
      ],
      body: "경제·산업 상임위에는 수백 명 규모의 일반증인 신청이 접수됐습니다. 과방위는 통신 3사·티빙 해킹, AI 챗봇, 구글·애플 앱마켓 문제로 증인 29명·참고인 13명을 채택했습니다. 총수를 불러 질타하는 방식이 감사 실효성을 떨어뜨린다는 지적도 나옵니다.",
      quotes: [
        {
          who: "한 연구위원(공감신문 인용)",
          text: "최고경영자를 포토라인에 세워 일방적으로 질타하는 방식은 국회의 권능을 스스로 갉아먹는 행태",
        },
      ],
      sources: [
        {
          title: "2026 국정감사 기업인 무더기 증인 채택 실효성 도마 / 공감신문",
          url: "https://www.gokorea.kr/news/articleView.html?idxno=877502",
        },
        {
          title: "과방위 국정감사 '개인정보·플랫폼·AI' 정조준 / 머니투데이방송",
          url: "https://news.mtn.co.kr/news-detail/2026092213341522467",
        },
      ],
    },
    {
      title: "주택공급·LH — 국토위",
      committees: ["국토교통위원회"],
      body: "정부 주택공급 대책이 실제 착공·입주로 이어질지, 공급 확대와 대출 규제의 엇박자, 부채 173조 원 규모 LH의 재무·조직개편, 서울 정비사업과 용산공원 활용을 둘러싼 정부·서울시 입장 차이가 쟁점으로 꼽힙니다. 9월 22일 임명된 홍지선 장관의 첫 국감입니다.",
      sources: [
        {
          title: "추석 이후 국토위 국감 돌입···주택공급부터 LH 개혁까지 / 뉴스웨이",
          url: "https://www.newsway.co.kr/news/view?ud=2026092309190933103",
        },
      ],
    },
    {
      title: "국립대병원 이관 후 첫 국감 — 복지위",
      committees: ["보건복지위원회"],
      body: "국립대병원 소관 부처가 8월 교육부에서 복지부로 옮겨진 뒤 처음 열리는 국감입니다. 국립대병원 육성 방향, 비급여 관리, 기초연금 개편안, 신약 임상 논란 등이 거론됩니다.",
      sources: [
        {
          title: "내달 7일 막 오르는 복지위 국감…국립대병원, 소관부처 이관 후 첫 검증 / 뉴스핌",
          url: "https://www.newspim.com/news/view/20260923000400",
        },
      ],
    },
  ] satisfies AuditIssue[],
};
