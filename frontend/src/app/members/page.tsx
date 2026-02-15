import type { Metadata } from "next";
import { getMembers } from "@/lib/api";
import MemberListClient from "@/components/members/MemberListClient";

export const metadata: Metadata = {
  title: "의원 목록",
  description: "대수별 국회의원 목록을 검색하고 정당별로 필터링하세요.",
};

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
