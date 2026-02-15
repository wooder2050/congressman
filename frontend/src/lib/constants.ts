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
  independent: {
    id: "independent",
    name: "무소속",
    shortName: "무소속",
    color: "#999999",
  },
};

export const VOTE_RESULT_MAP = {
  passed: { label: "원안가결", color: "#16A34A" },
  amended: { label: "수정가결", color: "#2563EB" },
  rejected: { label: "부결", color: "#DC2626" },
  discarded: { label: "폐기", color: "#6B7280" },
  other: { label: "기타", color: "#9CA3AF" },
} as const;

export const BILL_STATUS_MAP = {
  passed: { label: "가결", color: "#16A34A" },
  pending: { label: "계류", color: "#CA8A04" },
  discarded: { label: "폐기", color: "#6B7280" },
  committee: { label: "위원회 심사", color: "#1B56DB" },
} as const;
