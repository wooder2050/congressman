import type { Party } from "@/types";

export const PARTIES: Record<string, Party> = {
  democratic: {
    id: "democratic",
    name: "더불어민주당",
    shortName: "민주당",
    color: "#1B56DB",
  },
  ppp: {
    id: "ppp",
    name: "국민의힘",
    shortName: "국민의힘",
    color: "#E61E2B",
  },
  rebuilding: {
    id: "rebuilding",
    name: "조국혁신당",
    shortName: "혁신당",
    color: "#003DA5",
  },
  reform: {
    id: "reform",
    name: "개혁신당",
    shortName: "개혁신당",
    color: "#F37924",
  },
  progressive: {
    id: "progressive",
    name: "진보당",
    shortName: "진보당",
    color: "#D6001C",
  },
  "basic-income": {
    id: "basic-income",
    name: "기본소득당",
    shortName: "기본소득당",
    color: "#00D2C3",
  },
  "social-democratic": {
    id: "social-democratic",
    name: "사회민주당",
    shortName: "사민당",
    color: "#F58400",
  },
  "new-future": {
    id: "new-future",
    name: "새로운미래",
    shortName: "새미래",
    color: "#45BABD",
  },
  independent: {
    id: "independent",
    name: "무소속",
    shortName: "무소속",
    color: "#999999",
  },
  // 21대
  citizens: {
    id: "citizens",
    name: "더불어시민당",
    shortName: "시민당",
    color: "#1B56DB",
  },
  "united-future": {
    id: "united-future",
    name: "미래통합당",
    shortName: "미래통합",
    color: "#E61E2B",
  },
  "future-korea": {
    id: "future-korea",
    name: "미래한국당",
    shortName: "미래한국",
    color: "#E61E2B",
  },
  justice: {
    id: "justice",
    name: "정의당",
    shortName: "정의당",
    color: "#FFCC00",
  },
  peoples: {
    id: "peoples",
    name: "국민의당",
    shortName: "국민의당",
    color: "#EA5504",
  },
  "open-democratic": {
    id: "open-democratic",
    name: "열린민주당",
    shortName: "열린민주",
    color: "#003DA5",
  },
  transition: {
    id: "transition",
    name: "시대전환",
    shortName: "시대전환",
    color: "#7A25CC",
  },
  "free-unification": {
    id: "free-unification",
    name: "자유통일당",
    shortName: "자유통일",
    color: "#004EA2",
  },
  // 20대
  saenuri: {
    id: "saenuri",
    name: "새누리당",
    shortName: "새누리",
    color: "#E61E2B",
  },
  "liberty-korea": {
    id: "liberty-korea",
    name: "자유한국당",
    shortName: "한국당",
    color: "#E61E2B",
  },
  minsaeng: {
    id: "minsaeng",
    name: "민생당",
    shortName: "민생당",
    color: "#45B5AA",
  },
  "bareun-mirae": {
    id: "bareun-mirae",
    name: "바른미래당",
    shortName: "바른미래",
    color: "#00B0CD",
  },
  "democratic-peace": {
    id: "democratic-peace",
    name: "민주평화당",
    shortName: "평화당",
    color: "#3FAE2A",
  },
  "our-republican": {
    id: "our-republican",
    name: "우리공화당",
    shortName: "공화당",
    color: "#E8306A",
  },
  minjung: {
    id: "minjung",
    name: "민중당",
    shortName: "민중당",
    color: "#E8451E",
  },
  chinpark: {
    id: "chinpark",
    name: "친박신당",
    shortName: "친박신당",
    color: "#FF6699",
  },
};

export const VOTE_RESULT_MAP = {
  passed: { label: "원안가결", color: "#111111", textColor: "#FFFFFF", termKey: "passed_original" },
  amended: {
    label: "수정가결",
    color: "#6B7280",
    textColor: "#FFFFFF",
    termKey: "passed_amended",
  },
  rejected: { label: "부결", color: "#DC2626", textColor: "#FFFFFF", termKey: "rejected" },
  discarded: {
    label: "폐기",
    color: "#E5E5E5",
    textColor: "#595959",
    termKey: "vote_discarded",
  },
  other: { label: "기타", color: "#F5F5F5", textColor: "#595959", termKey: undefined },
} as const;

export const MEMBER_VOTE_RESULT_MAP = {
  yes: { label: "찬성", color: "#16A34A", textColor: "#FFFFFF", termKey: "vote_yes" },
  no: { label: "반대", color: "#DC2626", textColor: "#FFFFFF", termKey: "vote_no" },
  abstain: { label: "기권", color: "#404040", textColor: "#FFFFFF", termKey: "vote_abstain" },
  absent: { label: "불참", color: "#D4D4D4", textColor: "#595959", termKey: "vote_absent" },
} as const;

export const BILL_STATUS_MAP = {
  passed: { label: "가결", color: "#0F766E", textColor: "#FFFFFF", termKey: "passed" },
  pending: { label: "계류", color: "#737373", textColor: "#FFFFFF", termKey: "pending" },
  discarded: { label: "폐기", color: "#D4D4D4", textColor: "#595959", termKey: "discarded" },
  committee: {
    label: "위원회 심사",
    color: "#111111",
    textColor: "#FFFFFF",
    termKey: "committee_review",
  },
} as const;

export const TOPIC_MAP: Record<string, { label: string; emoji: string }> = {
  "경제·산업": { label: "경제·산업", emoji: "💰" },
  "법·사법": { label: "법·사법", emoji: "⚖️" },
  "환경·에너지": { label: "환경·에너지", emoji: "🌱" },
  "노동·고용": { label: "노동·고용", emoji: "💼" },
  "보건·의료": { label: "보건·의료", emoji: "🏥" },
  "교통·물류": { label: "교통·물류", emoji: "🚗" },
  "부동산·주거": { label: "부동산·주거", emoji: "🏠" },
  "복지·돌봄": { label: "복지·돌봄", emoji: "🤝" },
  "육아·교육": { label: "육아·교육", emoji: "👶" },
  "행정·지방자치": { label: "행정·지방자치", emoji: "🏛️" },
  "농업·식품": { label: "농업·식품", emoji: "🌾" },
  "문화·체육": { label: "문화·체육", emoji: "🎭" },
  "과학기술·ICT": { label: "과학기술·ICT", emoji: "📱" },
  "외교·안보": { label: "외교·안보", emoji: "🌐" },
  "안전·치안": { label: "안전·치안", emoji: "🔒" },
};

// AI 요약이 topic 값을 자유 생성하면서 80종 이상으로 파편화됨(영문 27종 + 한글 유사값 다수).
// 예: "보건·의료"/"의료·건강"/"보건"/"health" 가 모두 같은 분야. 이를 TOPIC_MAP의 15개
// canonical 키로 정규화해, 목록 필터·색인 메타·topic 해설이 모든 법안에서 일관되게 동작하도록 한다.
const TOPIC_ALIASES: Record<string, string> = {
  // 경제·산업
  economy: "경제·산업",
  finance: "경제·산업",
  industry: "경제·산업",
  tax: "경제·산업",
  경제: "경제·산업",
  금융: "경제·산업",
  "세금·경제": "경제·산업",
  "산업·기술": "경제·산업",
  "재정·세제": "경제·산업",
  "예산·재정": "경제·산업",
  // 법·사법
  law: "법·사법",
  justice: "법·사법",
  human_rights: "법·사법",
  사법: "법·사법",
  "사법·인권": "법·사법",
  "복지·인권": "법·사법",
  // 환경·에너지
  environment: "환경·에너지",
  energy: "환경·에너지",
  환경: "환경·에너지",
  해양: "환경·에너지",
  "농림·환경": "환경·에너지",
  // 노동·고용
  labor: "노동·고용",
  고용: "노동·고용",
  "노동·일자리": "노동·고용",
  // 보건·의료
  health: "보건·의료",
  보건: "보건·의료",
  "의료·건강": "보건·의료",
  "보건·복지": "보건·의료",
  "복지·건강": "보건·의료",
  // 교통·물류
  transport: "교통·물류",
  transportation: "교통·물류",
  "교통·건설": "교통·물류",
  // 부동산·주거
  housing: "부동산·주거",
  부동산: "부동산·주거",
  "주택·부동산": "부동산·주거",
  // 복지·돌봄
  welfare: "복지·돌봄",
  "여성·가족": "복지·돌봄",
  청년정책: "복지·돌봄",
  // 육아·교육
  education: "육아·교육",
  "교육·학술": "육아·교육",
  "교육·문화": "육아·교육",
  // 행정·지방자치
  administration: "행정·지방자치",
  autonomy: "행정·지방자치",
  politics: "행정·지방자치",
  선거: "행정·지방자치",
  "선거·정치": "행정·지방자치",
  "행정·제도": "행정·지방자치",
  "행정·자치": "행정·지방자치",
  "행정·지방": "행정·지방자치",
  지방자치: "행정·지방자치",
  // 농업·식품
  agriculture: "농업·식품",
  농업: "농업·식품",
  "농림·수산": "농업·식품",
  // 문화·체육
  culture: "문화·체육",
  문화: "문화·체육",
  문화관광: "문화·체육",
  "역사·문화": "문화·체육",
  // 과학기술·ICT
  technology: "과학기술·ICT",
  science: "과학기술·ICT",
  digital: "과학기술·ICT",
  "기술·AI": "과학기술·ICT",
  "과학·기술": "과학기술·ICT",
  "과학기술·연구": "과학기술·ICT",
  "통신·방송": "과학기술·ICT",
  "방송·통신": "과학기술·ICT",
  "미디어·방송": "과학기술·ICT",
  // 외교·안보
  diplomacy: "외교·안보",
  defense: "외교·안보",
  외교: "외교·안보",
  국방: "외교·안보",
  "외교·국방": "외교·안보",
  "국방·외교": "외교·안보",
  "국방·안보": "외교·안보",
  // 안전·치안
  safety: "안전·치안",
  society: "안전·치안",
  "안전·재난": "안전·치안",
};

/**
 * 법안의 raw topic 값을 TOPIC_MAP의 15개 canonical 분야명으로 정규화한다.
 * 이미 canonical이면 그대로, alias면 매핑, 미등록 값(예: "기타")이면 null.
 */
export function normalizeTopic(topic: string | null | undefined): string | null {
  if (!topic) return null;
  if (topic in TOPIC_MAP) return topic;
  return TOPIC_ALIASES[topic] ?? null;
}

/**
 * 분야별 "왜 중요한가" 해설. canonical topic 15종 전부 커버.
 * (이전에는 BillDetailInner에 하드코딩되어 15개 한글 값만 매칭 → 파편화·영문 topic에서 미출력)
 */
export const TOPIC_EXPLANATIONS: Record<string, string> = {
  "보건·의료":
    " 국민의 건강권과 의료 접근성에 직접적인 영향을 미칩니다. 건강보험 보장 범위, 의료인력 확충, 공공의료 인프라 등 의료 정책의 방향을 결정짓는 중요한 입법 활동입니다.",
  "부동산·주거":
    " 국민의 주거 안정과 부동산 시장에 영향을 줍니다. 주택 공급, 임대차 보호, 부동산 세제 등 주거 정책은 국민 생활과 밀접하게 연결되어 있습니다.",
  "경제·산업":
    " 국가 경제 성장과 산업 경쟁력에 영향을 미칩니다. 기업 활동, 공정거래, 소비자 보호 등 경제 전반의 규칙을 정하는 중요한 법안입니다.",
  "노동·고용":
    " 근로자의 권리와 고용 환경에 직접적인 영향을 줍니다. 근로조건, 산업안전, 고용보험 등 노동 정책은 수천만 근로자의 삶의 질을 좌우합니다.",
  "육아·교육":
    " 미래 세대의 교육 환경과 보육 정책에 영향을 미칩니다. 교육 과정, 보육 지원, 학생 인권 등 교육 정책은 사회의 미래를 결정짓습니다.",
  "환경·에너지":
    " 기후변화 대응과 지속가능한 발전에 영향을 미칩니다. 탄소중립, 재생에너지, 환경오염 규제 등은 현세대와 미래 세대 모두에게 중요합니다.",
  "법·사법":
    " 법치주의의 근간을 이루는 사법 체계에 영향을 줍니다. 형사·민사 절차, 인권 보호, 사법 접근성 등 국민의 기본권과 직결됩니다.",
  "교통·물류":
    " 국민의 이동권과 물류 인프라에 영향을 미칩니다. 교통안전, 대중교통, 물류 효율화 등 일상생활과 밀접한 분야입니다.",
  "복지·돌봄":
    " 사회적 약자 보호와 복지 체계에 영향을 줍니다. 기초생활보장, 장애인 지원, 노인 돌봄 등 사회 안전망을 강화하는 입법 활동입니다.",
  "행정·지방자치":
    " 정부 운영과 지방자치 제도에 영향을 미칩니다. 행정 효율화, 지방분권, 공무원 제도 등 국가 행정의 기본 틀을 정합니다.",
  "농업·식품":
    " 농업인의 권익과 식품 안전에 영향을 줍니다. 농업 경쟁력 강화, 식품 위생, 농촌 지역 발전 등 1차 산업의 미래를 결정짓습니다.",
  "문화·체육":
    " 국민의 문화생활과 체육 활동에 영향을 미칩니다. 문화 진흥, 예술인 지원, 체육 시설 확충 등 삶의 질을 높이는 정책입니다.",
  "과학기술·ICT":
    " 기술 혁신과 디지털 경제에 영향을 미칩니다. AI·반도체·우주산업 등 첨단 기술 육성과 개인정보 보호 등 디지털 사회의 규범을 정합니다.",
  "외교·안보":
    " 국가 안보와 국제 관계에 영향을 미칩니다. 국방력 강화, 동맹 관계, 통상 정책 등 대한민국의 국제적 위상과 안전에 직결됩니다.",
  "안전·치안":
    " 국민의 안전과 치안 유지에 영향을 줍니다. 재난 대응, 범죄 예방, 소방·경찰 인력 등 안전한 사회를 만드는 기반이 됩니다.",
};
