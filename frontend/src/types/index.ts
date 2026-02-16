// ====== 국회 대수 ======
export interface AssemblyTerm {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

// ====== 정당 ======
export interface Party {
  id: string;
  name: string;
  shortName: string;
  color: string;
}

// ====== 의원 (사람) ======
export interface Member {
  id: string;
  name: string;
  photoUrl: string;
  birthDate?: string;
  electedCount: number;
}

// ====== 의원 대수별 활동 ======
export interface MemberTerm {
  memberId: string;
  termId: number;
  party: Party;
  district: string;
  proportional: boolean;
  committees: string[];
}

// ====== 출석 ======
export interface AttendanceRecord {
  memberId: string;
  termId: number;
  totalSessions: number;
  attended: number;
  absent: number;
  leave: number;
  travel: number;
  rate: number;
}

export interface AbsenceDetail {
  type: "무단결석" | "청가" | "출장" | "질병";
  count: number;
}

// ====== 법안 ======
export interface Bill {
  id: string;
  title: string;
  proposerIds: string[];
  proposerName: string;
  coProposerCount: number;
  status: "passed" | "pending" | "discarded" | "committee";
  proposedDate: string;
  termId: number;
  committee?: string;
}

// ====== 표결 ======
export interface Vote {
  id: string;
  billNo: string;
  billName: string;
  committee?: string;
  procDate: string;
  procResult: string;
  resultCode: "passed" | "amended" | "rejected" | "discarded" | "other";
  memberTotal: number;
  voteTotal: number;
  yesCount: number;
  noCount: number;
  abstainCount: number;
  linkUrl: string;
  termId: number;
}

export interface VoteSummary {
  total: number;
  passed: number;
  amended: number;
  rejected: number;
  discarded: number;
}

// ====== 의원별 표결 ======
export type MemberVoteResult = "yes" | "no" | "abstain" | "absent";

export interface MemberVoteRecord {
  voteId: string;
  billName: string;
  billNo: string;
  procDate: string;
  procResult: string;
  resultCode: "passed" | "amended" | "rejected" | "discarded" | "other";
  memberResult: MemberVoteResult;
  committee?: string;
}

export interface MemberVoteSummary {
  yes: number;
  no: number;
  abstain: number;
  absent: number;
  total: number;
}

export interface MemberVotesResponse {
  votes: MemberVoteRecord[];
  summary: MemberVoteSummary;
  total: number;
}

// ====== 역대 활동 비교 ======
export interface TermActivity {
  termId: number;
  termName: string;
  attendanceRate: number;
  billsProposed: number;
  billsPassed: number;
}

// ====== 재산 ======
export interface AssetCategory {
  category: string;
  amount: number;
}

export interface AssetYear {
  year: number;
  total: number;
  categories: AssetCategory[];
}

export interface AssetDetail {
  year: number;
  category: string;
  item: string;
  amount: number;
  relation: string;
}

export interface AssetResponse {
  years: AssetYear[];
  details: AssetDetail[];
}

// ====== 의원 + 대수 정보 결합 ======
export interface MemberWithTerm extends Member {
  term: MemberTerm;
}
