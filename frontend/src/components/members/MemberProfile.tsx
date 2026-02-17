import Link from "next/link";
import ColorBadge from "@/components/ui/color-badge";
import MemberAvatar from "./MemberAvatar";
import { getElectedLabel, getContrastColor, formatDistrict } from "@/lib/utils";
import type { Member, MemberTerm } from "@/types";

interface MemberProfileProps {
  member: Member;
  memberTerm: MemberTerm;
  allTermIds: number[];
}

const isSpecialCommittee = (name: string) => name.includes("특별위원회");

export default function MemberProfile({ member, memberTerm, allTermIds }: MemberProfileProps) {
  const contrastColor = getContrastColor(memberTerm.party.color);
  const standingCommittees = memberTerm.committees.filter((c) => !isSpecialCommittee(c));
  const specialCommittees = memberTerm.committees.filter(isSpecialCommittee);

  return (
    <div className="space-y-4">
      {/* 프로필 카드 — 정당 컬러 배너 + 위원회 통합 */}
      <div
        className="overflow-hidden rounded-xl"
        style={{ backgroundColor: memberTerm.party.color }}
      >
        <div className="flex items-start gap-4 bg-black/20 p-5">
          <MemberAvatar
            name={member.name}
            photoUrl={member.photoUrl}
            size={80}
            bgColor="rgba(255,255,255,0.2)"
            textColor={contrastColor}
            className="border-2 border-white/30"
          />
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
              {memberTerm.proportional ? "비례대표" : formatDistrict(memberTerm.district)}
            </p>
            {standingCommittees.length > 0 && (
              <p className="mt-1 text-sm" style={{ color: contrastColor, opacity: 0.7 }}>
                {standingCommittees[0]}
                {memberTerm.committeeRole && memberTerm.committeeRole !== "위원" && (
                  <span
                    className="ml-1.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    style={{ backgroundColor: "rgba(255,255,255,0.25)", color: contrastColor }}
                  >
                    {memberTerm.committeeRole}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        {/* 위원회 정보 — 프로필 카드 내부 */}
        {(standingCommittees.length > 0 || specialCommittees.length > 0) && (
          <div className="space-y-2 border-t border-white/15 bg-black/10 px-5 py-3">
            {standingCommittees.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="text-xs font-semibold"
                  style={{ color: contrastColor, opacity: 0.6 }}
                >
                  상임위
                </span>
                {standingCommittees.map((c) => (
                  <span
                    key={c}
                    className="rounded-md px-2 py-0.5 text-xs"
                    style={{ backgroundColor: "rgba(255,255,255,0.15)", color: contrastColor }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}
            {specialCommittees.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="text-xs font-semibold"
                  style={{ color: contrastColor, opacity: 0.6 }}
                >
                  특별위
                </span>
                {specialCommittees.map((c) => (
                  <span
                    key={c}
                    className="rounded-md px-2 py-0.5 text-xs"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.1)",
                      color: contrastColor,
                      opacity: 0.8,
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
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
