import Link from "next/link";
import ColorBadge from "@/components/ui/color-badge";
import MemberBookmarkButton from "@/components/ui/MemberBookmarkButton";
import MemberAvatar from "./MemberAvatar";
import { getElectedLabel, formatDistrict } from "@/lib/utils";
import type { MemberWithTerm } from "@/types";

interface MemberCardProps {
  member: MemberWithTerm;
}

export default function MemberCard({ member }: MemberCardProps) {
  const { term } = member;

  return (
    <div
      className="flex items-center gap-2 rounded-xl border border-l-4 border-(--color-border-primary) bg-(--color-bg-primary) p-4 transition-colors hover:bg-(--color-bg-hover)"
      style={{
        borderLeftColor: term.party.color,
        contentVisibility: "auto",
        containIntrinsicSize: "0 88px",
      }}
    >
      <Link
        href={`/members/${member.id}?term=${term.termId}`}
        className="flex min-w-0 flex-1 items-center gap-4 no-underline"
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
            {term.cabinetPosition ? (
              // 현재 국무위원 겸직 — 파란 배지로 강조
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                🏛️ {term.cabinetPosition}
              </span>
            ) : term.cabinetHistory && term.cabinetHistory.length > 0 ? (
              // 과거 국무위원 이력(현재는 평의원) — 회색 배지
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                前 {term.cabinetHistory[term.cabinetHistory.length - 1].position}
              </span>
            ) : null}
            {(() => {
              const roles = Object.values(term.committeeRoles ?? {});
              const topRole = roles.find((r) => r !== "위원");
              return topRole ? (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  {topRole}
                </span>
              ) : null;
            })()}
          </div>
          <p className="text-sm text-(--color-text-secondary)">
            {term.proportional ? "비례대표" : formatDistrict(term.district)}
          </p>
          <p className="text-xs text-(--color-text-tertiary)">
            {getElectedLabel(term.electedCount)}
          </p>
        </div>
      </Link>
      <MemberBookmarkButton memberId={member.id} />
    </div>
  );
}
