import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { getElectedLabel } from "@/lib/utils";
import type { Member, MemberTerm } from "@/types";

interface MemberProfileProps {
  member: Member;
  memberTerm: MemberTerm;
  allTermIds: number[];
}

export default function MemberProfile({ member, memberTerm, allTermIds }: MemberProfileProps) {
  const initials = member.name.slice(0, 1);

  return (
    <div className="space-y-4">
      {/* 프로필 카드 */}
      <div className="flex items-start gap-4">
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-(--color-text-inverse)"
          style={{ backgroundColor: memberTerm.party.color }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold">{member.name}</h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge label={memberTerm.party.name} color={memberTerm.party.color} />
            <span className="text-sm text-(--color-text-tertiary)">
              {getElectedLabel(member.electedCount)}
            </span>
          </div>
          <p className="mt-1 text-base text-(--color-text-secondary)">
            {memberTerm.proportional ? "비례대표" : memberTerm.district}
          </p>
        </div>
      </div>

      {/* 위원회 */}
      <div>
        <h3 className="mb-1 text-sm font-semibold text-(--color-text-tertiary)">소속위원회</h3>
        <div className="flex flex-wrap gap-2">
          {memberTerm.committees.map((c) => (
            <span
              key={c}
              className="rounded-lg bg-(--color-bg-secondary) px-3 py-1.5 text-sm text-(--color-text-secondary)"
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* 역대 활동 링크 */}
      {allTermIds.length > 1 && (
        <Link
          href={`/members/${member.id}/history?term=${memberTerm.termId}`}
          className="inline-flex items-center gap-1 rounded-lg bg-(--color-bg-secondary) px-4 py-3 text-base font-semibold text-(--color-primary) no-underline transition-colors hover:bg-(--color-bg-tertiary)"
        >
          역대 활동 비교 →
        </Link>
      )}
    </div>
  );
}
