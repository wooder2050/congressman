import Link from "next/link";
import ColorBadge from "@/components/ui/color-badge";
import { getElectedLabel } from "@/lib/utils";
import type { MemberWithTerm } from "@/types";

interface MemberCardProps {
  member: MemberWithTerm;
}

export default function MemberCard({ member }: MemberCardProps) {
  const { term } = member;
  const initials = member.name.slice(0, 1);

  return (
    <Link
      href={`/members/${member.id}?term=${term.termId}`}
      className="flex items-center gap-4 rounded-xl border-l-4 bg-(--color-bg-primary) p-4 no-underline shadow-(--shadow-card) transition-shadow hover:shadow-(--shadow-card-hover)"
      style={{ borderLeftColor: term.party.color }}
    >
      {/* 프로필 이미지 / 이니셜 */}
      <div
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-bold text-(--color-text-inverse)"
        style={{ backgroundColor: term.party.color }}
      >
        {initials}
      </div>

      {/* 정보 */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-lg font-bold text-(--color-text-primary)">{member.name}</span>
          <ColorBadge label={term.party.shortName} color={term.party.color} size="sm" />
        </div>
        <p className="text-sm text-(--color-text-secondary)">
          {term.proportional ? "비례대표" : term.district}
        </p>
        <p className="text-xs text-(--color-text-tertiary)">
          {getElectedLabel(member.electedCount)}
        </p>
      </div>
    </Link>
  );
}
