"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

export default function HomeMoreSections({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);

  const onToggle = () => {
    const next = !expanded;
    setExpanded(next);
    trackEvent("home_more_expand", { state: next ? "expanded" : "collapsed" });
  };

  return (
    <>
      {/* 데스크톱: 항상 표시 */}
      <div className="hidden space-y-8 lg:block">{children}</div>

      {/* 모바일: 토글 */}
      <div className="lg:hidden">
        {expanded && <div className="space-y-8">{children}</div>}
        <button
          type="button"
          onClick={onToggle}
          className="w-full rounded-xl border border-(--color-border-primary) py-3 text-sm font-medium text-(--color-text-secondary) transition-colors hover:bg-(--color-bg-secondary)"
        >
          {expanded ? "접기" : "더 많은 정보 보기"}
        </button>
      </div>
    </>
  );
}
