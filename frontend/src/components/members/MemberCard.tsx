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
        <div className="mb-1 flex flex-wrap items-center gap-1.5">
          <span className="text-lg font-bold text-(--color-text-primary)">{member.name}</span>
          <ColorBadge label={term.party.shortName} color={term.party.color} size="sm" />
          {term.committeeRole && term.committeeRole !== "위원" && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
              {term.committeeRole}
            </span>
          )}
        </div>
        <p className="text-sm text-(--color-text-secondary)">
          {term.proportional ? "비례대표" : formatDistrict(term.district)}
        </p>
        <p className="text-xs text-(--color-text-tertiary)">
          {getElectedLabel(term.electedCount)}
        </p>
      </div>
    </Link>
  );
}
