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
}

export const GLOSSARY: Record<string, GlossaryTerm> = {
  // === 법안 상태 ===
  passed: {
    term: "가결",
    shortDesc: "법안이 본회의에서 통과된 상태입니다.",
    fullDesc:
      "법안이 국회 본회의에서 재적의원 과반수 출석, 출석의원 과반수 찬성으로 통과된 상태를 말합니다. 가결된 법안은 정부로 이송되어 공포 절차를 거칩니다.",
    category: "bill",
  },
  pending: {
    term: "계류",
    shortDesc: "위원회에서 심사 중이거나 본회의 상정을 기다리는 상태입니다.",
    fullDesc:
      "발의된 법안이 아직 처리되지 않고 위원회 심사 단계에 머물러 있거나 본회의 상정을 기다리고 있는 상태입니다. 대부분의 법안이 이 단계에서 오랜 시간을 보냅니다.",
    category: "bill",
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
      "같은 주제의 여러 법안이 발의되었을 때, 위원회가 이들의 장점을 모아 새로운 법안으로 통합한 것입니다. 개별 법안보다 더 나은 내용으로 만들어집니다.",
    category: "bill",
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
};

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
