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
  ByElectionCandidatePageDetail,
  RadarResult,
  TodayBriefing,
  BillSummaryItem,
  DistrictReport,
  RecentActivity,
} from "@/types";
import type { BreakingNewsItem } from "@/data/breaking-news/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

type FetchApiOptions = {
  revalidate?: number;
  /** ms — 지정 시 초과하면 요청 중단 (선택 섹션이 페이지 렌더를 붙잡지 않도록) */
  timeoutMs?: number;
};

/** 백엔드 재시작·순단으로 나는 일시 오류만 재시도 대상 (그 외 4xx/5xx는 즉시 실패) */
const RETRYABLE_STATUS = new Set([502, 503, 504]);
const RETRY_BASE_DELAY_MS = 300;
/** 동시 ISR 재생성의 재시도가 같은 시점에 몰리지 않도록 지연에 더하는 무작위 폭 */
const RETRY_JITTER_MS = 200;

class RetryableStatusError extends Error {
  constructor(status: number) {
    super(`API error: ${status}`);
    this.name = "RetryableStatusError";
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 버리는 응답의 body를 끝까지 읽어(drain) 커넥션이 정상 반환되도록 한다.
 * cancel()은 쓰지 않는다 — Next request memoization이 응답을 tee()로 복제하는데,
 * 스트림 명세상 한쪽 branch의 cancel()은 다른 branch가 끝날 때까지 완료되지
 * 않아 요청이 무기한 멈출 수 있다. 오류 body는 작으므로 전부 읽는 쪽이 안전하다.
 */
async function discardBody(res: Response): Promise<void> {
  try {
    await res.arrayBuffer();
  } catch {
    // body 소비 실패는 무시 (이미 오류 경로)
  }
}

/** 내부 재시도 마커(RetryableStatusError)가 호출부로 새지 않게 일반 Error로 정규화 */
function normalizeError(err: unknown): unknown {
  return err instanceof RetryableStatusError ? new Error(err.message) : err;
}

/**
 * 재시도 대상 오류 판별. undici의 네트워크 계층 오류(소켓 끊김 등)는
 * TypeError("fetch failed")로 전파된다. Abort/Timeout은 DOMException,
 * 200 응답의 잘못된 JSON은 SyntaxError라 자연히 제외된다.
 */
function isRetryableError(err: unknown): boolean {
  return err instanceof RetryableStatusError || err instanceof TypeError;
}

async function fetchApi<T>(path: string, options?: FetchApiOptions): Promise<T> {
  if (!API_BASE) {
    throw new Error("NEXT_PUBLIC_API_URL 환경변수가 설정되지 않았습니다.");
  }

  const isServer = typeof window === "undefined";
  const timeoutMs = options?.timeoutMs;
  // timeoutMs는 재시도까지 포함한 전체 deadline로 해석한다 (렌더 보호 의미 유지)
  const deadline = timeoutMs !== undefined && timeoutMs > 0 ? Date.now() + timeoutMs : null;

  const doFetch = (bypassMemoization: boolean): Promise<Response> => {
    const init: RequestInit & { next?: { revalidate?: number } } = {};
    if (options?.revalidate !== undefined) {
      init.next = { revalidate: options.revalidate };
      // Next.js 16 defaults fetch to no-store; force-cache is required to actually
      // hit the data cache. Only apply server-side — client React Query manages
      // its own cache and we don't want to interfere with browser cache semantics.
      if (isServer) {
        init.cache = "force-cache";
      }
    }
    if (deadline !== null) {
      // 시도마다 "남은 시간"으로 signal을 새로 만든다 (signal은 재사용 불가)
      init.signal = AbortSignal.timeout(Math.max(deadline - Date.now(), 1));
    } else if (bypassMemoization) {
      // Next는 같은 렌더 패스의 동일 GET fetch를 memoize하므로, signal 없이
      // 다시 부르면 첫 실패의 Promise/Response 복제본을 돌려받을 수 있다.
      // signal이 있으면 memoization을 우회하므로 재시도에만 붙여
      // 실제 origin 재요청을 보장한다 (첫 시도의 dedupe 이점은 유지).
      init.signal = new AbortController().signal;
    }
    return fetch(`${API_BASE}${path}`, init);
  };

  // 한 번의 시도 = fetch + body 수신까지. body 수신 중 소켓이 끊겨도
  // (res.text()의 TypeError) 재시도 범위에 들어가도록 함께 묶는다.
  const attemptOnce = async (bypassMemoization: boolean): Promise<T> => {
    const res = await doFetch(bypassMemoization);
    if (RETRYABLE_STATUS.has(res.status)) {
      await discardBody(res);
      throw new RetryableStatusError(res.status);
    }
    if (res.status === 404) {
      await discardBody(res);
      return null as T;
    }
    if (!res.ok) {
      await discardBody(res);
      throw new Error(`API error: ${res.status}`);
    }
    const text = await res.text();
    if (!text) return null as T;
    return JSON.parse(text);
  };

  try {
    return await attemptOnce(false);
  } catch (err) {
    // 서버(SSR/ISR)에서만, 일시 오류(소켓 끊김·502/503/504)만 정확히 1회 재시도.
    // 클라이언트는 React Query가 자체 재시도를 하므로 중첩하지 않는다.
    if (!isServer || !isRetryableError(err)) throw normalizeError(err);
    const delay = RETRY_BASE_DELAY_MS + Math.floor(Math.random() * RETRY_JITTER_MS);
    if (deadline !== null && Date.now() + delay >= deadline) throw normalizeError(err);
    await sleep(delay);
    try {
      return await attemptOnce(true);
    } catch (retryErr) {
      throw normalizeError(retryErr);
    }
  }
}

export async function getTerms(): Promise<AssemblyTerm[]> {
  return fetchApi("/api/terms", { revalidate: 3600 });
}

export async function getBreakingNews(): Promise<BreakingNewsItem[]> {
  const data = await fetchApi<BreakingNewsItem[] | null>("/api/breaking-news", {
    revalidate: 300,
  });
  return data ?? [];
}

export async function getMembers(termId: number): Promise<MemberWithTerm[]> {
  return fetchApi(`/api/members?termId=${termId}`, { revalidate: 86400 });
}

export async function getMember(id: string): Promise<Member | null> {
  return fetchApi(`/api/members/${id}`, { revalidate: 86400 });
}

export async function getMemberTerms(memberId: string): Promise<MemberTerm[]> {
  return fetchApi(`/api/members/${memberId}/terms`, { revalidate: 86400 });
}

export async function getAttendance(params: {
  memberId: string;
  termId: number;
}): Promise<AttendanceRecord | null> {
  return fetchApi(`/api/attendance?memberId=${params.memberId}&termId=${params.termId}`, {
    revalidate: 3600,
  });
}

export async function getAbsenceDetails(params: {
  memberId: string;
  termId: number;
}): Promise<AbsenceDetail[]> {
  return fetchApi(`/api/attendance/absence?memberId=${params.memberId}&termId=${params.termId}`, {
    revalidate: 3600,
  });
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
  return fetchApi(`/api/bills?${searchParams.toString()}`, { revalidate: 3600 });
}

export async function getBillSummary(termId: number): Promise<BillSummary> {
  return fetchApi(`/api/bills/summary?termId=${termId}`, { revalidate: 3600 });
}

export async function getBillTopics(termId: number): Promise<{ topic: string; count: number }[]> {
  return fetchApi(`/api/bills/topics?termId=${termId}`, {
    revalidate: 300,
  });
}

export async function getBillCommittees(termId: number): Promise<string[]> {
  return fetchApi(`/api/bills/committees?termId=${termId}`, { revalidate: 86400 });
}

export async function getMemberHistory(memberId: string): Promise<TermActivity[]> {
  return fetchApi(`/api/members/${memberId}/history`, { revalidate: 86400 });
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
  return fetchApi(`/api/votes?${searchParams.toString()}`, { revalidate: 3600 });
}

export async function getVoteSummary(termId: number): Promise<VoteSummary> {
  return fetchApi(`/api/votes/summary?termId=${termId}`, { revalidate: 3600 });
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
  return fetchApi(`/api/members/${params.memberId}/votes?${searchParams.toString()}`, {
    revalidate: 3600,
  });
}

export async function getMonthlyAttendance(params: {
  memberId: string;
  termId: number;
}): Promise<MonthlyAttendance[]> {
  return fetchApi(`/api/members/${params.memberId}/monthly-attendance?termId=${params.termId}`, {
    revalidate: 3600,
  });
}

export async function getCommitteeBills(params: {
  memberId: string;
  termId: number;
}): Promise<CommitteeBillCount[]> {
  return fetchApi(`/api/members/${params.memberId}/committee-bills?termId=${params.termId}`, {
    revalidate: 3600,
  });
}

export async function getCommitteeActivity(params: {
  memberId: string;
  termId: number;
}): Promise<CommitteeActivity[]> {
  return fetchApi(`/api/members/${params.memberId}/committee-activity?termId=${params.termId}`, {
    revalidate: 3600,
  });
}

export async function getAssets(memberId: string): Promise<AssetResponse> {
  return fetchApi(`/api/members/${memberId}/assets`, { revalidate: 86400 });
}

export async function getBillIds(): Promise<{ id: string; proposedDate: string }[]> {
  return fetchApi("/api/bills/ids");
}

/** AI 요약(simpleSummary)이 있는 법안 ID만 (sitemap thin-content 제외용) */
export async function getIndexableBillIds(): Promise<{ id: string; proposedDate: string }[]> {
  return fetchApi("/api/bills/indexable-ids");
}

/** 회의록 발언 인용(approved)이 있는 법안 ID만 — 편집 검수 코호트 */
export async function getCuratedBillIds(): Promise<{ id: string; proposedDate: string }[]> {
  return fetchApi("/api/bills/curated-ids");
}

export async function getVoteIds(): Promise<{ id: string; procDate: string }[]> {
  return fetchApi("/api/votes/ids");
}

export async function getBill(id: string): Promise<BillDetail | null> {
  return fetchApi(`/api/bills/${id}`, { revalidate: 86400 });
}

export interface RelatedBill {
  id: string;
  title: string;
  proposerName: string;
  status: string;
  proposedDate: string;
  simpleSummary: string | null;
  topic: string | null;
  relation: "same-law" | "same-proposer" | "same-topic";
}

export async function getRelatedBills(id: string): Promise<RelatedBill[]> {
  // revalidate는 상세 페이지 ISR(2일)과 동일하게, timeout으로 선택 섹션의 지연 전파 차단
  return (
    (await fetchApi(`/api/bills/${encodeURIComponent(id)}/related`, {
      revalidate: 172800,
      timeoutMs: 5000,
    })) ?? []
  );
}

export async function getVoteMemberVotes(voteId: string): Promise<VoteWithMemberVotes | null> {
  return fetchApi(`/api/votes/${voteId}/member-votes`, { revalidate: 86400 });
}

export async function getAttendanceRanking(termId: number): Promise<AttendanceRanking> {
  return fetchApi(`/api/stats/attendance-ranking?termId=${termId}`, {
    revalidate: 300,
  });
}

export async function getHomeStats(termId: number): Promise<HomeStats> {
  return fetchApi(`/api/stats/home?termId=${termId}`, {
    revalidate: 60,
  });
}

export async function getUpcomingSchedules(termId: number, limit?: number): Promise<Schedule[]> {
  const q = limit ? `&limit=${limit}` : "";
  return fetchApi(`/api/schedules/upcoming?termId=${termId}${q}`, {
    revalidate: 60,
  });
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
  return fetchApi(`/api/committees?termId=${termId}`, { revalidate: 86400 });
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
  return fetchApi("/api/stats/property", { revalidate: 86400 });
}

export async function getMemberScorecard(params: {
  memberId: string;
  termId: number;
}): Promise<MemberScorecard | null> {
  return fetchApi(`/api/members/${params.memberId}/scorecard?termId=${params.termId}`, {
    revalidate: 3600,
  });
}

export async function getScorecardRanking(termId: number): Promise<ScorecardRankingResponse> {
  return fetchApi(`/api/stats/scorecard-ranking?termId=${termId}`, {
    revalidate: 3600,
  });
}

export async function getLastSync(): Promise<{ lastSyncAt: string | null }> {
  return fetchApi("/api/health/last-sync");
}

// ====== 이슈 레이더 + 오늘 브리핑 + 법안 일괄 조회 ======

export async function getRadar(params: { termId: number; topics: string[] }): Promise<RadarResult> {
  const sp = new URLSearchParams();
  sp.set("termId", String(params.termId));
  sp.set("topics", params.topics.join(","));
  return fetchApi(`/api/stats/radar?${sp.toString()}`);
}

export async function getTodayBriefing(termId: number): Promise<TodayBriefing> {
  return fetchApi(`/api/stats/today?termId=${termId}`, {
    revalidate: 60,
  });
}

export async function getBillsBatch(ids: string[]): Promise<BillSummaryItem[]> {
  if (!ids.length) return [];
  const sp = new URLSearchParams();
  sp.set("ids", ids.join(","));
  return fetchApi(`/api/bills/batch?${sp.toString()}`);
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
export async function getDistrictReport(params: {
  memberId: string;
  termId: number;
}): Promise<DistrictReport | null> {
  return fetchApi(`/api/members/${params.memberId}/district-report?termId=${params.termId}`, {
    revalidate: 3600,
  });
}

Object.defineProperty(getDistrictReport, "queryKey", { value: "districtReport" });

export async function getRecentActivity(params: {
  memberId: string;
  termId: number;
  days?: number;
}): Promise<RecentActivity> {
  const sp = new URLSearchParams();
  sp.set("termId", String(params.termId));
  if (params.days) sp.set("days", String(params.days));
  return fetchApi(`/api/members/${params.memberId}/recent-activity?${sp.toString()}`);
}

Object.defineProperty(getRecentActivity, "queryKey", { value: "recentActivity" });
Object.defineProperty(getRadar, "queryKey", { value: "radar" });
Object.defineProperty(getTodayBriefing, "queryKey", { value: "todayBriefing" });
Object.defineProperty(getBillsBatch, "queryKey", { value: "billsBatch" });

// ====== 재보궐선거 ======

export async function getElections(): Promise<ByElectionSummary[]> {
  return fetchApi("/api/elections");
}

export async function getElection(id: string): Promise<ByElectionDetail | null> {
  return fetchApi(`/api/elections/${id}`);
}

export interface LawmakerCandidate {
  memberId: string;
  name: string;
  photoUrl: string;
  party: { id: string; name: string; shortName: string; color: string } | null;
  district: string;
  runningFor: string;
  runningReason: string;
  attendanceRate: number;
  voteParticipationRate: number;
  billCount: number;
  passedCount: number;
  passRate: number;
  totalAsset: number | null;
  assetYear: number | null;
}

export async function getLawmakerCandidates(electionId: string): Promise<LawmakerCandidate[]> {
  return fetchApi(`/api/elections/${electionId}/lawmaker-candidates`);
}

export async function getElectionCandidate(params: {
  id: string;
  candidateId: number;
}): Promise<ByElectionCandidatePageDetail | null> {
  return fetchApi(`/api/elections/${params.id}/candidates/${params.candidateId}`);
}

Object.defineProperty(getElections, "queryKey", { value: "elections" });
Object.defineProperty(getElection, "queryKey", { value: "election" });
Object.defineProperty(getLawmakerCandidates, "queryKey", { value: "lawmakerCandidates" });
Object.defineProperty(getElectionCandidate, "queryKey", { value: "electionCandidate" });

// ====== 지방선거 ======

import type {
  LocalElectionSummary,
  LocalElectionOverview,
  LocalElectionRaceSummary,
  LocalElectionRaceDetail,
  LocalElectionCandidatePageDetail,
  LocalElectionRegionSummary,
  LocalElectionRegionDetail,
  LocalElectionStats,
  LocalElectionType,
} from "@/types";

export async function getLocalElections(): Promise<LocalElectionSummary[]> {
  return fetchApi("/api/local-elections");
}

export async function getLocalElection(id: string): Promise<LocalElectionOverview | null> {
  return fetchApi(`/api/local-elections/${id}`);
}

export async function getLocalElectionRaces(params: {
  id: string;
  type?: LocalElectionType;
  sido?: string;
  sigungu?: string;
  q?: string;
  page?: number;
  limit?: number;
}): Promise<{ races: LocalElectionRaceSummary[]; total: number }> {
  const sp = new URLSearchParams();
  if (params.type) sp.set("type", params.type);
  if (params.sido) sp.set("sido", params.sido);
  if (params.sigungu) sp.set("sigungu", params.sigungu);
  if (params.q) sp.set("q", params.q);
  if (params.page) sp.set("page", String(params.page));
  if (params.limit) sp.set("limit", String(params.limit));
  const qs = sp.toString();
  return fetchApi(`/api/local-elections/${params.id}/races${qs ? `?${qs}` : ""}`);
}

export async function getLocalElectionRace(params: {
  id: string;
  raceId: number;
}): Promise<LocalElectionRaceDetail | null> {
  return fetchApi(`/api/local-elections/${params.id}/races/${params.raceId}`);
}

export async function getLocalElectionCandidate(params: {
  id: string;
  candidateId: number;
}): Promise<LocalElectionCandidatePageDetail | null> {
  return fetchApi(`/api/local-elections/${params.id}/candidates/${params.candidateId}`);
}

export async function getLocalElectionRegions(id: string): Promise<LocalElectionRegionSummary[]> {
  return fetchApi(`/api/local-elections/${id}/regions`);
}

export async function getLocalElectionRegion(params: {
  id: string;
  sido: string;
}): Promise<LocalElectionRegionDetail> {
  return fetchApi(`/api/local-elections/${params.id}/regions/${encodeURIComponent(params.sido)}`);
}

export async function getLocalElectionStats(id: string): Promise<LocalElectionStats> {
  return fetchApi(`/api/local-elections/${id}/stats`);
}

/** 후보 1명 이상인 race만 (sitemap thin-content 제외용) */
export async function getIndexableLocalElectionRaces(
  id: string,
): Promise<{ raceId: number; electionType: string; sido: string; sigungu: string }[]> {
  return fetchApi(`/api/local-elections/${id}/indexable-races`);
}

Object.defineProperty(getLocalElections, "queryKey", { value: "localElections" });
Object.defineProperty(getLocalElection, "queryKey", { value: "localElection" });
Object.defineProperty(getLocalElectionRaces, "queryKey", { value: "localElectionRaces" });
Object.defineProperty(getLocalElectionRace, "queryKey", { value: "localElectionRace" });
Object.defineProperty(getLocalElectionCandidate, "queryKey", {
  value: "localElectionCandidate",
});
Object.defineProperty(getLocalElectionRegions, "queryKey", { value: "localElectionRegions" });
Object.defineProperty(getLocalElectionRegion, "queryKey", { value: "localElectionRegion" });
Object.defineProperty(getLocalElectionStats, "queryKey", { value: "localElectionStats" });

// ====== 여론조사 시계열 ======

import type { PollTimeseriesResponse } from "@/types";

export async function getPollTimeseries(params: {
  raceId: number;
  agency?: string;
}): Promise<PollTimeseriesResponse | null> {
  const qs = params.agency ? `?agency=${encodeURIComponent(params.agency)}` : "";
  return fetchApi(`/api/polls/timeseries/${params.raceId}${qs}`);
}

export async function getPollTimeseriesByDistrict(params: {
  districtId: number;
  agency?: string;
}): Promise<PollTimeseriesResponse | null> {
  const qs = params.agency ? `?agency=${encodeURIComponent(params.agency)}` : "";
  return fetchApi(`/api/polls/timeseries-by-district/${params.districtId}${qs}`);
}

Object.defineProperty(getPollTimeseries, "queryKey", { value: "pollTimeseries" });
Object.defineProperty(getPollTimeseriesByDistrict, "queryKey", {
  value: "pollTimeseriesByDistrict",
});
