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

export interface BillSummary {
  total: number;
  passed: number;
  pending: number;
  discarded: number;
  committee: number;
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
  hasBill?: boolean;
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

// ====== 표결별 의원 투표 (좌석 시각화용) ======
export interface VoteMemberResult {
  memberId: string;
  memberName: string;
  photoUrl: string;
  result: MemberVoteResult;
  partyId: string;
  partyName: string;
  partyColor: string;
  district: string;
}

export interface VoteWithMemberVotes {
  vote: Vote;
  memberVotes: VoteMemberResult[];
}

// ====== 법안 발의자 (상세용) ======
export interface BillProposerInfo {
  memberId: string;
  memberName: string;
  photoUrl: string;
  partyId: string;
  partyName: string;
  partyColor: string;
  district: string;
}

// ====== 법안 상세 ======
export interface BillDetail extends Omit<Bill, "proposerIds"> {
  proposers: BillProposerInfo[];
  hasVote?: boolean;
  summary?: string | null;
  pdfUrl?: string | null;
  detailLink?: string | null;
}

// ====== 홈 통계 ======
export interface HomeStats {
  memberCount: number;
  billCount: number;
  voteCount: number;
  avgAttendanceRate: number;
  recentVotes: Vote[];
  recentBills: Bill[];
}

// ====== 의원 + 대수 정보 결합 ======
export interface MemberWithTerm extends Member {
  term: MemberTerm;
}
