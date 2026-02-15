"use client";

import Input from "@/components/ui/Input";

interface MemberSearchProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchIcon = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function MemberSearch({ value, onChange }: MemberSearchProps) {
  return (
    <Input
      icon={SearchIcon}
      placeholder="의원 이름 또는 지역구 검색"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="의원 검색"
    />
  );
}
