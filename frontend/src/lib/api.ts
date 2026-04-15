import type {
  AssemblyTerm,
  Member,
  MemberTerm,
  AttendanceRecord,
  AttendanceRanking,
  Bill,
  BillDetail,
  BillSummary,
  AbsenceDetail,
  TermActivity,
  MemberWithTerm,
  Vote,
  VoteSummary,
  MemberVotesResponse,
  AssetResponse,
  VoteWithMemberVotes,
  HomeStats,
  MonthlyAttendance,
  CommitteeBillCount,
  CommitteeActivity,
  CommitteeStats,
  CommitteeDetail,
  CommitteeMinutesResponse,
  Schedule,
  ActivityHeatmapDay,
  PropertyStatsResponse,
  MemberScorecard,
  ScorecardRankingResponse,
  ByElectionSummary,
  ByElectionDetail,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

async function fetchApi<T>(path: string): Promise<T> {
  if (!API_BASE) {
    throw new Error("NEXT_PUBLIC_API_URL 환경변수가 설정되지 않았습니다.");
  }
  const res = await fetch(`${API_BASE}${path}`);
  if (res.status === 404) return null as T;
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const text = await res.text();
  if (!text) return null as T;
  return JSON.parse(text);
}

export async function getTerms(): Promise<AssemblyTerm[]> {
  return fetchApi("/api/terms");
}

export async function getMembers(termId: number): Promise<MemberWithTerm[]> {
  return fetchApi(`/api/members?termId=${termId}`);
}

export async function getMember(id: string): Promise<Member | null> {
  return fetchApi(`/api/members/${id}`);
}

export async function getMemberTerms(memberId: string): Promise<MemberTerm[]> {
  return fetchApi(`/api/members/${memberId}/terms`);
}

export async function getAttendance(params: {
  memberId: string;
  termId: number;
}): Promise<AttendanceRecord | null> {
  return fetchApi(`/api/attendance?memberId=${params.memberId}&termId=${params.termId}`);
}

export async function getAbsenceDetails(params: {
  memberId: string;
  termId: number;
}): Promise<AbsenceDetail[]> {
  return fetchApi(`/api/attendance/absence?memberId=${params.memberId}&termId=${params.termId}`);
}

export async function getBills(params: {
  termId?: number;
  memberId?: string;
  role?: string;
  status?: string;
  search?: string;
  month?: string;
  committee?: string;
  topic?: string;
  page?: number;
  limit?: number;
}): Promise<{ bills: Bill[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (params.termId) searchParams.set("termId", String(params.termId));
  if (params.memberId) searchParams.set("memberId", params.memberId);
  if (params.role) searchParams.set("role", params.role);
  if (params.status) searchParams.set("status", params.status);
  if (params.month) searchParams.set("month", params.month);
  if (params.search) searchParams.set("search", params.search);
  if (params.committee) searchParams.set("committee", params.committee);
  if (params.topic) searchParams.set("topic", params.topic);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  return fetchApi(`/api/bills?${searchParams.toString()}`);
}

export async function getBillSummary(termId: number): Promise<BillSummary> {
  return fetchApi(`/api/bills/summary?termId=${termId}`);
}

export async function getBillTopics(termId: number): Promise<{ topic: string; count: number }[]> {
  return fetchApi(`/api/bills/topics?termId=${termId}`);
}

export async function getBillCommittees(termId: number): Promise<string[]> {
  return fetchApi(`/api/bills/committees?termId=${termId}`);
}

export async function getMemberHistory(memberId: string): Promise<TermActivity[]> {
  return fetchApi(`/api/members/${memberId}/history`);
}

export async function getVotes(params: {
  termId?: number;
  resultCode?: string;
  search?: string;
  month?: string;
  page?: number;
  limit?: number;
}): Promise<{ votes: Vote[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (params.termId) searchParams.set("termId", String(params.termId));
  if (params.resultCode) searchParams.set("resultCode", params.resultCode);
  if (params.month) searchParams.set("month", params.month);
  if (params.search) searchParams.set("search", params.search);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  return fetchApi(`/api/votes?${searchParams.toString()}`);
}

export async function getVoteSummary(termId: number): Promise<VoteSummary> {
  return fetchApi(`/api/votes/summary?termId=${termId}`);
}

export async function getMemberVotes(params: {
  memberId: string;
  termId: number;
  page?: number;
  limit?: number;
  result?: string;
  month?: string;
}): Promise<MemberVotesResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set("termId", String(params.termId));
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.result) searchParams.set("result", params.result);
  if (params.month) searchParams.set("month", params.month);
  return fetchApi(`/api/members/${params.memberId}/votes?${searchParams.toString()}`);
}

export async function getMonthlyAttendance(params: {
  memberId: string;
  termId: number;
}): Promise<MonthlyAttendance[]> {
  return fetchApi(`/api/members/${params.memberId}/monthly-attendance?termId=${params.termId}`);
}

export async function getCommitteeBills(params: {
  memberId: string;
  termId: number;
}): Promise<CommitteeBillCount[]> {
  return fetchApi(`/api/members/${params.memberId}/committee-bills?termId=${params.termId}`);
}

export async function getCommitteeActivity(params: {
  memberId: string;
  termId: number;
}): Promise<CommitteeActivity[]> {
  return fetchApi(`/api/members/${params.memberId}/committee-activity?termId=${params.termId}`);
}

export async function getAssets(memberId: string): Promise<AssetResponse> {
  return fetchApi(`/api/members/${memberId}/assets`);
}

export async function getBillIds(): Promise<{ id: string; proposedDate: string }[]> {
  return fetchApi("/api/bills/ids");
}

export async function getVoteIds(): Promise<{ id: string; procDate: string }[]> {
  return fetchApi("/api/votes/ids");
}

export async function getBill(id: string): Promise<BillDetail | null> {
  return fetchApi(`/api/bills/${id}`);
}

export async function getVoteMemberVotes(voteId: string): Promise<VoteWithMemberVotes | null> {
  return fetchApi(`/api/votes/${voteId}/member-votes`);
}

export async function getAttendanceRanking(termId: number): Promise<AttendanceRanking> {
  return fetchApi(`/api/stats/attendance-ranking?termId=${termId}`);
}

export async function getHomeStats(termId: number): Promise<HomeStats> {
  return fetchApi(`/api/stats/home?termId=${termId}`);
}

export async function getUpcomingSchedules(termId: number): Promise<Schedule[]> {
  return fetchApi(`/api/schedules/upcoming?termId=${termId}`);
}

export async function getSchedules(params: {
  termId: number;
  type?: string;
  page?: number;
  limit?: number;
}): Promise<{ schedules: Schedule[]; total: number }> {
  const searchParams = new URLSearchParams();
  searchParams.set("termId", String(params.termId));
  if (params.type) searchParams.set("type", params.type);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  return fetchApi(`/api/schedules?${searchParams.toString()}`);
}

export async function getCommitteeStats(termId: number): Promise<CommitteeStats[]> {
  return fetchApi(`/api/committees?termId=${termId}`);
}

export async function getCommitteeDetail(params: {
  name: string;
  termId: number;
}): Promise<CommitteeDetail> {
  return fetchApi(
    `/api/committees/detail?name=${encodeURIComponent(params.name)}&termId=${params.termId}`,
  );
}

export async function getCommitteeMinutes(params: {
  name: string;
  termId: number;
  page: number;
}): Promise<CommitteeMinutesResponse> {
  return fetchApi(
    `/api/committees/minutes?name=${encodeURIComponent(params.name)}&termId=${params.termId}&page=${params.page}`,
  );
}

export async function getActivityHeatmap(params: {
  memberId: string;
  termId: number;
  startDate: string;
  endDate: string;
}): Promise<ActivityHeatmapDay[]> {
  return fetchApi(
    `/api/members/${params.memberId}/activity-heatmap?termId=${params.termId}&startDate=${params.startDate}&endDate=${params.endDate}`,
  );
}

export async function getPropertyStats(): Promise<PropertyStatsResponse> {
  return fetchApi("/api/stats/property");
}

export async function getMemberScorecard(params: {
  memberId: string;
  termId: number;
}): Promise<MemberScorecard | null> {
  return fetchApi(`/api/members/${params.memberId}/scorecard?termId=${params.termId}`);
}

export async function getScorecardRanking(termId: number): Promise<ScorecardRankingResponse> {
  return fetchApi(`/api/stats/scorecard-ranking?termId=${termId}`);
}

export async function getLastSync(): Promise<{ lastSyncAt: string | null }> {
  return fetchApi("/api/health/last-sync");
}

// Query Keys
Object.defineProperty(getTerms, "queryKey", { value: "terms" });
Object.defineProperty(getMembers, "queryKey", { value: "members" });
Object.defineProperty(getMember, "queryKey", { value: "member" });
Object.defineProperty(getMemberTerms, "queryKey", { value: "memberTerms" });
Object.defineProperty(getAttendance, "queryKey", { value: "attendance" });
Object.defineProperty(getAbsenceDetails, "queryKey", { value: "absenceDetails" });
Object.defineProperty(getBills, "queryKey", { value: "bills" });
Object.defineProperty(getBillSummary, "queryKey", { value: "billSummary" });
Object.defineProperty(getBillTopics, "queryKey", { value: "billTopics" });
Object.defineProperty(getBillCommittees, "queryKey", { value: "billCommittees" });
Object.defineProperty(getMemberHistory, "queryKey", { value: "memberHistory" });
Object.defineProperty(getVotes, "queryKey", { value: "votes" });
Object.defineProperty(getVoteSummary, "queryKey", { value: "voteSummary" });
Object.defineProperty(getMemberVotes, "queryKey", { value: "memberVotes" });
Object.defineProperty(getMonthlyAttendance, "queryKey", { value: "monthlyAttendance" });
Object.defineProperty(getCommitteeBills, "queryKey", { value: "committeeBills" });
Object.defineProperty(getCommitteeActivity, "queryKey", { value: "committeeActivity" });
Object.defineProperty(getAssets, "queryKey", { value: "assets" });
Object.defineProperty(getBill, "queryKey", { value: "bill" });
Object.defineProperty(getVoteMemberVotes, "queryKey", { value: "voteMemberVotes" });
Object.defineProperty(getAttendanceRanking, "queryKey", { value: "attendanceRanking" });
Object.defineProperty(getHomeStats, "queryKey", { value: "homeStats" });
Object.defineProperty(getUpcomingSchedules, "queryKey", { value: "upcomingSchedules" });
Object.defineProperty(getSchedules, "queryKey", { value: "schedules" });
Object.defineProperty(getCommitteeStats, "queryKey", { value: "committeeStats" });
Object.defineProperty(getCommitteeDetail, "queryKey", { value: "committeeDetail" });
Object.defineProperty(getCommitteeMinutes, "queryKey", { value: "committeeMinutes" });
Object.defineProperty(getActivityHeatmap, "queryKey", { value: "activityHeatmap" });
Object.defineProperty(getPropertyStats, "queryKey", { value: "propertyStats" });
Object.defineProperty(getMemberScorecard, "queryKey", { value: "memberScorecard" });
Object.defineProperty(getScorecardRanking, "queryKey", { value: "scorecardRanking" });
Object.defineProperty(getLastSync, "queryKey", { value: "lastSync" });

// ====== 재보궐선거 ======

export async function getElections(): Promise<ByElectionSummary[]> {
  return fetchApi("/api/elections");
}

export async function getElection(id: string): Promise<ByElectionDetail | null> {
  return fetchApi(`/api/elections/${id}`);
}

Object.defineProperty(getElections, "queryKey", { value: "elections" });
Object.defineProperty(getElection, "queryKey", { value: "election" });
