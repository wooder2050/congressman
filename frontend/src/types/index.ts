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
  committeeRoles: Record<string, string>; // {"법제사법위원회": "위원장"}
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
  committeeResultCode?: string | null;
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
  changeReason: string;
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

// ====== 법안 심사 경과 ======
export interface BillProgress {
  committeeDate: string | null;
  committeePresentDate: string | null;
  committeeResult: string | null;
  committeeResultDate: string | null;
  lawSubmitDate: string | null;
  lawPresentDate: string | null;
  lawResult: string | null;
  lawResultDate: string | null;
  plenaryDate: string | null;
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
  progress?: BillProgress | null;
}

// ====== 위원회 통계 ======
export interface CommitteeChairInfo {
  memberId: string;
  name: string;
  photoUrl: string;
  partyName: string;
  partyColor: string;
}

export interface CommitteeNextSchedule {
  meetingDate: string;
  meetingTime: string;
  title: string;
}

export interface CommitteeStats {
  name: string;
  billTotal: number;
  billPassed: number;
  passRate: number;
  memberCount: number;
  chair: CommitteeChairInfo | null;
  nextSchedule: CommitteeNextSchedule | null;
}

// ====== 위원회 상세 ======
export interface CommitteeMemberInfo {
  memberId: string;
  name: string;
  photoUrl: string;
  partyName: string;
  partyColor: string;
  role: string;
}

export interface MeetingMinutesAgenda {
  subName: string;
  vodLinkUrl?: string;
  confLinkUrl?: string;
  pdfLinkUrl?: string;
}

export interface MeetingMinutesSummary {
  id: string;
  conferNum: string;
  title: string;
  className: string;
  confDate: string;
  agendaCount: number;
  agendas: MeetingMinutesAgenda[];
}

export interface CommitteeDetail {
  name: string;
  billTotal: number;
  billPassed: number;
  passRate: number;
  members: CommitteeMemberInfo[];
  upcomingSchedules: CommitteeNextSchedule[];
}

export interface CommitteeMinutesResponse {
  items: MeetingMinutesSummary[];
  total: number;
  page: number;
  totalPages: number;
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

// ====== 부동산 현황 ======
export interface PropertyMember {
  memberId: string;
  name: string;
  photoUrl: string;
  party: string;
  partyColor: string;
  district: string;
  proportional: boolean;
  committees: string[];
  electedCount: number;
}

export interface PropertyAsset {
  memberId: string;
  category: string;
  item: string;
  amount: number;
  relation: string;
}

export interface PropertyStatsResponse {
  members: PropertyMember[];
  assets: PropertyAsset[];
}

// ====== 활동 히트맵 ======
export interface ActivityHeatmapDay {
  date: string;
  representativeBills: number;
  coBills: number;
  votes: number;
}

// ====== 의원 + 대수 정보 결합 ======
export interface MemberWithTerm extends Member {
  term: MemberTerm;
}

// ====== 의원 성적표 ======
export type ScorecardGrade = "S" | "A" | "B" | "C" | "D";

export interface MemberScorecard {
  memberId: string;
  name: string;
  photoUrl: string;
  party: Party;
  district: string;
  termId: number;

  attendance: {
    rate: number;
    score: number;
    rank: number;
    totalMembers: number;
  };
  voteParticipation: {
    rate: number;
    score: number;
    rank: number;
    totalMembers: number;
    yes: number;
    no: number;
    abstain: number;
    absent: number;
  };
  billProposal: {
    representativeCount: number;
    coCount: number;
    score: number;
    rank: number;
    totalMembers: number;
  };
  billPassRate: {
    passedCount: number;
    totalRepresentative: number;
    rate: number;
    score: number;
    rank: number;
    totalMembers: number;
  };

  totalScore: number;
  grade: ScorecardGrade;
  overallRank: number;

  recentActivity: {
    last30Days: {
      bills: number;
      votes: number;
      votesAttended: number;
    };
  };
}

// ====== 성적표 랭킹 ======
export interface ScorecardRankingItem {
  memberId: string;
  name: string;
  photoUrl: string;
  party: Party;
  district: string;
  totalScore: number;
  grade: ScorecardGrade;
  attendance: { rate: number; score: number };
  voteParticipation: { rate: number; score: number };
  billProposal: { representativeCount: number; score: number };
  billPassRate: { rate: number; score: number };
}

export interface ScorecardRankingResponse {
  rankings: ScorecardRankingItem[];
}

// ====== 재보궐선거 ======

export interface ByElectionSummary {
  id: string;
  name: string;
  electionDate: string;
  status: "upcoming" | "active" | "completed";
  districtCount: number;
}

export interface ByElectionDetail {
  id: string;
  name: string;
  electionDate: string;
  status: "upcoming" | "active" | "completed";
  description: string;
  districts: ElectionDistrictInfo[];
}

export interface ElectionDistrictInfo {
  id: number;
  district: string;
  region: string;
  vacancyReason: string;
  confirmed: boolean;
  status: string;
  previousMember: {
    id: string | null;
    name: string;
    photoUrl: string;
    party: Party | null;
  } | null;
  candidates: ElectionCandidate[];
}

export interface CandidatePledge {
  category: string;
  title: string;
  description: string;
}

/** 공직선거법 제49조 후보자정보공개자료 요약 5종 (출처: 중앙선거관리위원회) */
export interface CandidateDisclosure {
  /** 재산신고액(원 단위 문자열, BigInt 직렬화) */
  assetDeclared: string | null;
  /** 병역신고사항(본인) */
  militaryService: string | null;
  /** 최근 5년 납세 납부액(원 단위 문자열) */
  taxPaid: string | null;
  /** 최근 5년 체납액(원 단위 문자열) */
  taxOverdue5y: string | null;
  /** 현 체납액(원 단위 문자열) */
  taxOverdueCurrent: string | null;
  /** 전과기록 (예: "없음", "1건") */
  criminalRecord: string | null;
  /** 입후보 횟수 */
  electionCount: number | null;
}

export interface ElectionCandidate extends CandidateDisclosure {
  id: number;
  name: string;
  party: Party | null;
  photoUrl: string | null;
  birthDate: string | null;
  career: string | null;
  education: string | null;
  slogan: string | null;
  pledges: CandidatePledge[];
  assets: string | null;
  candidateNumber: number | null;
  status: string;
  memberIdRef: string | null;
}

// ====== 지방선거 ======

export type LocalElectionType =
  | "governor"
  | "mayor"
  | "metro-council"
  | "metro-proportional"
  | "local-council"
  | "local-proportional"
  | "superintendent";

export interface LocalElectionSummary {
  id: string;
  name: string;
  electionDate: string;
  status: "upcoming" | "active" | "completed";
  raceCounts: Record<LocalElectionType, number>;
}

export interface LocalElectionRegionSummary {
  sido: string;
  sidoShort: string;
  raceCounts: Record<LocalElectionType, number>;
  totalCandidates: number;
}

export interface LocalElectionOverview extends LocalElectionSummary {
  description: string;
  ordinal: number;
  totalCandidates: number;
  regionSummary: LocalElectionRegionSummary[];
}

export interface LocalElectionCandidatePreview {
  id: number;
  name: string;
  party: Party | null;
  candidateNumber: number | null;
  photoUrl: string | null;
}

export interface LocalElectionPartyGroup {
  partyId: string | null;
  partyName: string;
  partyShortName: string;
  partyColor: string;
  candidateCount: number;
}

export interface LocalElectionRaceSummary {
  id: number;
  electionType: LocalElectionType;
  sido: string;
  sigungu: string;
  district: string;
  displayName: string;
  seatCount: number;
  candidateCount: number;
  topCandidates: LocalElectionCandidatePreview[];
  /** 비례대표 race에만 채워짐 — 정당별 명부 후보 수 */
  partyGroups?: LocalElectionPartyGroup[];
}

export interface LocalElectionCandidateDetail extends CandidateDisclosure {
  id: number;
  name: string;
  party: Party | null;
  photoUrl: string | null;
  birthDate: string | null;
  gender: string | null;
  career: string | null;
  education: string | null;
  slogan: string | null;
  pledges: CandidatePledge[];
  assets: string | null;
  candidateNumber: number | null;
  status: string;
  voteCount: number | null;
  voteRate: number | null;
  isWinner: boolean;
  memberIdRef: string | null;
}

export interface LocalElectionRaceDetail {
  id: number;
  electionType: LocalElectionType;
  sido: string;
  sigungu: string;
  district: string;
  displayName: string;
  seatCount: number;
  candidates: LocalElectionCandidateDetail[];
}

/** 후보자 상세 페이지 — 전·현직 국회의원 출신 후보의 22대 의정활동 요약 */
export interface CandidateLawmakerSummary {
  memberId: string;
  name: string;
  photoUrl: string | null;
  district: string;
  attendanceRate: number;
  voteParticipationRate: number;
  billCount: number;
  passedCount: number;
  passRate: number;
  totalAsset: number | null;
  assetYear: number | null;
  hasActivity: boolean;
}

/** 지방선거 후보자 상세 페이지 응답 */
export interface LocalElectionCandidatePageDetail extends LocalElectionCandidateDetail {
  race: {
    id: number;
    electionType: LocalElectionType;
    sido: string;
    sigungu: string;
    district: string;
    displayName: string;
  };
  member: CandidateLawmakerSummary | null;
}

/** 재보궐 후보자 상세 페이지 응답 */
export interface ByElectionCandidatePageDetail extends ElectionCandidate {
  district: {
    id: number;
    district: string;
    region: string;
    vacancyReason: string;
  };
  member: CandidateLawmakerSummary | null;
}

export interface LocalElectionSigunguOption {
  name: string;
  raceCount: number;
}

export interface LocalElectionRegionDetail {
  sido: string;
  races: LocalElectionRaceSummary[];
  sigunguList: LocalElectionSigunguOption[];
}

export interface LocalElectionStats {
  totalRaces: number;
  totalCandidates: number;
  racesByType: Record<string, number>;
  candidatesByType: Record<string, number>;
  candidatesByParty: Record<string, number>;
}

// ====== 유저 환경설정 ======

export interface UserPreference {
  id: number;
  userId: string;
  displayName: string | null;
  district: string | null;
  interests: string[];
  bookmarkedBills: string[];
  bookmarkedMembers: string[];
  createdAt: string;
  updatedAt: string;
}

// ====== 지역구 의원 활동 리포트 ======

export interface DistrictReport {
  scorecard: MemberScorecard;
  recentBills: BillSummaryItem[];
  recentVotes: MemberVotesResponse;
}

// ====== 법안 요약 (공통) ======

export interface BillSummaryItem {
  id: string;
  title: string;
  proposerName: string;
  coProposerCount?: number;
  status: string;
  proposedDate: string;
  termId?: number;
  committee: string | null;
  simpleSummary: string | null;
  topic: string | null;
}

// ====== 이슈 레이더 ======

export interface RadarResult {
  bills: BillSummaryItem[];
  topics: string[];
}

// ====== 의원 최근 활동 ======

export interface RecentActivity {
  memberId: string;
  termId: number;
  days: number;
  billsProposed: number;
  votesParticipated: number;
  votesMissed: number;
  recentBills: { id: string; title: string; proposedDate: string }[];
}

// ====== 오늘 브리핑 ======

export interface TodayBriefing {
  date: string;
  schedules: Schedule[];
  recentVotes: Vote[];
  recentBills: BillSummaryItem[];
}
