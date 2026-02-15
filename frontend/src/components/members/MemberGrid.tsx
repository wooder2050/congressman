import MemberCard from "./MemberCard";
import type { MemberWithTerm } from "@/types";

interface MemberGridProps {
  members: MemberWithTerm[];
}

export default function MemberGrid({ members }: MemberGridProps) {
  if (members.length === 0) {
    return (
      <div className="py-12 text-center text-(--color-text-tertiary)">
        <p className="text-lg">검색 결과가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((member) => (
        <MemberCard key={`${member.id}-${member.term.termId}`} member={member} />
      ))}
    </div>
  );
}
