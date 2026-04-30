"use client";

import { useState } from "react";

interface PageIntroProps {
  description: string;
  details?: string[];
  /** 모바일에서 접기/펼치기 토글 활성화 (기본: false) */
  collapsible?: boolean;
}

export default function PageIntro({ description, details, collapsible = false }: PageIntroProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl bg-(--color-bg-secondary) p-4 sm:p-5">
      {/* 모바일 접기 모드 */}
      {collapsible && (
        <div className="md:hidden">
          <p
            className={`text-sm leading-relaxed text-(--color-text-secondary) ${!expanded ? "line-clamp-1" : ""}`}
          >
            {description}
          </p>
          {expanded && details && details.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {details.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm leading-relaxed text-(--color-text-secondary)"
                >
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-(--color-text-tertiary)" />
                  {item}
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-xs font-medium text-(--color-text-tertiary) hover:text-(--color-text-secondary)"
          >
            {expanded ? "접기" : "더보기"}
          </button>
        </div>
      )}

      {/* 데스크톱 / 접기 비활성 시: 항상 전체 표시 */}
      <div className={collapsible ? "hidden md:block" : ""}>
        <p className="text-sm leading-relaxed text-(--color-text-secondary)">{description}</p>
        {details && details.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {details.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm leading-relaxed text-(--color-text-secondary)"
              >
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-(--color-text-tertiary)" />
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
