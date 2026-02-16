"use client";

import { SIDO_FULL_NAMES } from "@/lib/geo/district-mapping";

interface MapBreadcrumbProps {
  sido: string | null;
  district: string | null;
  onHome: () => void;
  onBack: () => void;
}

export default function MapBreadcrumb({
  sido,
  district,
  onHome,
  onBack,
}: MapBreadcrumbProps) {
  // 선거구 이름에서 시도 부분 제거
  const districtLabel = district?.includes(" ")
    ? district.split(" ")[1]
    : district;

  return (
    <nav
      className="flex items-center gap-1 px-4 py-3 text-sm"
      aria-label="지도 경로"
    >
      <button
        onClick={onHome}
        className={`font-semibold ${sido ? "cursor-pointer text-(--color-primary)" : "text-(--color-text-primary)"}`}
        disabled={!sido}
      >
        전국
      </button>

      {sido && (
        <>
          <span className="text-(--color-text-tertiary)">/</span>
          <button
            onClick={onBack}
            className={`font-semibold ${district ? "cursor-pointer text-(--color-primary)" : "text-(--color-text-primary)"}`}
            disabled={!district}
          >
            {SIDO_FULL_NAMES[sido] ?? sido}
          </button>
        </>
      )}

      {district && (
        <>
          <span className="text-(--color-text-tertiary)">/</span>
          <span className="font-semibold text-(--color-text-primary)">
            {districtLabel}
          </span>
        </>
      )}
    </nav>
  );
}
