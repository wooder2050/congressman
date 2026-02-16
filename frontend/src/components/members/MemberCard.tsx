import Link from "next/link";
import ColorBadge from "@/components/ui/color-badge";
import MemberAvatar from "./MemberAvatar";
import { getElectedLabel, formatDistrict } from "@/lib/utils";
import type { MemberWithTerm } from "@/types";

interface MemberCardProps {
  member: MemberWithTerm;
}

export default function MemberCard({ member }: MemberCardProps) {
  const { term } = member;

  return (
    <Link
      href={`/members/${member.id}?term=${term.termId}`}
      className="flex items-center gap-4 rounded-xl border border-l-4 border-(--color-border-primary) bg-(--color-bg-primary) p-4 no-underline transition-colors hover:bg-(--color-bg-hover)"
      style={{
        borderLeftColor: term.party.color,
        contentVisibility: "auto",
        containIntrinsicSize: "0 88px",
      }}
    >
      {/* 프로필 이미지 */}
      <MemberAvatar
        name={member.name}
        photoUrl={member.photoUrl}
        size={64}
        bgColor={term.party.color}
      />

      {/* 정보 */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-lg font-bold text-(--color-text-primary)">{member.name}</span>
          <ColorBadge label={term.party.shortName} color={term.party.color} size="sm" />
        </div>
        <p className="text-sm text-(--color-text-secondary)">
          {term.proportional ? "비례대표" : formatDistrict(term.district)}
        </p>
        <p className="text-xs text-(--color-text-tertiary)">
          {getElectedLabel(member.electedCount)}
        </p>
      </div>
    </Link>
  );
}
