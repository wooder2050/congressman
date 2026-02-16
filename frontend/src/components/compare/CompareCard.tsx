"use client";

import Link from "next/link";
import MemberAvatar from "@/components/members/MemberAvatar";
import ColorBadge from "@/components/ui/color-badge";
import { formatDistrict } from "@/lib/utils";
import type { MemberWithTerm } from "@/types";

interface CompareCardProps {
  member: MemberWithTerm;
  onRemove: (id: string) => void;
}

export default function CompareCard({ member, onRemove }: CompareCardProps) {
  return (
    <div className="relative flex flex-col items-center rounded-xl border border-(--color-border-primary) p-4">
      {/* Remove button */}
      <button
        onClick={() => onRemove(member.id)}
        className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full text-(--color-text-tertiary) transition-colors hover:bg-(--color-bg-tertiary)"
        aria-label={`${member.name} 제거`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <MemberAvatar
        photoUrl={member.photoUrl}
        name={member.name}
        size={56}
        bgColor={member.term.party.color}
      />
      <Link
        href={`/members/${member.id}`}
        className="mt-2 text-base font-bold text-(--color-text-primary) no-underline hover:underline"
      >
        {member.name}
      </Link>
      <ColorBadge label={member.term.party.shortName} color={member.term.party.color} size="sm" />
      <p className="mt-1 text-center text-xs text-(--color-text-tertiary)">
        {formatDistrict(member.term.district)}
      </p>
    </div>
  );
}
