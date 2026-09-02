/**
 * 2026년 8월 개각(2기 내각) 후보자 — /issues/cabinet-2026-08 페이지와 홈 진입 카드의 편집 데이터.
 *
 * 원칙 (codex·디자인 검토 2026-08-30 반영):
 *  - 이 파일은 "편집 판단"만 담는다: 지명 사실, 약력, 출처, 상태, 청문 상임위. 의정활동 수치는
 *    페이지가 성적표 API에서 읽는다(여기에 숫자를 박아 두지 않는다).
 *  - 상태(status)는 공식 결과를 사람이 확인한 뒤에만 바꾼다. 일정 sync로 자동 전환하지 않는다.
 *  - 겸직 명단(backend cabinet-members.ts)은 실제 취임·이임일 확인 후 별도 갱신. 여기의 후보 상태와 연동하지 않는다.
 *  - "임시 페이지"가 아니다. 임명·낙마 결과까지 갱신한 뒤 아카이브로 유지한다(URL·canonical 변경 금지).
 *  - 약력(bio)은 "왜 이 사람인가"를 쓰고, 청문 절차 같은 구조 정보는 필드(hearingCommittee)에 맡긴다.
 *  - knip: 페이지·홈이 함께 쓰는 단일 export만 둔다.
 */

/** 후보자 진행 상태. 사퇴(withdrawn)와 지명 철회(nomination_withdrawn)를 구분한다. */
type NomineeStatus =
  | "nominated"
  | "hearing_scheduled"
  | "hearing_completed"
  | "report_adopted"
  | "report_not_adopted"
  | "appointed"
  | "withdrawn"
  | "nomination_withdrawn";

interface Source {
  outlet: string;
  title: string;
  url: string;
  date: string;
}

interface MinisterNominee {
  /** 앵커·공유 URL용 ASCII 슬러그 */
  slug: string;
  /** 부처명(표시용) */
  ministry: string;
  /** 지명 직위 전체 표기 */
  position: string;
  name: string;
  /** 현역 국회의원이면 lawmake 의원 ID(MONA_CD). 비의원은 null */
  memberId: string | null;
  /** 현직·직전 직위 (지명 시점 기준). 의원은 정당 배지가 따로 붙으므로 정당명은 넣지 않는다 */
  currentRole: string;
  /** 사람이 쓴 약력 — 왜 이 사람이 지명됐는지, 무엇을 해 왔는지 2~3문장 */
  bio: string;
  /** 전임 장관(교체 대상). 공석이면 null */
  incumbent: { name: string; memberId: string | null; note?: string } | null;
  /** 인사청문을 담당할 소관 상임위(예상). 확정되면 확정 표기로 갱신 */
  hearingCommittee: string;
  status: NomineeStatus;
  /** 상태 변경 근거·날짜 기록 (최신이 마지막) */
  statusLog: { date: string; status: NomineeStatus; note: string }[];
}

interface PresidentialOfficeAppointee {
  position: string;
  name: string;
  memberId: string | null;
  currentRole: string;
  bio: string;
  /** 국회와의 관계 — 겸직·청문 여부 */
  note: string;
}

interface OutgoingMinister {
  name: string;
  memberId: string;
  position: string;
  note: string;
}

export const CABINET_2026_08 = {
  slug: "cabinet-2026-08",
  path: "/issues/cabinet-2026-08",
  title: "2026년 8월 개각 — 2기 내각 후보자 6명과 국회",
  shortTitle: "2기 개각 후보자",
  description:
    "8월 30일 지명된 6개 부처 장관 후보자와 청와대 인선을 정리했습니다. 현역 국회의원 후보자 3명의 22대 의정활동 기록, 국회로 복귀하는 장관 3명, 인사청문회 일정을 한 곳에서 추적합니다.",
  announcedAt: "2026-08-30",
  announcedAtLabel: "8월 30일",
  publishedAt: "2026-08-30",
  updatedAt: "2026-09-02",
  /** 홈 진입 카드 노출 여부 — 임명·결과 확정 후 false로 내리고 페이지는 아카이브로 유지 */
  showOnHome: true,
  /** 페이지 상단 리드 — 두 문장 */
  lead: "이재명 대통령이 8월 30일 경제부총리·국토·국방·법무·성평등가족·중소벤처 6개 부처 장관을 교체하는 2기 개각을 단행했습니다. 후보자 6명 중 3명이 현역 국회의원이고 물러나는 장관 3명도 현역 의원이라, 이번 인사는 정기국회 초반의 인사청문회 일정과 국회 구성에 직접 영향을 미칩니다.",
  disclaimer:
    "이 페이지는 후보자의 국무위원 적격성을 평가하거나 지지·반대하기 위한 것이 아닙니다. 의원 지표는 22대 국회 공개자료에 따른 의정활동 측정치이며, 장관 직무 수행 능력·정책 성향·도덕성을 의미하지 않습니다. 수치와 인사 상태는 표시된 업데이트 시점 기준입니다.",
  ministers: [
    {
      slug: "lee-hyung-il",
      ministry: "재정경제부",
      position: "경제부총리 겸 재정경제부 장관 후보자",
      name: "이형일",
      memberId: null,
      currentRole: "재정경제부 제1차관",
      bio: "재정·거시경제 정책 실무를 총괄해 온 정통 경제관료입니다. 1차관에서 부총리로 곧장 올라가는 내부 승진 인선으로, 조직 개편 직후의 재정경제부를 안정적으로 이어받는 데 무게를 둔 선택으로 읽힙니다.",
      incumbent: null,
      hearingCommittee: "재정경제기획위원회",
      status: "hearing_scheduled",
      statusLog: [
        { date: "2026-08-30", status: "nominated", note: "청와대 브리핑에서 지명 발표" },
        {
          date: "2026-09-02",
          status: "hearing_scheduled",
          note: "인사청문회 9월 15일로 확정(언론 보도 기준)",
        },
      ],
    },
    {
      slug: "hong-ji-sun",
      ministry: "국토교통부",
      position: "국토교통부 장관 후보자",
      name: "홍지선",
      memberId: null,
      currentRole: "국토교통부 제2차관",
      bio: "교통·물류를 맡아 온 2차관의 내부 승진입니다. 용산공원 특별법과 도시정비 2법이 정기국회로 넘어간 시점에 주택 공급 입법의 주무 장관을 맡게 돼, 청문회에서 공급 정책 질의가 집중될 자리입니다.",
      incumbent: {
        name: "김윤덕",
        memberId: "JZY9937U",
        note: "현역 의원 · 이임 후 국회 복귀",
      },
      hearingCommittee: "국토교통위원회",
      status: "hearing_scheduled",
      statusLog: [
        { date: "2026-08-30", status: "nominated", note: "청와대 브리핑에서 지명 발표" },
        {
          date: "2026-09-02",
          status: "hearing_scheduled",
          note: "인사청문회 9월 16일로 확정(언론 보도 기준)",
        },
      ],
    },
    {
      slug: "kang-shin-chul",
      ministry: "국방부",
      position: "국방부 장관 후보자",
      name: "강신철",
      memberId: null,
      currentRole: "전 한미연합사령부 부사령관",
      bio: "한미연합사령부 부사령관을 지낸 군 출신 인선입니다. 현역 의원이 맡아 온 국방부 장관 자리를 다시 군 출신에게 돌리는 선택으로, 한미 연합방위 실무 경험이 지명 배경으로 거론됩니다.",
      incumbent: {
        name: "안규백",
        memberId: "TST4507I",
        note: "현역 의원 · 이임 후 국회 복귀",
      },
      hearingCommittee: "국방위원회",
      status: "nominated",
      statusLog: [{ date: "2026-08-30", status: "nominated", note: "청와대 브리핑에서 지명 발표" }],
    },
    {
      slug: "kim-seung-won",
      ministry: "법무부",
      position: "법무부 장관 후보자",
      name: "김승원",
      memberId: "ATB59635",
      currentRole: "경기 수원시갑 · 법제사법위원회 민주당 간사",
      bio: "법사위 민주당 간사로 대법원장 증인 채택 등 사법개혁 현안을 최전선에서 이끌어 왔습니다. 보완수사권 폐지 당론에 반발해 사의를 표했던 정성호 장관의 후임이라는 점에서, 검찰개혁 후속 조치를 국회 논리로 밀어붙일 인선으로 평가됩니다. 청문은 자신이 간사였던 법사위에서 받습니다.",
      incumbent: {
        name: "정성호",
        memberId: "V429892C",
        note: "현역 의원 · 이임 후 국회 복귀",
      },
      hearingCommittee: "법제사법위원회",
      status: "nominated",
      statusLog: [
        { date: "2026-08-30", status: "nominated", note: "청와대 브리핑에서 지명 발표" },
        {
          date: "2026-09-02",
          status: "nominated",
          note: "청문회 9월 18일로 조율 중(언론 보도 기준)",
        },
      ],
    },
    {
      slug: "yong-hye-in",
      ministry: "성평등가족부",
      position: "성평등가족부 장관 후보자",
      name: "용혜인",
      memberId: "GE71932C",
      currentRole: "비례대표 · 기본소득당 대표",
      bio: "21·22대 비례대표로 기본소득당을 이끌어 온 원내 소수정당 대표입니다. 여당 밖 정당의 현직 대표가 입각하는 드문 사례로, 연립 성격의 인사라는 해석과 함께 당대표직 유지 여부가 청문 전 쟁점이 될 수 있습니다.",
      incumbent: { name: "원민경", memberId: null },
      hearingCommittee: "성평등가족위원회",
      status: "nominated",
      statusLog: [{ date: "2026-08-30", status: "nominated", note: "청와대 브리핑에서 지명 발표" }],
    },
    {
      slug: "lee-so-young",
      ministry: "중소벤처기업부",
      position: "중소벤처기업부 장관 후보자",
      name: "이소영",
      memberId: "WTR5885Y",
      currentRole: "경기 의왕시과천시 · 기후에너지환경노동위원회",
      bio: "환경 전문 변호사 출신 재선 의원으로 기후·에너지 입법을 주로 다뤄 왔습니다. 한성숙 전 장관의 국무총리 발탁으로 비어 있던 자리를 채우는 인선이며, 중소기업·벤처 정책 경험이 청문회 검증 포인트로 꼽힙니다.",
      incumbent: null,
      hearingCommittee: "산업통상자원중소벤처기업위원회",
      status: "hearing_scheduled",
      statusLog: [
        { date: "2026-08-30", status: "nominated", note: "청와대 브리핑에서 지명 발표" },
        {
          date: "2026-09-02",
          status: "hearing_scheduled",
          note: "인사청문회 9월 15일로 확정(언론 보도 기준)",
        },
      ],
    },
  ] as MinisterNominee[],
  presidentialOffice: [
    {
      position: "AI미래기획수석비서관",
      name: "이해민",
      memberId: "0698755I",
      currentRole: "국회의원(조국혁신당·비례대표)",
      bio: "구글 출신 IT 전문가로 22대 국회에서 AI·과학기술 입법을 다뤄 왔습니다.",
      note: "청와대 수석은 국무위원이 아니어서 국회의원 겸직이 금지됩니다. 의원직 사퇴 절차가 뒤따르고, 조국혁신당 비례 승계가 이어집니다.",
    },
    {
      position: "정무특별보좌관",
      name: "김경수",
      memberId: null,
      currentRole: "전 지방시대위원회 위원장",
      bio: "경남지사와 지방시대위원장을 지냈습니다.",
      note: "국회 인사청문 대상 아님",
    },
    {
      position: "메가프로젝트 보좌관",
      name: "이원주",
      memberId: null,
      currentRole: "에너지전환정책실장",
      bio: "에너지전환 정책 실무를 맡아 왔습니다.",
      note: "국회 인사청문 대상 아님",
    },
    {
      position: "국가AI전략위원회 부위원장",
      name: "하정우",
      memberId: null,
      currentRole: "전 AI미래기획수석비서관",
      bio: "초대 AI미래기획수석에서 자리를 옮깁니다.",
      note: "국회 인사청문 대상 아님",
    },
  ] satisfies PresidentialOfficeAppointee[],
  outgoing: [
    {
      name: "정성호",
      memberId: "V429892C",
      position: "법무부 장관",
      note: "2025년 7월 취임. 7월 보완수사권 폐지 당론에 반발해 사의를 표명한 뒤 유임돼 왔습니다.",
    },
    {
      name: "김윤덕",
      memberId: "JZY9937U",
      position: "국토교통부 장관",
      note: "2025년 7월 취임. 용산공원 특별법 등 주택 공급 입법을 서울시와 협의해 왔습니다.",
    },
    {
      name: "안규백",
      memberId: "TST4507I",
      position: "국방부 장관",
      note: "2025년 7월 취임.",
    },
  ] satisfies OutgoingMinister[],
  sources: [
    {
      outlet: "이코노미스트",
      title: "경제부총리 이형일·법무 김승원·국방 강신철… 집권 2기 개각",
      url: "https://economist.co.kr/article/view/ecn202608300007",
      date: "8. 30.",
    },
    {
      outlet: "동아일보",
      title: "경제부총리 이형일·법무장관 김승원·국방장관 강신철",
      url: "https://www.donga.com/news/Politics/article/all/20260830/134569310/2",
      date: "8. 30.",
    },
    {
      outlet: "메트로신문",
      title: "재경부 이형일·법무부 김승원·국방부 강신철 지명… 6개 부처 개각",
      url: "http://www.metroseoul.co.kr/article/20260830500109",
      date: "8. 30.",
    },
    {
      outlet: "CBC뉴스",
      title: "용혜인 입각·법무 김승원… 청와대 2차 개각 발표",
      url: "https://www.cbci.co.kr/news/articleView.html?idxno=602247",
      date: "8. 30.",
    },
  ] satisfies Source[],
  /** 함께 읽을 편집 콘텐츠 (내부 링크) */
  related: [
    { title: "오늘의 국회 — 2기 개각 속보", href: "/today" },
    {
      title: "주간 국회 뉴스 8월 4주차 — 여야 워크숍·연찬회와 정기국회 준비",
      href: "/weekly/2026-08-w4",
    },
    {
      title: "검사 보완수사권 폐지 — 형소법 개정안 통과의 의미",
      href: "/weekly/2026-07-w4/보완수사권-폐지-형소법-통과",
    },
  ],
};
