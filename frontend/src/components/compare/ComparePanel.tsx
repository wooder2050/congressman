"use client";

import Link from "next/link";
import MemberAvatar from "@/components/members/MemberAvatar";
import { formatDistrict } from "@/lib/utils";
import type { MemberWithTerm } from "@/types";

interface ComparePanelProps {
  member: MemberWithTerm | null;
  termId: number;
  side: "left" | "right";
  onRemove: () => void;
}

export default function ComparePanel({ member, termId, side, onRemove }: ComparePanelProps) {
  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-(--color-border-primary) px-3 py-8 sm:px-6 sm:py-14">
        <div className="flex size-16 items-center justify-center rounded-full bg-(--color-bg-tertiary) sm:size-24">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-(--color-text-tertiary)"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
        </div>
        <p className="mt-2 text-xs text-(--color-text-tertiary) sm:text-sm">
          {side === "left" ? "왼쪽" : "오른쪽"} 의원 선택
        </p>
      </div>
    );
  }

  const color = member.term.party.color;
  const gradientDir = side === "left" ? "to right" : "to left";

  return (
    <div
      className="flex flex-col items-center rounded-2xl px-3 py-4 sm:px-5 sm:py-6"
      style={{
        background: `linear-gradient(${gradientDir}, ${color}18 0%, ${color}06 100%)`,
        border: `2px solid ${color}30`,
      }}
    >
      {/* 사진 — 반응형 */}
      <div
        className="w-4/5 max-w-56 rounded-full sm:w-3/4 sm:max-w-64"
        style={{ boxShadow: `0 0 24px ${color}25, 0 0 48px ${color}10` }}
      >
        <MemberAvatar
          photoUrl={member.photoUrl}
          name={member.name}
          size={256}
          bgColor={color}
          className="h-auto! w-full! shrink!"
        />
      </div>

      {/* 정보 */}
      <Link
        href={`/members/${member.id}?term=${termId}`}
        className="mt-2.5 text-base font-black text-(--color-text-primary) no-underline hover:underline sm:mt-3 sm:text-2xl"
      >
        {member.name}
      </Link>

      <div
        className="mt-1 rounded-full px-2 py-px text-[10px] font-bold text-white sm:px-3 sm:py-0.5 sm:text-sm"
        style={{ backgroundColor: color }}
      >
        {member.term.party.shortName}
      </div>

      <p className="mt-1 text-center text-[10px] leading-tight text-(--color-text-tertiary) sm:text-sm">
        {formatDistrict(member.term.district)}
      </p>

      {/* 제거 버튼 */}
      <button
        onClick={onRemove}
        className="mt-2 flex items-center gap-0.5 text-[10px] text-(--color-text-tertiary) transition-colors hover:text-(--color-text-primary) sm:mt-3 sm:text-xs"
        aria-label={`${member.name} 제거`}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
        제거
      </button>
    </div>
  );
}
