import { getMembers } from "@/lib/api";
import MemberListClient from "@/components/members/MemberListClient";

interface MembersPageProps {
  searchParams: Promise<{ term?: string }>;
}

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const params = await searchParams;
  const termId = Number(params.term) || 22;
  const members = await getMembers(termId);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-4 text-2xl font-bold">의원 목록</h1>
      <MemberListClient members={members} />
    </div>
  );
}
