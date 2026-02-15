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
    <div className="sticky top-16 z-40 bg-(--color-bg-primary) border-b border-(--color-bg-tertiary) shadow-(--shadow-sticky)">
      <div className="max-w-5xl mx-auto px-4 py-2">
        <select
          value={currentTerm}
          onChange={handleChange}
          className="w-full px-4 py-3 text-base font-semibold rounded-lg border-2 border-(--color-bg-tertiary) bg-(--color-bg-primary) text-(--color-text-primary) cursor-pointer"
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
        <div className="sticky top-16 z-40 bg-(--color-bg-primary) border-b border-(--color-bg-tertiary)">
          <div className="max-w-5xl mx-auto px-4 py-2">
            <div className="w-full h-12 rounded-lg bg-(--color-bg-secondary) animate-pulse" />
          </div>
        </div>
      }
    >
      <TermSelectorInner />
    </Suspense>
  );
}
