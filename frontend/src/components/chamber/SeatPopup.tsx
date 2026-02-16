"use client";

import Link from "next/link";
import MemberAvatar from "@/components/members/MemberAvatar";
import ColorBadge from "@/components/ui/color-badge";
import { MEMBER_VOTE_RESULT_MAP } from "@/lib/constants";
import { formatDistrict } from "@/lib/utils";
import type { AssignedSeat } from "@/lib/chamber/seat-assignment";

interface SeatPopupProps {
  seat: AssignedSeat;
  voteResult?: string;
  onClose: () => void;
}

export default function SeatPopup({ seat, voteResult, onClose }: SeatPopupProps) {
  const voteInfo = voteResult
    ? MEMBER_VOTE_RESULT_MAP[voteResult as keyof typeof MEMBER_VOTE_RESULT_MAP]
    : undefined;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} aria-hidden="true" />

      {/* Bottom sheet */}
      <div className="animate-slide-up fixed right-0 bottom-0 left-0 z-50 rounded-t-2xl bg-(--color-bg-primary) pb-[env(safe-area-inset-bottom)] shadow-lg">
        {/* Handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="h-1 w-10 rounded-full bg-(--color-bg-tertiary)" />
        </div>

        <div className="px-4 pb-20">
          <div className="flex items-center gap-4">
            <MemberAvatar
              photoUrl={seat.photoUrl}
              name={seat.memberName}
              size={64}
              bgColor={seat.partyColor}
            />
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-lg font-bold text-(--color-text-primary)">
                  {seat.memberName}
                </span>
                <ColorBadge label={seat.partyName} color={seat.partyColor} />
                {voteInfo && <ColorBadge label={voteInfo.label} color={voteInfo.color} />}
              </div>
              <p className="text-sm text-(--color-text-secondary)">
                {seat.proportional ? "비례대표" : formatDistrict(seat.district)}
              </p>
              <Link
                href={`/members/${seat.memberId}`}
                className="mt-2 inline-block text-sm font-semibold text-(--color-primary) no-underline"
              >
                상세 보기 →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
