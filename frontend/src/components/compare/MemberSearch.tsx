"use client";

import { useState, useRef, useEffect } from "react";
import MemberAvatar from "@/components/members/MemberAvatar";
import ColorBadge from "@/components/ui/color-badge";
import { formatDistrict } from "@/lib/utils";
import type { MemberWithTerm } from "@/types";

interface MemberSearchProps {
  members: MemberWithTerm[];
  selectedIds: string[];
  onSelect: (member: MemberWithTerm) => void;
  maxMembers: number;
  placeholder?: string;
  disabled?: boolean;
}

export default function MemberSearch({
  members,
  selectedIds,
  onSelect,
  maxMembers,
  placeholder: customPlaceholder,
  disabled: externalDisabled,
}: MemberSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? members
        .filter(
          (m) =>
            !selectedIds.includes(m.id) &&
            (m.name.includes(query.trim()) || m.term.district.includes(query.trim())),
        )
        .slice(0, 8)
    : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const atMax = externalDisabled ?? selectedIds.length >= maxMembers;

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={
          atMax
            ? `최대 ${maxMembers}명까지 비교 가능`
            : (customPlaceholder ?? "의원 이름 또는 지역구 검색")
        }
        disabled={atMax}
        className="w-full rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) px-4 py-2.5 text-sm text-(--color-text-primary) transition-colors outline-none placeholder:text-(--color-text-tertiary) focus:border-(--color-primary) disabled:opacity-50"
      />

      {open && filtered.length > 0 && (
        <div className="absolute top-full right-0 left-0 z-30 mt-1 overflow-hidden rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) shadow-lg">
          {filtered.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                onSelect(m);
                setQuery("");
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-(--color-bg-secondary)"
            >
              <MemberAvatar
                photoUrl={m.photoUrl}
                name={m.name}
                size={36}
                bgColor={m.term.party.color}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-(--color-text-primary)">{m.name}</span>
                  <ColorBadge label={m.term.party.shortName} color={m.term.party.color} size="sm" />
                </div>
                <p className="text-xs text-(--color-text-tertiary)">
                  {formatDistrict(m.term.district)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
