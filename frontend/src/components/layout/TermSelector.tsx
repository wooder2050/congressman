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

  const terms = [
    { id: "22", label: "제22대 (현재)" },
    { id: "21", label: "제21대" },
  ];

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("term", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="sticky top-16 z-40 border-b border-(--color-bg-tertiary) bg-(--color-bg-primary) shadow-(--shadow-sticky)">
      <div className="mx-auto max-w-5xl px-4 py-2">
        <Select value={currentTerm} onValueChange={handleChange}>
          <SelectTrigger
            className="w-full rounded-lg border-2 border-(--color-bg-tertiary) bg-(--color-bg-primary) px-4 py-3 text-base font-semibold text-(--color-text-primary)"
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
        <div className="sticky top-16 z-40 border-b border-(--color-bg-tertiary) bg-(--color-bg-primary)">
          <div className="mx-auto max-w-5xl px-4 py-2">
            <div className="h-12 w-full animate-pulse rounded-lg bg-(--color-bg-secondary)" />
          </div>
        </div>
      }
    >
      <TermSelectorInner />
    </Suspense>
  );
}
