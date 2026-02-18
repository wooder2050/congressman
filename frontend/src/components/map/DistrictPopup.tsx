"use client";

import Link from "next/link";
import MemberAvatar from "@/components/members/MemberAvatar";
import ColorBadge from "@/components/ui/color-badge";
import { DISTRICT_MAP } from "@/lib/geo/district-mapping";
import { formatDistrict, getElectedLabel } from "@/lib/utils";
import type { MemberWithTerm } from "@/types";

interface DistrictPopupProps {
  sidoSgg: string;
  member?: MemberWithTerm;
  onClose: () => void;
}

export default function DistrictPopup({ sidoSgg, member, onClose }: DistrictPopupProps) {
  const dbDistrict = DISTRICT_MAP[sidoSgg] ?? sidoSgg;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} aria-hidden="true" />

      {/* Bottom sheet */}
      <div className="animate-slide-up fixed right-0 bottom-0 left-0 z-50 mx-auto max-w-7xl rounded-t-2xl bg-(--color-bg-primary) pb-[env(safe-area-inset-bottom)] shadow-lg">
        {/* Handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="h-1 w-10 rounded-full bg-(--color-bg-tertiary)" />
        </div>

        <div className="px-4 pb-20">
          {/* District name */}
          <p className="mb-2 text-sm text-(--color-text-tertiary)">{formatDistrict(dbDistrict)}</p>

          {member ? (
            <div className="flex items-center gap-4">
              <MemberAvatar
                photoUrl={member.photoUrl}
                name={member.name}
                size={64}
                bgColor={member.term.party.color}
              />
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-lg font-bold text-(--color-text-primary)">
                    {member.name}
                  </span>
                  <ColorBadge label={member.term.party.shortName} color={member.term.party.color} />
                </div>
                <p className="text-sm text-(--color-text-secondary)">
                  {getElectedLabel(member.term.electedCount)} ·{" "}
                  {formatDistrict(member.term.district)}
                </p>
                <Link
                  href={`/members/${member.id}?term=${member.term.termId}`}
                  className="mt-2 inline-block text-sm font-semibold text-(--color-primary) no-underline"
                >
                  상세 보기 →
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-(--color-text-tertiary)">현재 의원 정보가 없습니다</p>
              <p className="mt-1 text-sm text-(--color-text-tertiary)">
                공석이거나 데이터가 아직 반영되지 않았습니다
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
