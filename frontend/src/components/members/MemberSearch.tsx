"use client";

import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

interface MemberSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MemberSearch({ value, onChange }: MemberSearchProps) {
  return (
    <div className="relative">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-(--color-text-tertiary)" />
      <Input
        placeholder="의원 이름 또는 지역구 검색"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="의원 검색"
        className="h-12 rounded-lg border-2 border-(--color-bg-tertiary) pl-10 text-base"
      />
    </div>
  );
}
