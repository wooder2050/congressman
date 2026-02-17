import Link from "next/link";
import { MEMBER_VOTE_RESULT_MAP } from "@/lib/constants";
import type { MemberVoteResult } from "@/types";

interface MemberVotePillProps {
  memberId: string;
  memberName: string;
  result: MemberVoteResult;
  termId: number;
}

export default function MemberVotePill({
  memberId,
  memberName,
  result,
  termId,
}: MemberVotePillProps) {
  const { color } = MEMBER_VOTE_RESULT_MAP[result];

  return (
    <Link
      href={`/members/${memberId}?term=${termId}`}
      prefetch={false}
      className="flex h-8 items-center justify-center rounded border-l-3 px-1.5 text-xs font-medium text-(--color-text-primary) no-underline transition-opacity hover:opacity-80"
      style={{
        backgroundColor: `${color}1A`,
        borderLeftColor: color,
      }}
    >
      {memberName}
    </Link>
  );
}
