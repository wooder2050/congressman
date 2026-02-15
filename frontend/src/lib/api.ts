import { mockTerms } from "@/mocks/terms";
import { mockMembers, mockMemberTerms } from "@/mocks/members";
import { mockAttendance, mockAbsenceDetails } from "@/mocks/attendance";
import { mockBills } from "@/mocks/bills";
import { mockVotes, mockVoteSummary } from "@/mocks/votes";
import type {
  AssemblyTerm,
  Member,
  MemberTerm,
  AttendanceRecord,
  Bill,
  AbsenceDetail,
  TermActivity,
  MemberWithTerm,
  Vote,
  VoteSummary,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const useMock = !API_BASE;

async function fetchApi<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getTerms(): Promise<AssemblyTerm[]> {
  if (useMock) return mockTerms;
  return fetchApi("/api/terms");
}

export async function getMembers(termId: number): Promise<MemberWithTerm[]> {
  if (useMock) {
    const termMembers = mockMemberTerms.filter((mt) => mt.termId === termId);
    return termMembers
      .map((mt) => {
        const member = mockMembers.find((m) => m.id === mt.memberId);
        if (!member) return null;
        return { ...member, term: mt };
      })
      .filter((m): m is MemberWithTerm => m !== null);
  }
  return fetchApi(`/api/members?termId=${termId}`);
}

export async function getMember(id: string): Promise<Member | null> {
  if (useMock) return mockMembers.find((m) => m.id === id) ?? null;
  return fetchApi(`/api/members/${id}`);
}

export async function getMemberTerms(memberId: string): Promise<MemberTerm[]> {
  if (useMock) return mockMemberTerms.filter((mt) => mt.memberId === memberId);
  return fetchApi(`/api/members/${memberId}/terms`);
}

export async function getAttendance(params: {
  memberId: string;
  termId: number;
}): Promise<AttendanceRecord | null> {
  if (useMock) {
    return (
      mockAttendance.find((a) => a.memberId === params.memberId && a.termId === params.termId) ??
      null
    );
  }
  return fetchApi(`/api/attendance?memberId=${params.memberId}&termId=${params.termId}`);
}

export async function getAbsenceDetails(params: {
  memberId: string;
  termId: number;
}): Promise<AbsenceDetail[]> {
  if (useMock) return mockAbsenceDetails[`${params.memberId}_${params.termId}`] ?? [];
  return fetchApi(`/api/attendance/absence?memberId=${params.memberId}&termId=${params.termId}`);
}

export async function getBills(params: {
  termId?: number;
  memberId?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ bills: Bill[]; total: number }> {
  if (useMock) {
    let filtered = [...mockBills];
    if (params.termId) filtered = filtered.filter((b) => b.termId === params.termId);
    if (params.memberId)
      filtered = filtered.filter((b) => b.proposerIds.includes(params.memberId!));
    if (params.status) filtered = filtered.filter((b) => b.status === params.status);
    const total = filtered.length;
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const start = (page - 1) * limit;
    return { bills: filtered.slice(start, start + limit), total };
  }
  const searchParams = new URLSearchParams();
  if (params.termId) searchParams.set("termId", String(params.termId));
  if (params.memberId) searchParams.set("memberId", params.memberId);
  if (params.status) searchParams.set("status", params.status);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  return fetchApi(`/api/bills?${searchParams.toString()}`);
}

export async function getMemberHistory(memberId: string): Promise<TermActivity[]> {
  if (useMock) {
    const memberTerms = mockMemberTerms.filter((mt) => mt.memberId === memberId);
    return memberTerms.map((mt) => {
      const att = mockAttendance.find((a) => a.memberId === memberId && a.termId === mt.termId);
      const bills = mockBills.filter(
        (b) => b.proposerIds.includes(memberId) && b.termId === mt.termId,
      );
      return {
        termId: mt.termId,
        termName: `제${mt.termId}대`,
        attendanceRate: att?.rate ?? 0,
        billsProposed: bills.length,
        billsPassed: bills.filter((b) => b.status === "passed").length,
      };
    });
  }
  return fetchApi(`/api/members/${memberId}/history`);
}

export async function getVotes(params: {
  termId?: number;
  resultCode?: string;
  page?: number;
  limit?: number;
}): Promise<{ votes: Vote[]; total: number }> {
  if (useMock) {
    let filtered = [...mockVotes];
    if (params.termId) filtered = filtered.filter((v) => v.termId === params.termId);
    if (params.resultCode) filtered = filtered.filter((v) => v.resultCode === params.resultCode);
    const total = filtered.length;
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const start = (page - 1) * limit;
    return { votes: filtered.slice(start, start + limit), total };
  }
  const searchParams = new URLSearchParams();
  if (params.termId) searchParams.set("termId", String(params.termId));
  if (params.resultCode) searchParams.set("resultCode", params.resultCode);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  return fetchApi(`/api/votes?${searchParams.toString()}`);
}

export async function getVoteSummary(termId: number): Promise<VoteSummary> {
  if (useMock) return mockVoteSummary;
  return fetchApi(`/api/votes/summary?termId=${termId}`);
}

// Query Keys
Object.defineProperty(getTerms, "queryKey", { value: "terms" });
Object.defineProperty(getMembers, "queryKey", { value: "members" });
Object.defineProperty(getMember, "queryKey", { value: "member" });
Object.defineProperty(getMemberTerms, "queryKey", { value: "memberTerms" });
Object.defineProperty(getAttendance, "queryKey", { value: "attendance" });
Object.defineProperty(getAbsenceDetails, "queryKey", { value: "absenceDetails" });
Object.defineProperty(getBills, "queryKey", { value: "bills" });
Object.defineProperty(getMemberHistory, "queryKey", { value: "memberHistory" });
Object.defineProperty(getVotes, "queryKey", { value: "votes" });
Object.defineProperty(getVoteSummary, "queryKey", { value: "voteSummary" });
