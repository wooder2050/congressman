import { notFound } from "next/navigation";
import Link from "next/link";
import { getMember, getMemberTerms, getAttendance, getAbsenceDetails, getBills } from "@/lib/api";
import MemberProfile from "@/components/members/MemberProfile";
import MemberDetailClient from "@/components/members/MemberDetailClient";

interface MemberDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ term?: string; tab?: string }>;
}

export default async function MemberDetailPage({ params, searchParams }: MemberDetailPageProps) {
  const { id } = await params;
  const { term, tab } = await searchParams;
  const termId = Number(term) || 22;

  const [member, memberTerms] = await Promise.all([getMember(id), getMemberTerms(id)]);

  if (!member) return notFound();

  const currentMemberTerm = memberTerms.find((mt) => mt.termId === termId);
  if (!currentMemberTerm) return notFound();

  const [attendance, absenceDetails, billsResult] = await Promise.all([
    getAttendance(id, termId),
    getAbsenceDetails(id, termId),
    getBills({ memberId: id, termId }),
  ]);

  const allTermIds = memberTerms.map((mt) => mt.termId);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href={`/members?term=${termId}`}
        className="inline-flex items-center gap-1 text-sm text-(--color-text-tertiary) no-underline hover:text-(--color-text-secondary)"
      >
        ← 목록으로
      </Link>

      <MemberProfile member={member} memberTerm={currentMemberTerm} allTermIds={allTermIds} />

      <MemberDetailClient
        attendance={attendance}
        absenceDetails={absenceDetails}
        bills={billsResult.bills}
        defaultTab={tab || "attendance"}
      />
    </div>
  );
}
