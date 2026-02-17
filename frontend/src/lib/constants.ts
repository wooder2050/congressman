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
};

export const VOTE_RESULT_MAP = {
  passed: { label: "원안가결", color: "#111111", textColor: "#FFFFFF" },
  amended: { label: "수정가결", color: "#6B7280", textColor: "#FFFFFF" },
  rejected: { label: "부결", color: "#DC2626", textColor: "#FFFFFF" },
  discarded: { label: "폐기", color: "#E5E5E5", textColor: "#595959" },
  other: { label: "기타", color: "#F5F5F5", textColor: "#595959" },
} as const;

export const MEMBER_VOTE_RESULT_MAP = {
  yes: { label: "찬성", color: "#16A34A", textColor: "#FFFFFF" },
  no: { label: "반대", color: "#DC2626", textColor: "#FFFFFF" },
  abstain: { label: "기권", color: "#404040", textColor: "#FFFFFF" },
  absent: { label: "불참", color: "#D4D4D4", textColor: "#595959" },
} as const;

export const BILL_STATUS_MAP = {
  passed: { label: "가결", color: "#0F766E", textColor: "#FFFFFF" },
  pending: { label: "계류", color: "#737373", textColor: "#FFFFFF" },
  discarded: { label: "폐기", color: "#D4D4D4", textColor: "#595959" },
  committee: { label: "위원회 심사", color: "#111111", textColor: "#FFFFFF" },
} as const;
