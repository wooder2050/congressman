"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { loadProvinces } from "@/lib/geo/topo-utils";
import { PARTIES } from "@/lib/constants";
import type { FeatureCollection, Geometry } from "geojson";
import type { ProvinceProperties } from "@/lib/geo/topo-utils";
import type { MemberWithTerm } from "@/types";
import type { SidoPartyStats } from "./MapPageInner";

interface NationalMapProps {
  getMemberForGeo: (sidoSgg: string) => MemberWithTerm | undefined;
  sidoPartyStats: SidoPartyStats;
  onSidoClick: (sido: string) => void;
}

const LABEL_OFFSETS: Record<string, [number, number]> = {
  서울: [0, -8],
  인천: [-12, 0],
  세종: [0, 4],
  대전: [0, 4],
  대구: [0, 0],
  울산: [8, 0],
  부산: [0, 8],
  광주: [0, 4],
  제주: [0, 0],
};

export default function NationalMap({
  sidoPartyStats,
  onSidoClick,
}: NationalMapProps) {
  const [provinces, setProvinces] =
    useState<FeatureCollection<Geometry, ProvinceProperties> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    loadProvinces().then(setProvinces);
  }, []);

  const updateSize = useCallback(() => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    setDimensions((prev) => {
      if (prev.width === width && prev.height === height) return prev;
      return { width, height };
    });
  }, []);

  useEffect(() => {
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [updateSize]);

  const { pathGenerator, centroids } = useMemo(() => {
    if (!provinces || !dimensions.width || !dimensions.height)
      return { pathGenerator: null, centroids: new Map<string, [number, number]>() };

    const padding = 20;
    const projection = geoMercator().fitExtent(
      [
        [padding, padding],
        [dimensions.width - padding, dimensions.height - padding],
      ],
      provinces,
    );

    const pathGen = geoPath(projection);

    const centroidMap = new Map<string, [number, number]>();
    for (const feature of provinces.features) {
      const c = pathGen.centroid(feature);
      const sido = feature.properties.SIDO;
      const offset = LABEL_OFFSETS[sido] ?? [0, 0];
      centroidMap.set(sido, [c[0] + offset[0], c[1] + offset[1]]);
    }

    return { pathGenerator: pathGen, centroids: centroidMap };
  }, [provinces, dimensions]);

  return (
    <div ref={containerRef} className="h-full w-full">
      {!provinces || !pathGenerator ? (
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-(--color-primary) border-t-transparent" />
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          className="h-full w-full"
          role="img"
          aria-label="대한민국 선거구 지도"
        >
          {provinces.features.map((feature) => {
            const sido = feature.properties.SIDO;
            const d = pathGenerator(feature);
            if (!d) return null;

            const partyStats = sidoPartyStats[sido] ?? {};
            const dominantParty = Object.entries(partyStats).sort(
              (a, b) => b[1] - a[1],
            )[0]?.[0];
            const fillColor = dominantParty
              ? (PARTIES[dominantParty]?.color ?? "#D1D5DB")
              : "#D1D5DB";

            const centroid = centroids.get(sido);

            return (
              <g key={sido}>
                <path
                  d={d}
                  fill={fillColor}
                  fillOpacity={0.7}
                  stroke="white"
                  strokeWidth={1.5}
                  className="cursor-pointer transition-opacity hover:opacity-90"
                  onClick={() => onSidoClick(sido)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${sido} 선거구 보기`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") onSidoClick(sido);
                  }}
                />
                {centroid && (
                  <text
                    x={centroid[0]}
                    y={centroid[1]}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="pointer-events-none select-none fill-white text-[11px] font-bold"
                    style={{
                      paintOrder: "stroke",
                      stroke: "rgba(0,0,0,0.5)",
                      strokeWidth: 2.5,
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                    }}
                  >
                    {sido}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}
