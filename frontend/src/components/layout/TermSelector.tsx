"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Suspense } from "react";

function TermSelectorInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTerm = searchParams.get("term") || "22";

  const terms = [
    { id: "22", label: "제22대 (현재)" },
    { id: "21", label: "제21대" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("term", e.target.value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="sticky top-16 z-40 border-b border-(--color-bg-tertiary) bg-(--color-bg-primary) shadow-(--shadow-sticky)">
      <div className="mx-auto max-w-5xl px-4 py-2">
        <select
          value={currentTerm}
          onChange={handleChange}
          className="w-full cursor-pointer rounded-lg border-2 border-(--color-bg-tertiary) bg-(--color-bg-primary) px-4 py-3 text-base font-semibold text-(--color-text-primary)"
          aria-label="국회 대수 선택"
        >
          {terms.map((term) => (
            <option key={term.id} value={term.id}>
              {term.label}
            </option>
          ))}
        </select>
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
