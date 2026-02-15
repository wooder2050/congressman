import Link from "next/link";
import ColorBadge from "@/components/ui/color-badge";
import { getElectedLabel, getContrastColor } from "@/lib/utils";
import type { Member, MemberTerm } from "@/types";

interface MemberProfileProps {
  member: Member;
  memberTerm: MemberTerm;
  allTermIds: number[];
}

export default function MemberProfile({ member, memberTerm, allTermIds }: MemberProfileProps) {
  const initials = member.name.slice(0, 1);
  const contrastColor = getContrastColor(memberTerm.party.color);

  return (
    <div className="space-y-4">
      {/* 프로필 카드 — 정당 컬러 배너 */}
      <div
        className="overflow-hidden rounded-xl"
        style={{ backgroundColor: memberTerm.party.color }}
      >
        <div className="flex items-start gap-4 bg-black/20 p-5">
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-bold"
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              color: contrastColor,
            }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold" style={{ color: contrastColor }}>
              {member.name}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <ColorBadge label={memberTerm.party.name} color={memberTerm.party.color} />
              <span className="text-sm" style={{ color: contrastColor, opacity: 0.8 }}>
                {getElectedLabel(member.electedCount)}
              </span>
            </div>
            <p className="mt-1 text-base" style={{ color: contrastColor, opacity: 0.9 }}>
              {memberTerm.proportional ? "비례대표" : memberTerm.district}
            </p>
          </div>
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
