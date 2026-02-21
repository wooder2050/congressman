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
  other: { label: "기타", color: "#F5F5F5", textColor: "#595959" },
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
