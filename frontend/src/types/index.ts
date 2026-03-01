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
  career?: string | null;
}

// ====== 위원회 이력 ======
export interface CommitteeHistoryEntry {
  name: string;
  startDate: string; // "2020.07.06"
  endDate: string | null; // "2022.05.29" 또는 null(현재 소속)
}

// ====== 의원 대수별 활동 ======
export interface MemberTerm {
  memberId: string;
  termId: number;
  party: Party;
  district: string;
  proportional: boolean;
  committees: string[];
  committeeHistory: CommitteeHistoryEntry[];
  committeeRole: string; // "위원장", "간사", "위원"
  electedCount: number; // 해당 대수 기준 선수
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
  simpleSummary?: string | null;
  topic?: string | null;
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
  months?: { month: string; count: number }[];
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
  role: "representative" | "co";
  partyId: string;
  partyName: string;
  partyColor: string;
  district: string;
}

// ====== 법안 AI 요약 ======
export interface BillStructuredSummary {
  situation: string;
  problem: string;
  change: string;
  impact: string;
}

// ====== 법안 상세 ======
export interface BillDetail extends Omit<Bill, "proposerIds"> {
  proposers: BillProposerInfo[];
  hasVote?: boolean;
  summary?: string | null;
  simpleSummary?: string | null;
  structuredSummary?: BillStructuredSummary | null;
  topic?: string | null;
  pdfUrl?: string | null;
  detailLink?: string | null;
}

// ====== 월별 출석 ======
export interface MonthlyAttendance {
  month: string;
  attended: number;
  absent: number;
}

// ====== 위원회별 법안 ======
export interface CommitteeBillCount {
  committee: string;
  count: number;
}

export interface CommitteeActivity {
  committee: string;
  totalVotes: number;
  yes: number;
  no: number;
  abstain: number;
  absent: number;
  billCount: number;
}

// ====== 최다 발의 의원 ======
export interface TopProposer {
  memberId: string;
  name: string;
  photoUrl: string;
  billCount: number;
  party: Party;
}

// ====== 홈 통계 ======
export interface HomeStats {
  memberCount: number;
  billCount: number;
  voteCount: number;
  avgAttendanceRate: number;
  recentVotes: Vote[];
  recentBills: Bill[];
  closeVotes: Vote[];
  topProposers: TopProposer[];
  rejectedVotes: Vote[];
}

// ====== 일정 ======
export interface Schedule {
  id: number;
  type: "plenary" | "committee";
  title: string;
  meetingDate: string;
  meetingTime: string;
  session: string;
  degree: string;
  committeeName: string;
  agenda: string;
  linkUrl: string;
  termId: number;
}

// ====== 출석 랭킹 ======
export interface AttendanceRankItem {
  memberId: string;
  name: string;
  photoUrl: string;
  party: Party;
  rate: number;
  attended: number;
  totalSessions: number;
}

export interface AttendanceRanking {
  top: AttendanceRankItem[];
  bottom: AttendanceRankItem[];
}

// ====== 의원 + 대수 정보 결합 ======
export interface MemberWithTerm extends Member {
  term: MemberTerm;
}
