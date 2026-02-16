"use client";

import { MEMBER_VOTE_RESULT_MAP } from "@/lib/constants";
import type { AssignedSeat } from "@/lib/chamber/seat-assignment";

interface HemicycleSVGProps {
  seats: AssignedSeat[];
  memberVoteMap: Map<string, string>;
  isVoteMode: boolean;
  selectedSeatIndex: number | null;
  onSeatClick: (index: number) => void;
}

const VOTE_COLORS: Record<string, string> = {
  yes: MEMBER_VOTE_RESULT_MAP.yes.color,
  no: MEMBER_VOTE_RESULT_MAP.no.color,
  abstain: MEMBER_VOTE_RESULT_MAP.abstain.color,
  absent: MEMBER_VOTE_RESULT_MAP.absent.color,
};

export default function HemicycleSVG({
  seats,
  memberVoteMap,
  isVoteMode,
  selectedSeatIndex,
  onSeatClick,
}: HemicycleSVGProps) {
  return (
    <svg
      viewBox="0 0 1000 600"
      className="h-full w-full"
      role="img"
      aria-label="본회의장 좌석 배치도"
    >
      {/* Podium */}
      <rect x={440} y={568} width={120} height={28} rx={6} fill="#374151" />
      <text x={500} y={586} textAnchor="middle" fill="#ffffff" fontSize={13} fontWeight={700}>
        의장석
      </text>

      {/* Seats */}
      {seats.map((seat) => {
        const voteResult = seat.memberId ? memberVoteMap.get(seat.memberId) : undefined;
        const fillColor =
          isVoteMode && seat.memberId
            ? (VOTE_COLORS[voteResult ?? "absent"] ?? VOTE_COLORS.absent)
            : seat.partyColor || "#D1D5DB";
        const isSelected = seat.index === selectedSeatIndex;
        const hasMember = !!seat.memberId;

        return (
          <circle
            key={seat.index}
            cx={seat.x}
            cy={seat.y}
            r={9}
            fill={fillColor}
            fillOpacity={hasMember ? 0.9 : 0.2}
            stroke={isSelected ? "#ffffff" : "transparent"}
            strokeWidth={isSelected ? 3 : 0}
            className={hasMember ? "cursor-pointer transition-colors duration-150" : ""}
            onClick={() => hasMember && onSeatClick(seat.index)}
            role={hasMember ? "button" : undefined}
            tabIndex={hasMember ? 0 : undefined}
            aria-label={hasMember ? `${seat.memberName} (${seat.partyName})` : undefined}
            onKeyDown={(e) => {
              if (hasMember && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onSeatClick(seat.index);
              }
            }}
          />
        );
      })}
    </svg>
  );
}
