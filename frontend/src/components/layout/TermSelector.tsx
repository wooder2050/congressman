"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Suspense } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function TermSelectorInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTerm = searchParams.get("term") || "22";

  // 상세 페이지에서는 숨김 (의원/법안/표결 — 대수 전환이 의미 없음)
  const isMemberDetail = /^\/members\/[^/]+/.test(pathname) && pathname !== "/members";
  const isBillDetail = /^\/bills\/[^/]+/.test(pathname) && pathname !== "/bills";
  const isVoteDetail = /^\/votes\/[^/]+/.test(pathname) && pathname !== "/votes";
  if (isMemberDetail || isBillDetail || isVoteDetail) return null;

  const terms = [
    { id: "22", label: "제22대 (현재)" },
    { id: "21", label: "제21대" },
    { id: "20", label: "제20대" },
  ];

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("term", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="sticky top-14 z-40 border-b border-(--color-border-primary) bg-(--color-bg-primary) lg:top-16">
      <div className="mx-auto max-w-7xl px-4 py-2">
        <Select value={currentTerm} onValueChange={handleChange}>
          <SelectTrigger
            className="h-12 w-full rounded-lg border-2 border-(--color-bg-tertiary) bg-(--color-bg-primary) px-4 text-base font-semibold text-(--color-text-primary) lg:w-56"
            aria-label="국회 대수 선택"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {terms.map((term) => (
              <SelectItem key={term.id} value={term.id} className="text-base">
                {term.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default function TermSelector() {
  return (
    <Suspense
      fallback={
        <div className="sticky top-14 z-40 border-b border-(--color-border-primary) bg-(--color-bg-primary) lg:top-16">
          <div className="mx-auto max-w-7xl px-4 py-2">
            <div className="h-12 w-full animate-pulse rounded-lg bg-(--color-bg-secondary) lg:w-56" />
          </div>
        </div>
      }
    >
      <TermSelectorInner />
    </Suspense>
  );
}
