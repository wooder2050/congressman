import { mockTerms } from "@/mocks/terms";
import { mockMembers, mockMemberTerms } from "@/mocks/members";
import { mockAttendance, mockAbsenceDetails } from "@/mocks/attendance";
import { mockBills } from "@/mocks/bills";
import type {
  AssemblyTerm,
  Member,
  MemberTerm,
  AttendanceRecord,
  Bill,
  AbsenceDetail,
  TermActivity,
  MemberWithTerm,
} from "@/types";

export async function getTerms(): Promise<AssemblyTerm[]> {
  return mockTerms;
}

export async function getMembers(termId: number): Promise<MemberWithTerm[]> {
  const termMembers = mockMemberTerms.filter((mt) => mt.termId === termId);
  return termMembers
    .map((mt) => {
      const member = mockMembers.find((m) => m.id === mt.memberId);
      if (!member) return null;
      return { ...member, term: mt };
    })
    .filter((m): m is MemberWithTerm => m !== null);
}

export async function getMember(id: string): Promise<Member | null> {
  return mockMembers.find((m) => m.id === id) ?? null;
}

export async function getMemberTerms(memberId: string): Promise<MemberTerm[]> {
  return mockMemberTerms.filter((mt) => mt.memberId === memberId);
}

export async function getAttendance(
  memberId: string,
  termId: number,
): Promise<AttendanceRecord | null> {
  return mockAttendance.find((a) => a.memberId === memberId && a.termId === termId) ?? null;
}

export async function getAbsenceDetails(
  memberId: string,
  termId: number,
): Promise<AbsenceDetail[]> {
  return mockAbsenceDetails[`${memberId}_${termId}`] ?? [];
}

export async function getBills(params: {
  termId?: number;
  memberId?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ bills: Bill[]; total: number }> {
  let filtered = [...mockBills];
  if (params.termId) filtered = filtered.filter((b) => b.termId === params.termId);
  if (params.memberId) filtered = filtered.filter((b) => b.proposerIds.includes(params.memberId!));
  if (params.status) filtered = filtered.filter((b) => b.status === params.status);
  const total = filtered.length;
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const start = (page - 1) * limit;
  return { bills: filtered.slice(start, start + limit), total };
}

export async function getMemberHistory(memberId: string): Promise<TermActivity[]> {
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
