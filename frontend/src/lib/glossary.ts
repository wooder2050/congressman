/**
 * 국회 전문 용어 사전
 *
 * 일반 사용자가 이해하기 어려운 국회 관련 전문 용어를 쉽게 설명합니다.
 */

export interface GlossaryTerm {
  term: string;
  shortDesc: string; // 툴팁용 짧은 설명
  fullDesc?: string; // 용어 사전 페이지용 상세 설명
  category: "bill" | "vote" | "activity" | "committee";
  /** 이 용어가 왜 중요한지 — 편집자 해설 */
  whyItMatters?: string;
  /** 실제 국회 사례 (검증된 실사례만, href는 사이트 내 법안·페이지 링크) */
  example?: { title: string; description: string; href?: string };
  /** 혼동하기 쉬운 용어 — term은 사전 내 다른 용어명, note는 차이 한 줄 */
  confusedWith?: { term: string; note: string }[];
  /** 관련 내부 페이지 */
  relatedLinks?: { label: string; href: string }[];
  /** 공식 출처 (법령 조항 등, 외부 링크) */
  sources?: { label: string; href: string }[];
  /** 편집 검토일 (YYYY-MM-DD) */
  reviewedAt?: string;
}

const LAW_ASSEMBLY = "https://www.law.go.kr/법령/국회법";
const LAW_CONSTITUTION = "https://www.law.go.kr/법령/대한민국헌법";

export const GLOSSARY: Record<string, GlossaryTerm> = {
  // === 법안 상태 ===
  passed: {
    term: "가결",
    shortDesc: "법안이 본회의에서 통과된 상태입니다.",
    fullDesc:
      "법안이 국회 본회의에서 재적의원 과반수 출석, 출석의원 과반수 찬성으로 통과된 상태를 말합니다. 가결된 법안은 정부로 이송되어 공포 절차를 거칩니다. 가결이 곧 시행은 아니라는 점에 주의해야 합니다. 이송 후 대통령이 15일 안에 공포하거나 재의를 요구할 수 있고, 공포된 뒤에도 부칙에 정한 시행일이 되어야 실제로 효력이 발생합니다.",
    category: "bill",
    whyItMatters:
      "'국회 통과'와 '시행'을 구분하는 출발점입니다. 가결 이후에도 재의요구(거부권)라는 변수가 남아 있어, 쟁점 법안은 가결 소식 다음에 정부 이송과 공포 여부까지 지켜봐야 결말을 알 수 있습니다.",
    confusedWith: [
      {
        term: "공포",
        note: "가결은 국회의 의결, 공포는 그 뒤 대통령이 법률을 확정해 알리는 절차입니다.",
      },
    ],
    relatedLinks: [{ label: "본회의 표결 현황", href: "/votes" }],
    sources: [{ label: "대한민국헌법 제49조·제53조", href: LAW_CONSTITUTION }],
    reviewedAt: "2026-08-04",
  },
  pending: {
    term: "계류",
    shortDesc: "위원회에서 심사 중이거나 본회의 상정을 기다리는 상태입니다.",
    fullDesc:
      "발의된 법안이 아직 처리되지 않고 위원회 심사 단계에 머물러 있거나 본회의 상정을 기다리고 있는 상태입니다. 대부분의 법안이 이 단계에서 오랜 시간을 보냅니다. 계류가 길어지는 전형적 경로는 세 가지입니다. 소관 상임위가 상정 자체를 미루는 경우, 상임위는 통과했지만 법제사법위원회의 체계자구심사에서 멈춘 경우, 본회의에 부의됐지만 의사일정에 오르지 못하는 경우입니다. 어느 단계에서 멈췄는지에 따라 처리 전망이 완전히 달라집니다.",
    category: "bill",
    whyItMatters:
      "'국회에 계류 중'이라는 기사 문구만으로는 법안이 살아있는지 죽어가는지 알 수 없습니다. 21대 국회 기준 발의 법안의 약 3분의 2가 처리되지 못했는데, 계류 단계가 어디인지 확인하면 이 법안이 실제로 통과 궤도에 있는지 판단할 수 있습니다.",
    confusedWith: [
      {
        term: "임기만료폐기",
        note: "계류는 아직 살아있는 상태, 임기만료폐기는 임기 종료로 계류가 끝나 소멸한 상태입니다.",
      },
    ],
    relatedLinks: [
      { label: "법안 검색", href: "/bills" },
      { label: "법안 통과 절차 가이드", href: "/guide" },
    ],
    sources: [{ label: "국회법 제81조 (상임위원회 회부)", href: LAW_ASSEMBLY }],
    reviewedAt: "2026-08-04",
  },
  discarded: {
    term: "폐기",
    shortDesc: "임기 만료 등으로 법안 심사가 종료된 상태입니다.",
    fullDesc:
      "국회의원의 임기가 만료되거나, 발의자가 철회하거나, 위원회에서 부결된 경우 등 더 이상 심사되지 않는 상태입니다. 폐기된 법안은 다시 발의해야 합니다.",
    category: "bill",
  },
  committee_review: {
    term: "위원회 심사",
    shortDesc: "소관 상임위원회에서 법안을 검토하는 단계입니다.",
    fullDesc:
      "발의된 법안이 해당 분야를 다루는 상임위원회(예: 기획재정위원회, 법제사법위원회 등)에 회부되어 전문적인 검토와 수정 작업이 이루어지는 단계입니다.",
    category: "bill",
  },

  // === 표결 결과 ===
  passed_original: {
    term: "원안가결",
    shortDesc: "수정 없이 원래 제안된 내용 그대로 가결된 경우입니다.",
    fullDesc:
      "위원회나 본회의에서 법안의 내용을 전혀 수정하지 않고 원래 발의된 내용 그대로 통과시킨 경우를 말합니다. 발의자의 의도가 100% 반영됩니다.",
    category: "vote",
  },
  passed_amended: {
    term: "수정가결",
    shortDesc: "일부 내용을 수정한 후 가결된 경우입니다.",
    fullDesc:
      "법안의 일부 조항이나 내용을 수정, 삭제, 추가한 후 통과된 경우입니다. 여야 합의나 위원회 논의를 거쳐 원안보다 개선된 형태로 가결되는 경우가 많습니다.",
    category: "vote",
  },
  rejected: {
    term: "부결",
    shortDesc: "표결 결과 반대표가 더 많아 통과되지 못한 경우입니다.",
    fullDesc:
      "본회의 표결에서 찬성표보다 반대표가 많거나 정족수를 채우지 못해 법안이 통과되지 못한 경우입니다. 부결된 법안은 같은 회기에 다시 상정할 수 없습니다.",
    category: "vote",
  },
  vote_discarded: {
    term: "폐기",
    shortDesc: "표결 없이 법안 심사가 종료된 경우입니다.",
    fullDesc:
      "본회의 표결까지 가지 못하고 위원회 단계에서 심사가 중단되거나, 임기 만료 등으로 자동 폐기된 경우입니다.",
    category: "vote",
  },

  // === 발의 방식 ===
  proposed: {
    term: "발의",
    shortDesc: "국회의원이 법안을 제출하는 행위입니다.",
    fullDesc:
      "국회의원 10명 이상이 찬성하면 법안을 국회에 제출할 수 있습니다. 발의된 법안은 소관 위원회로 회부되어 심사를 받습니다.",
    category: "bill",
  },
  chief_proposer: {
    term: "대표발의",
    shortDesc: "법안을 주도적으로 작성하고 제출한 의원입니다.",
    fullDesc:
      "법안의 내용을 직접 작성하고 다른 의원들의 동의를 받아 제출한 주된 발의자입니다. 보통 '홍길동 의원 대표발의'로 표시됩니다.",
    category: "bill",
  },
  co_proposer: {
    term: "공동발의",
    shortDesc: "대표발의자와 함께 법안에 이름을 올린 의원입니다.",
    fullDesc:
      "대표발의자의 법안 취지에 동의하고 함께 발의에 참여한 의원들입니다. 법안 발의에는 최소 10명 이상의 찬성이 필요합니다.",
    category: "bill",
  },
  committee_alternative: {
    term: "위원회 대안",
    shortDesc: "여러 유사 법안을 위원회에서 하나로 통합한 법안입니다.",
    fullDesc:
      "같은 주제의 여러 법안이 발의되었을 때, 위원회가 이들의 내용을 모아 새로운 법안으로 통합한 것입니다. 제안자가 개별 의원이 아니라 '위원장'으로 표기되며, 법안명 끝에 '(대안)'이 붙습니다. 재료가 된 개별 법안들은 대안반영폐기로 처리됩니다. 본회의를 통과하는 법안의 상당수가 이 형태라, 실제 입법의 최종 결과물을 보려면 개별 발의안이 아니라 대안을 찾아야 하는 경우가 많습니다.",
    category: "bill",
    whyItMatters:
      "쟁점 법안 뉴스에서 '위원회 대안이 가결됐다'고 하면, 여러 의원의 법안이 협상을 거쳐 하나로 정리된 결과입니다. 누구의 안이 얼마나 반영됐는지가 정치적 성과 다툼의 대상이 되곤 합니다.",
    example: {
      title: "형사소송법 일부개정법률안(대안) — 2026년 7월 31일 가결",
      description:
        "검사의 직접수사권 폐지를 담은 형사소송법 개정은 개별 의원 발의안이 아니라 법제사법위원회가 여러 법안을 통합한 위원회 대안 형태로 본회의를 통과했습니다.",
      href: "/bills/PRC_N2W6S0L7W2J9D1I8A1B1I5I1G6H8F5",
    },
    confusedWith: [
      {
        term: "대안반영폐기",
        note: "위원회 대안은 통합해서 새로 만든 법안이고, 대안반영폐기는 그 재료가 된 개별 법안의 처리 결과입니다.",
      },
    ],
    relatedLinks: [{ label: "법안 검색", href: "/bills" }],
    sources: [{ label: "국회법 제51조 (위원회 제출 의안)", href: LAW_ASSEMBLY }],
    reviewedAt: "2026-08-04",
  },
  alternative_discard: {
    term: "대안반영폐기",
    shortDesc: "이 법안의 내용이 다른 법안(대안)에 합쳐져서 원래 법안은 폐기된 것입니다.",
    fullDesc:
      "부정적인 의미가 아닙니다. 법안의 핵심 내용이 위원회 대안에 반영되어 살아있으며, 형식적으로 원래 법안만 폐기 처리된 것입니다. 같은 주제로 여러 의원이 각각 법안을 내면 위원회가 이를 하나의 대안으로 통합하는데, 이때 재료가 된 개별 법안들에 붙는 처리 결과가 대안반영폐기입니다. 통계상 '폐기'로 집계되지만 실질적으로는 입법에 성공한 경우가 많아, 의원 평가에서 단순 폐기와 구분해서 봐야 합니다.",
    category: "bill",
    whyItMatters:
      "국회 법안 통계를 읽을 때 가장 오해가 많은 용어입니다. '폐기율이 높다'는 기사에서 대안반영폐기가 섞여 있으면 실제로는 상당수가 입법에 반영된 것일 수 있습니다. 의원별 통과율을 비교할 때도 대안반영폐기를 성과로 칠지에 따라 순위가 크게 달라집니다.",
    example: {
      title: "형사소송법 개정안들의 대안 통합 (2026년 7월)",
      description:
        "2026년 7월 발의된 여러 건의 형사소송법 개정안이 법제사법위원회에서 하나의 위원회 대안으로 통합되면서 개별 법안들은 대안반영폐기 처리됐습니다. 그 대안은 7월 31일 본회의를 통과했으니, 폐기된 개별 법안들의 내용도 사실상 입법에 성공한 것입니다.",
      href: "/bills/PRC_N2W6S0L7W2J9D1I8A1B1I5I1G6H8F5",
    },
    confusedWith: [
      {
        term: "임기만료폐기",
        note: "임기만료폐기는 처리되지 못한 채 소멸한 진짜 폐기이고, 대안반영폐기는 내용이 다른 법안으로 살아남은 형식상 폐기입니다.",
      },
    ],
    relatedLinks: [{ label: "법안 검색", href: "/bills" }],
    sources: [{ label: "국회법 제51조 (위원회 제출 의안)", href: LAW_ASSEMBLY }],
    reviewedAt: "2026-08-04",
  },
  term_expiry_discard: {
    term: "임기만료폐기",
    shortDesc: "국회의원 4년 임기 내에 처리되지 못해 자동 폐기된 법안입니다.",
    fullDesc:
      "국회의원의 임기(4년)가 끝나면, 그 임기 동안 처리되지 못한 법안은 자동으로 폐기됩니다. 다음 대 국회에서 다시 발의해야 합니다.",
    category: "bill",
  },
  withdrawal: {
    term: "철회",
    shortDesc: "발의자가 스스로 법안을 거둬들인 것입니다.",
    fullDesc:
      "법안을 발의한 의원이 여러 사유(정치적 합의, 내용 보완 필요, 상황 변화 등)로 직접 법안을 취소하는 것입니다.",
    category: "bill",
  },
  partial_amendment: {
    term: "일부개정법률안",
    shortDesc: "기존 법의 일부 조항을 고치는 법안입니다.",
    fullDesc:
      "이미 존재하는 법률의 특정 조항만 수정·삭제·추가하는 법안입니다. 전체 법안 중 가장 많은 비중을 차지합니다.",
    category: "bill",
  },
  full_amendment: {
    term: "전부개정법률안",
    shortDesc: "기존 법을 전면적으로 다시 쓰는 법안입니다.",
    fullDesc:
      "법률의 체계나 내용이 크게 달라져야 할 때, 기존 법 전체를 새로 작성하는 법안입니다. 법률 번호는 유지되지만 내용은 완전히 새로워집니다.",
    category: "bill",
  },
  enactment: {
    term: "제정법률안",
    shortDesc: "완전히 새로운 법을 만드는 법안입니다.",
    fullDesc:
      "기존에 없던 법률을 새로 만드는 법안입니다. 새로운 사회 현상이나 정책 수요에 대응하기 위해 발의됩니다.",
    category: "bill",
  },
  proposer_count: {
    term: "○○ 외 N인",
    shortDesc: "대표발의자 + 공동발의자 수를 합친 표현입니다.",
    fullDesc:
      "예를 들어 '홍길동 외 20인'은 대표발의자 홍길동 + 공동발의자 20명 = 총 21명이 참여했다는 뜻입니다. 법안 발의에는 최소 10명의 찬성이 필요합니다.",
    category: "bill",
  },
  referral: {
    term: "회부",
    shortDesc: "발의된 법안이 담당 위원회로 넘겨지는 것입니다.",
    fullDesc:
      "발의된 법안은 국회의장이 해당 법안의 소관 상임위원회를 정하여 넘기는데, 이를 회부라 합니다. 회부 이후 위원회에서 본격적인 심사가 시작됩니다.",
    category: "bill",
  },
  tabling: {
    term: "상정",
    shortDesc: "법안이 회의 안건으로 올라가는 것입니다.",
    fullDesc:
      "위원회나 본회의에서 특정 법안을 공식 안건으로 채택하여 논의를 시작하는 것입니다. 상정되어야 심사와 표결이 가능합니다.",
    category: "bill",
  },
  attendance_rate: {
    term: "출석률",
    shortDesc: "본회의(전체 회의) 표결에 참석한 비율입니다.",
    fullDesc:
      "전체 본회의 표결 중 의원이 실제로 참여한 비율입니다. 출장, 질병 등으로 불참할 수 있으며, 출석률은 의원의 의정활동 성실도를 보여주는 지표 중 하나입니다.",
    category: "activity",
  },

  // === 투표 행위 ===
  vote_yes: {
    term: "찬성",
    shortDesc: "의원이 법안에 찬성 투표를 한 경우입니다.",
    category: "vote",
  },
  vote_no: {
    term: "반대",
    shortDesc: "의원이 법안에 반대 투표를 한 경우입니다.",
    category: "vote",
  },
  vote_abstain: {
    term: "기권",
    shortDesc: "출석했지만 찬성/반대 의사를 밝히지 않은 경우입니다.",
    fullDesc:
      "본회의에 출석했으나 투표 버튼을 누르지 않거나 의사 표시를 하지 않은 경우입니다. 의도적으로 판단을 유보하거나 중립적 입장을 취할 때 사용됩니다.",
    category: "vote",
  },
  vote_absent: {
    term: "불참",
    shortDesc: "본회의 표결에 참석하지 않은 경우입니다.",
    fullDesc:
      "본회의 표결 시간에 회의장에 없어 투표에 참여하지 못한 경우입니다. 해외 출장, 질병, 기타 사유로 결석한 경우가 포함됩니다.",
    category: "vote",
  },

  // === 의정활동 ===
  plenary: {
    term: "본회의",
    shortDesc: "국회의원 전체가 모여 법안을 최종 결정하는 회의입니다.",
    fullDesc:
      "재적의원 과반수(현재 150명 이상)가 출석하여 법안을 최종 의결하는 국회의 공식 회의입니다. 위원회 심사를 거친 법안이 본회의에 상정되어 표결로 통과 여부가 결정됩니다.",
    category: "activity",
  },
  standing_committee: {
    term: "상임위원회",
    shortDesc: "특정 분야의 법안을 전문적으로 심사하는 상설 위원회입니다.",
    fullDesc:
      "국회에는 기획재정, 법제사법, 국방 등 17개의 상임위원회가 있으며, 각 분야별로 법안을 검토하고 예산을 심사합니다. 모든 법안은 본회의 전에 반드시 소관 상임위원회의 심사를 거쳐야 합니다.",
    category: "committee",
  },
  special_committee: {
    term: "특별위원회",
    shortDesc: "특정 안건이나 현안을 다루기 위해 한시적으로 구성된 위원회입니다.",
    fullDesc:
      "국가적 현안이나 특정 사안을 집중 논의하기 위해 임시로 만들어지는 위원회입니다. 예산안을 심사하는 예산결산특별위원회가 대표적입니다.",
    category: "committee",
  },
  committee_chair: {
    term: "위원장",
    shortDesc: "위원회를 대표하고 회의를 주재하는 의원입니다.",
    fullDesc:
      "위원회를 대표하고 의사를 정리하며, 위원회의 질서를 유지합니다. 위원회의 안건 상정 권한과 회의 진행 권한을 가집니다.",
    category: "committee",
  },
  committee_secretary: {
    term: "간사",
    shortDesc: "위원장을 보좌하고 위원회 실무를 담당하는 의원입니다.",
    fullDesc:
      "위원장을 보좌하고, 위원회 일정 및 안건 협의를 담당합니다. 여당과 야당에서 각각 1명씩 선출되어 위원회 운영의 실무를 책임집니다.",
    category: "committee",
  },
  committee_member: {
    term: "위원",
    shortDesc: "위원회에 소속되어 법안 심사에 참여하는 의원입니다.",
    fullDesc:
      "안건 심사, 질의, 토론 및 표결에 참여합니다. 각 의원은 1개의 상임위원회 위원으로 활동합니다.",
    category: "committee",
  },

  // === 국회 운영·절차 (2026-08 편집 확장) ===
  filibuster: {
    term: "필리버스터",
    shortDesc:
      "소수당이 표결을 막기 위해 시간 제한 없이 토론을 이어가는 합법적 의사진행 방해입니다.",
    fullDesc:
      "정식 명칭은 '무제한토론'으로, 국회법 제106조의2에 규정되어 있습니다. 재적의원 3분의 1 이상이 요구하면 시작되며, 한번 시작되면 의원 1인당 1회씩 시간 제한 없이 발언할 수 있습니다. 끝내는 방법은 두 가지입니다. 재적의원 3분의 1 이상이 종결동의를 제출하고 24시간 뒤 재적의원 5분의 3 이상이 찬성하면 종결되고, 회기가 끝나면 자동 종결됩니다. 회기 종료로 종결된 경우 해당 안건은 다음 회기 첫 본회의에서 지체 없이 표결에 부쳐집니다. 다수당의 일방 처리를 늦추는 소수당의 최후 수단인 동시에, 처리를 지연시킬 뿐 결국 표결을 막지는 못한다는 한계도 있습니다.",
    category: "activity",
    whyItMatters:
      "다수당과 소수당의 힘겨루기가 가장 극적으로 드러나는 장치입니다. 필리버스터가 시작됐다는 것은 여야 협상이 결렬됐다는 뜻이고, 회기 종료 시점과 맞물려 법안 처리 시점이 결정되기 때문에 정국 일정을 읽는 핵심 열쇠가 됩니다.",
    example: {
      title: "2026년 7월 패스트트랙 단축 국회법 개정안",
      description:
        "패스트트랙 심사 기간을 330일에서 90일로 줄이는 국회법 개정안이 7월 31일 본회의에 상정되자 국민의힘이 필리버스터로 맞섰습니다. 7월 임시국회 회기가 끝나면서 토론이 자동 종결됐고, 국회법에 따라 8월 임시국회 첫 본회의에서 표결을 앞두고 있습니다.",
      href: "/bills/PRC_G2L6B0Q7M2B8D1S7N0Y7T1Y2B9L7C7",
    },
    confusedWith: [
      {
        term: "안건조정위원회",
        note: "필리버스터는 본회의 표결을 늦추는 수단이고, 안건조정위원회는 위원회 단계에서 심사를 늦추는 수단입니다.",
      },
    ],
    relatedLinks: [
      { label: "본회의 표결 현황", href: "/votes" },
      { label: "국회 일정", href: "/schedule" },
    ],
    sources: [{ label: "국회법 제106조의2 (무제한토론)", href: LAW_ASSEMBLY }],
    reviewedAt: "2026-08-04",
  },
  fast_track: {
    term: "패스트트랙",
    shortDesc: "여야 대립으로 막힌 법안을 일정 기간이 지나면 자동으로 본회의에 올리는 제도입니다.",
    fullDesc:
      "정식 명칭은 '신속처리안건'으로, 국회법 제85조의2에 규정되어 있습니다. 재적의원 과반수(또는 소관 위원회 재적위원 과반수)가 지정을 요구하고, 무기명투표에서 5분의 3 이상이 찬성하면 지정됩니다. 지정된 안건은 위원회 심사 최장 180일, 법제사법위원회 체계자구심사 최장 90일, 본회의 부의 후 60일이 지나면 자동으로 다음 단계로 넘어가 최장 330일 안에 반드시 본회의 표결까지 도달합니다. 위원회가 법안을 무기한 붙잡아 두는 것을 막기 위해 2012년 국회선진화법의 일부로 도입됐습니다.",
    category: "bill",
    whyItMatters:
      "소수당이 반대하는 쟁점 법안도 시간이 지나면 반드시 표결된다는 뜻이라, 패스트트랙 지정 여부 자체가 정국의 최대 쟁점이 되곤 합니다. 2026년 8월 현재 이 기간을 90일로 줄이는 개정안이 표결을 앞두고 있어, 통과되면 쟁점 법안의 처리 속도가 근본적으로 달라집니다.",
    example: {
      title: "패스트트랙 기간을 90일로 줄이는 국회법 개정안 (2026)",
      description:
        "위원회 180일·법사위 90일·본회의 60일로 나뉜 심사 기간을 대폭 단축해 최장 330일을 90일로 줄이는 국회법 개정안(위원회 대안)이 2026년 7월 발의되어 본회의 표결을 앞두고 있습니다.",
      href: "/bills/PRC_G2L6B0Q7M2B8D1S7N0Y7T1Y2B9L7C7",
    },
    confusedWith: [
      {
        term: "본회의 직회부",
        note: "패스트트랙은 '기간 경과 시 자동 진행'이고, 직회부는 법사위가 60일 넘게 심사를 마치지 않을 때 소관 위원회가 본회의 부의를 '요구'하는 별개 절차입니다.",
      },
    ],
    relatedLinks: [{ label: "법안 검색", href: "/bills" }],
    sources: [{ label: "국회법 제85조의2 (안건의 신속처리)", href: LAW_ASSEMBLY }],
    reviewedAt: "2026-08-04",
  },
  direct_referral: {
    term: "본회의 직회부",
    shortDesc: "법사위가 법안을 오래 붙잡고 있을 때 상임위가 본회의로 바로 올려보내는 절차입니다.",
    fullDesc:
      "국회법 제86조에 따라, 법제사법위원회가 회부된 법안의 체계자구심사를 이유 없이 60일 안에 마치지 않으면 소관 상임위원회는 재적위원 5분의 3 이상 찬성으로 본회의 부의를 요구할 수 있습니다. 요구 후 30일 안에 여야 합의가 이뤄지지 않으면 그 뒤 처음 열리는 본회의에서 부의 여부를 무기명투표로 결정합니다. 법사위가 사실상 '상원'처럼 법안을 막는다는 비판에 대응해 만들어진 우회로입니다.",
    category: "bill",
    whyItMatters:
      "법사위원장을 어느 당이 맡는지가 국회 원 구성 협상의 최대 쟁점이 되는 이유가 바로 이 제도와 맞닿아 있습니다. 법사위가 야당 몫이면 직회부가 다수당의 우회 수단으로, 여당 몫이면 직회부가 불필요해지는 구도가 됩니다.",
    confusedWith: [
      {
        term: "패스트트랙",
        note: "직회부는 법사위 지연에 대한 대응 수단이고, 패스트트랙은 처음부터 전체 일정에 시한을 거는 제도입니다.",
      },
    ],
    relatedLinks: [{ label: "위원회 현황", href: "/committees" }],
    sources: [{ label: "국회법 제86조 (체계·자구의 심사)", href: LAW_ASSEMBLY }],
    reviewedAt: "2026-08-04",
  },
  veto: {
    term: "재의요구권",
    shortDesc: "대통령이 국회를 통과한 법안에 서명하지 않고 다시 논의하라며 돌려보내는 권한입니다.",
    fullDesc:
      "흔히 '거부권'이라 부르며 헌법 제53조에 규정되어 있습니다. 법률안이 정부로 이송되면 대통령은 15일 안에 공포해야 하는데, 이의가 있으면 이의서를 붙여 국회로 돌려보내 재의를 요구할 수 있습니다. 국회가 재적의원 과반수 출석과 출석의원 3분의 2 이상 찬성으로 다시 의결하면 그 법안은 대통령 서명 없이도 법률로 확정됩니다. 3분의 2는 일반 의결 요건보다 훨씬 높아, 재의결 성사 여부는 여야 의석 분포에 따라 갈립니다.",
    category: "bill",
    whyItMatters:
      "행정부와 입법부가 정면 충돌할 때 등장하는 최종 카드입니다. 재의요구된 법안의 재표결은 무기명투표로 진행되기 때문에 여당 내 이탈표가 변수로 떠오르며, 정국의 향방을 가르는 분수령이 되곤 합니다.",
    confusedWith: [
      {
        term: "공포",
        note: "공포는 통과된 법률을 확정·공표하는 정상 절차이고, 재의요구는 그 공포를 거부하고 국회로 되돌리는 예외 절차입니다.",
      },
    ],
    relatedLinks: [{ label: "본회의 표결 현황", href: "/votes" }],
    sources: [{ label: "대한민국헌법 제53조", href: LAW_CONSTITUTION }],
    reviewedAt: "2026-08-04",
  },
  promulgation: {
    term: "공포",
    shortDesc: "국회를 통과한 법률을 대통령이 서명해 국민에게 공식 알리는 절차입니다.",
    fullDesc:
      "헌법 제53조에 따라 국회에서 의결된 법률안은 정부로 이송되고, 대통령은 15일 이내에 공포합니다. 15일 안에 공포도 재의요구도 하지 않으면 그 법률안은 자동으로 법률로 확정됩니다. 공포는 관보 게재로 이뤄지며, 특별한 규정이 없으면 공포한 날부터 20일이 지나야 효력이 발생합니다. 법안 상세 페이지에서 '공포' 단계까지 도달했다면 그 법은 이미 확정된 것입니다.",
    category: "bill",
    whyItMatters:
      "본회의 가결이 곧 시행을 뜻하지는 않습니다. 공포일과 시행일(부칙에 명시)을 확인해야 실제로 언제부터 법이 적용되는지 알 수 있습니다.",
    confusedWith: [
      {
        term: "가결",
        note: "가결은 국회 표결 통과, 공포는 그 이후 대통령이 법률을 확정하는 단계입니다. 가결과 시행 사이에는 공포와 유예기간이 있습니다.",
      },
    ],
    relatedLinks: [{ label: "법안 검색", href: "/bills" }],
    sources: [{ label: "대한민국헌법 제53조", href: LAW_CONSTITUTION }],
    reviewedAt: "2026-08-04",
  },
  negotiating_group: {
    term: "교섭단체",
    shortDesc: "국회 운영을 협상할 자격을 갖는 20인 이상 의원 모임입니다.",
    fullDesc:
      "국회법 제33조에 따라 소속 의원 20인 이상인 정당은 하나의 교섭단체가 되고, 어느 교섭단체에도 속하지 않는 의원 20인 이상이 따로 구성할 수도 있습니다. 교섭단체는 원내대표를 통해 국회 의사일정, 상임위원장 배분, 발언 시간 등을 협상하며, 위원회 위원 배정과 정책연구위원 지원 등에서도 기준이 됩니다. 의석이 19석이면 이 모든 협상 테이블에서 빠지게 되어, 20석은 소수 정당에게 사활이 걸린 숫자입니다.",
    category: "activity",
    whyItMatters:
      "뉴스에서 '여야 원내대표 협상'이라고 할 때 그 협상 주체가 바로 교섭단체입니다. 국회 일정이 왜 멈췄는지, 상임위원장을 왜 나눠 갖는지 이해하려면 교섭단체 구조를 알아야 합니다.",
    relatedLinks: [
      { label: "정당별 의석 현황", href: "/members" },
      { label: "위원회 현황", href: "/committees" },
    ],
    sources: [{ label: "국회법 제33조 (교섭단체)", href: LAW_ASSEMBLY }],
    reviewedAt: "2026-08-04",
  },
  extraordinary_session: {
    term: "임시국회",
    shortDesc: "정기국회 외에 필요할 때 소집되는 국회 회기로, 회기는 30일 이내입니다.",
    fullDesc:
      "정식 명칭은 '임시회'입니다. 헌법 제47조에 따라 대통령 또는 재적의원 4분의 1 이상의 요구로 소집되며 회기는 30일을 넘길 수 없습니다. 국회법 제5조의2는 연간 기본일정으로 2·3·4·5·6월 1일과 8월 16일에 임시회를 열도록 정해 두어, 요구가 없어도 정례적으로 소집됩니다. 회기가 끝나면 처리되지 못한 안건의 필리버스터가 자동 종결되는 등 회기 경계 자체가 정치 전략의 도구가 되기도 합니다.",
    category: "activity",
    whyItMatters:
      "쟁점 법안의 처리 시점은 임시국회 소집일과 회기 종료일에 좌우됩니다. 2026년 8월 임시국회처럼 자동 소집일(16일)보다 앞당겨 소집을 요구하는 것도 필리버스터 종결·표결 시점을 계산한 전략적 행동입니다.",
    example: {
      title: "2026년 8월 임시국회",
      description:
        "국회법상 8월 16일 자동 소집이지만 국민의힘이 먼저 소집을 요구해 8월 2일부터 회기가 시작됐습니다. 직전 회기 종료로 필리버스터가 자동 종결된 패스트트랙 단축 국회법 개정안이 첫 본회의 표결 안건으로 걸려 있습니다.",
      href: "/bills/PRC_G2L6B0Q7M2B8D1S7N0Y7T1Y2B9L7C7",
    },
    confusedWith: [
      {
        term: "정기국회",
        note: "정기국회는 매년 9월 1일 열리는 100일짜리 정례 회기이고, 임시국회는 그 외 기간에 30일 이내로 열리는 회기입니다.",
      },
    ],
    relatedLinks: [{ label: "국회 일정", href: "/schedule" }],
    sources: [
      { label: "대한민국헌법 제47조", href: LAW_CONSTITUTION },
      { label: "국회법 제5조의2 (연간 국회 운영 기본일정)", href: LAW_ASSEMBLY },
    ],
    reviewedAt: "2026-08-04",
  },
  regular_session: {
    term: "정기국회",
    shortDesc: "매년 9월 1일 열리는 100일간의 정례 국회로, 국정감사와 예산 심사를 합니다.",
    fullDesc:
      "정식 명칭은 '정기회'입니다. 헌법 제47조와 국회법 제4조에 따라 매년 9월 1일(공휴일이면 다음 날) 집회하며 회기는 100일을 넘길 수 없습니다. 이 기간에 다음 해 예산안 심사와 국정감사가 이뤄지기 때문에 1년 중 국회가 가장 바쁜 시기입니다. 예산안은 헌법상 12월 2일까지 의결해야 하므로 정기국회 후반부는 예산 정국으로 흘러갑니다.",
    category: "activity",
    whyItMatters:
      "법안 처리량과 언론 보도가 가장 몰리는 시기입니다. 정기국회 개회(9/1) 전에 각 당이 당론과 입법 과제를 정비하는 8월의 움직임까지 함께 보면 하반기 정국을 예측할 수 있습니다.",
    confusedWith: [
      {
        term: "임시국회",
        note: "정기국회는 연 1회 100일, 임시국회는 수시 30일 이내라는 점이 다릅니다.",
      },
    ],
    relatedLinks: [{ label: "국회 일정", href: "/schedule" }],
    sources: [
      { label: "대한민국헌법 제47조", href: LAW_CONSTITUTION },
      { label: "국회법 제4조 (정기회)", href: LAW_ASSEMBLY },
    ],
    reviewedAt: "2026-08-04",
  },
  quorum: {
    term: "의결정족수",
    shortDesc: "안건을 의결하는 데 필요한 최소 출석·찬성 인원 기준입니다.",
    fullDesc:
      "헌법 제49조에 따라 일반 안건은 재적의원 과반수 출석과 출석의원 과반수 찬성으로 의결합니다(일반정족수). 사안이 무거울수록 요건이 높아지는데, 헌법개정안은 재적 3분의 2 이상, 대통령이 재의요구한 법률안의 재의결은 출석 3분의 2 이상, 패스트트랙 지정과 필리버스터 종결은 재적 5분의 3 이상이 필요합니다(특별정족수). 어떤 안건에 어떤 정족수가 적용되는지가 곧 각 정당의 의석수 계산과 직결됩니다.",
    category: "vote",
    whyItMatters:
      "'과반이면 다 할 수 있다'는 오해를 바로잡는 개념입니다. 재적 5분의 3(180석), 3분의 2(200석) 같은 문턱이 어디에 걸려 있는지 알면, 어떤 법안이 실제로 통과 가능한지 의석수만으로 가늠할 수 있습니다.",
    relatedLinks: [
      { label: "본회의 표결 현황", href: "/votes" },
      { label: "정당별 의석 현황", href: "/members" },
    ],
    sources: [{ label: "대한민국헌법 제49조", href: LAW_CONSTITUTION }],
    reviewedAt: "2026-08-04",
  },
  confirmation_hearing: {
    term: "인사청문회",
    shortDesc: "고위공직 후보자의 자질을 국회가 검증하는 절차입니다.",
    fullDesc:
      "인사청문회법에 따라 국무총리·대법원장·헌법재판소장·감사원장 등과 국무위원(장관) 후보자는 국회 인사청문회를 거칩니다. 국무총리·대법원장 등은 국회 본회의의 임명동의 표결까지 통과해야 임명될 수 있지만, 장관은 청문보고서 채택 여부와 관계없이 대통령이 임명할 수 있다는 차이가 있습니다. 이 차이 때문에 장관 인사청문회는 '검증은 하되 막을 수는 없는' 절차라는 평가를 받기도 합니다.",
    category: "activity",
    whyItMatters:
      "임명동의가 필요한 자리(총리 등)는 국회 표결이 실질적 관문이 됩니다. 2026년 6월 한성숙 국무총리 후보자가 인사청문회를 거쳐 6월 30일 본회의 임명동의안 가결로 취임한 것이 대표적입니다.",
    example: {
      title: "한성숙 국무총리 임명동의 (2026년 6월)",
      description:
        "한성숙 후보자는 6월 인사청문회를 거쳐 6월 30일 본회의에서 임명동의안이 가결됐고 7월 1일 취임했습니다. 총리는 장관과 달리 국회 동의 없이는 임명될 수 없습니다.",
      href: "/votes",
    },
    relatedLinks: [{ label: "본회의 표결 현황", href: "/votes" }],
    sources: [{ label: "인사청문회법", href: "https://www.law.go.kr/법령/인사청문회법" }],
    reviewedAt: "2026-08-04",
  },
  parliamentary_audit: {
    term: "국정감사",
    shortDesc: "국회가 매년 정부 부처와 공공기관의 국정 전반을 정기적으로 점검하는 제도입니다.",
    fullDesc:
      "국정감사 및 조사에 관한 법률에 따라 매년 정기회 집회일 이전에 30일 이내의 기간을 정해 실시합니다(본회의 의결로 정기회 중에 할 수도 있습니다). 각 상임위원회가 소관 부처·기관을 나눠 감사하며, 장관과 기관장을 출석시켜 질의하고 자료 제출을 요구합니다. 국정 '전반'을 대상으로 하는 정례 점검이라는 점에서, 특정 사안을 파고드는 국정조사와 구별됩니다.",
    category: "activity",
    whyItMatters:
      "의원 개개인의 정책 역량이 가장 드러나는 무대로, 매년 9~10월 뉴스의 중심이 됩니다. 의원별 질의와 피감기관 대응을 보면 각 의원이 어떤 분야에 집중하는지 알 수 있습니다.",
    confusedWith: [
      {
        term: "국정조사",
        note: "국정감사는 매년 국정 전반을 보는 정례 절차, 국정조사는 특정 사안을 요구가 있을 때만 조사하는 절차입니다.",
      },
    ],
    relatedLinks: [{ label: "위원회 현황", href: "/committees" }],
    sources: [
      {
        label: "국정감사 및 조사에 관한 법률",
        href: "https://www.law.go.kr/법령/국정감사및조사에관한법률",
      },
    ],
    reviewedAt: "2026-08-04",
  },
  parliamentary_investigation: {
    term: "국정조사",
    shortDesc: "특정 사안에 대해 국회가 요구를 받아 벌이는 집중 조사입니다.",
    fullDesc:
      "재적의원 4분의 1 이상의 요구가 있으면 국회는 특정한 국정 사안을 조사할 수 있습니다. 조사를 맡을 특별위원회를 구성하거나 상임위원회에 맡기고, 조사계획서를 본회의에서 승인받아 진행합니다. 청문회를 열어 증인을 출석시킬 수 있으며 정당한 이유 없이 불출석하면 처벌 대상이 됩니다. 다만 조사 범위·기간·증인 채택을 두고 여야가 대립해 계획서 승인 단계부터 표류하는 경우도 많습니다.",
    category: "activity",
    whyItMatters:
      "대형 사건·사고나 정책 실패가 터졌을 때 '국정조사 요구'는 야당의 주요 공세 수단입니다. 2026년 8월 국민의힘이 주식시장 급변동에 대한 국정조사를 제안한 것처럼, 실제 개시 여부보다 요구 자체가 정국의 쟁점이 되기도 합니다.",
    confusedWith: [
      {
        term: "국정감사",
        note: "국정조사는 특정 사안·수시, 국정감사는 국정 전반·정례라는 차이가 있습니다.",
      },
    ],
    relatedLinks: [{ label: "위원회 현황", href: "/committees" }],
    sources: [
      {
        label: "국정감사 및 조사에 관한 법률",
        href: "https://www.law.go.kr/법령/국정감사및조사에관한법률",
      },
    ],
    reviewedAt: "2026-08-04",
  },
  mediation_committee: {
    term: "안건조정위원회",
    shortDesc: "위원회에서 여야 이견이 큰 법안을 최장 90일간 조정하는 소위원회입니다.",
    fullDesc:
      "국회법 제57조의2에 따라 이견을 조정할 필요가 있는 안건에 대해 재적위원 3분의 1 이상의 요구로 구성됩니다. 위원은 6명으로 제1교섭단체 소속 3명과 그 외 3명을 같은 수로 맞추며, 재적 조정위원 3분의 2 이상 찬성으로 의결합니다. 활동 기한은 최장 90일입니다. 소수당이 쟁점 법안의 위원회 처리를 늦추는 카드로 쓰이지만, 다수당이 조정위원 구성을 우호적으로 확보하면 오히려 빠르게 의결되기도 합니다.",
    category: "committee",
    whyItMatters:
      "위원회 단계의 '미니 필리버스터'라 불릴 만큼, 쟁점 법안 뉴스에서 자주 등장합니다. 안건조정위 구성 요구가 나왔다는 것은 해당 상임위에서 여야 협상이 깨졌다는 신호입니다.",
    confusedWith: [
      {
        term: "필리버스터",
        note: "안건조정위는 위원회 단계에서 최장 90일, 필리버스터는 본회의 단계에서 회기 종료 시까지 지연시키는 수단입니다.",
      },
    ],
    relatedLinks: [{ label: "위원회 현황", href: "/committees" }],
    sources: [{ label: "국회법 제57조의2 (안건조정위원회)", href: LAW_ASSEMBLY }],
    reviewedAt: "2026-08-04",
  },
  deliberation_period: {
    term: "숙려기간",
    shortDesc: "발의된 법안을 위원회가 바로 상정하지 않고 기다려야 하는 최소 검토 기간입니다.",
    fullDesc:
      "국회법 제59조에 따라 위원회는 법안이 회부된 뒤 일부개정법률안은 15일, 제정법률안과 전부개정법률안은 20일이 지나야 상정할 수 있습니다. 의원과 이해관계자들이 법안 내용을 검토할 최소한의 시간을 보장하려는 취지입니다. 다만 긴급하고 불가피한 사유가 있으면 위원회 의결로 이 기간을 건너뛸 수 있어, 쟁점 법안의 속도전 국면에서는 숙려기간 생략 여부가 논란이 되기도 합니다.",
    category: "bill",
    whyItMatters:
      "발의 직후 법안이 왜 바로 심사되지 않는지 설명해 주는 규정입니다. 반대로 숙려기간을 생략하고 당일 상정·의결하는 경우는 그만큼 처리 의지가 강하다는 신호로 읽힙니다.",
    relatedLinks: [{ label: "법안 검색", href: "/bills" }],
    sources: [{ label: "국회법 제59조 (의안의 상정시기)", href: LAW_ASSEMBLY }],
    reviewedAt: "2026-08-04",
  },
  legal_review: {
    term: "체계자구심사",
    shortDesc: "법사위가 다른 위원회를 통과한 법안의 법체계와 문구를 최종 점검하는 심사입니다.",
    fullDesc:
      "국회법 제86조에 따라 상임위원회 심사를 마친 법안은 본회의에 오르기 전 법제사법위원회의 체계자구심사를 거칩니다. '체계'는 다른 법률과의 충돌·모순 여부, '자구'는 법률 문장의 표현을 뜻합니다. 형식 심사가 원칙이지만 실제로는 법사위가 내용에 개입해 법안을 지연시킨다는 '월권' 논란이 반복돼 왔고, 이에 대한 견제 장치로 60일 경과 시 본회의 직회부 제도가 도입됐습니다.",
    category: "committee",
    whyItMatters:
      "법사위가 '제2의 관문'이라 불리는 이유이자, 원 구성 협상에서 법사위원장 자리를 두고 여야가 싸우는 이유입니다. 상임위를 통과한 법안이 왜 몇 달씩 멈춰 있는지 볼 때 가장 먼저 확인할 단계입니다.",
    confusedWith: [
      {
        term: "위원회 심사",
        note: "위원회 심사는 소관 상임위의 내용 심사, 체계자구심사는 그 이후 법사위의 형식 심사입니다.",
      },
    ],
    relatedLinks: [{ label: "법제사법위원회", href: "/committees/법제사법위원회" }],
    sources: [{ label: "국회법 제86조 (체계·자구의 심사)", href: LAW_ASSEMBLY }],
    reviewedAt: "2026-08-04",
  },
};

/**
 * 전체 용어 목록 조회
 */
export function getAllTerms(): GlossaryTerm[] {
  return Object.values(GLOSSARY);
}

/**
 * 카테고리별 용어 목록 조회
 */
export function getTermsByCategory(category: GlossaryTerm["category"]): GlossaryTerm[] {
  return Object.values(GLOSSARY).filter((term) => term.category === category);
}

/**
 * 용어 검색
 */
export function searchTerms(query: string): GlossaryTerm[] {
  const normalizedQuery = query.toLowerCase().trim();
  return Object.values(GLOSSARY).filter(
    (term) =>
      term.term.toLowerCase().includes(normalizedQuery) ||
      term.shortDesc.toLowerCase().includes(normalizedQuery) ||
      term.fullDesc?.toLowerCase().includes(normalizedQuery),
  );
}

/**
 * 특정 키로 용어 조회
 */
export function getTerm(key: string): GlossaryTerm | undefined {
  return GLOSSARY[key];
}

/**
 * 용어명(slug)으로 key와 용어 조회
 */
export function getTermBySlug(slug: string): { key: string; term: GlossaryTerm } | undefined {
  const decoded = decodeURIComponent(slug);
  const entry = Object.entries(GLOSSARY).find(([, v]) => v.term === decoded);
  if (!entry) return undefined;
  return { key: entry[0], term: entry[1] };
}

/**
 * 모든 용어의 key-term 목록 (정적 생성용)
 */
export function getAllTermSlugs(): { key: string; slug: string }[] {
  return Object.entries(GLOSSARY).map(([key, v]) => ({
    key,
    slug: v.term,
  }));
}
