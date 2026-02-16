"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { loadDistricts, filterDistrictsBySido } from "@/lib/geo/topo-utils";
import { PARTIES } from "@/lib/constants";
import type { FeatureCollection, Geometry } from "geojson";
import type { DistrictProperties } from "@/lib/geo/topo-utils";
import type { MemberWithTerm } from "@/types";

interface ProvinceMapProps {
  sido: string;
  getMemberForGeo: (sidoSgg: string) => MemberWithTerm | undefined;
  onDistrictClick: (sidoSgg: string) => void;
  selectedDistrict: string | null;
}

export default function ProvinceMap({
  sido,
  getMemberForGeo,
  onDistrictClick,
  selectedDistrict,
}: ProvinceMapProps) {
  const [districts, setDistricts] = useState<FeatureCollection<
    Geometry,
    DistrictProperties
  > | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    loadDistricts().then((all) => {
      setDistricts(filterDistrictsBySido(all, sido));
    });
  }, [sido]);

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

  const pathGenerator = useMemo(() => {
    if (!districts || !dimensions.width || !dimensions.height) return null;

    const padding = 20;
    const projection = geoMercator().fitExtent(
      [
        [padding, padding],
        [dimensions.width - padding, dimensions.height - padding],
      ],
      districts,
    );

    return geoPath(projection);
  }, [districts, dimensions]);

  return (
    <div ref={containerRef} className="h-full w-full">
      {!districts || !pathGenerator ? (
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-(--color-primary) border-t-transparent" />
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          className="h-full w-full"
          role="img"
          aria-label={`${sido} 선거구 지도`}
        >
          {districts.features.map((feature) => {
            const sidoSgg = feature.properties.SIDO_SGG;
            const d = pathGenerator(feature);
            if (!d) return null;

            const member = getMemberForGeo(sidoSgg);
            const fillColor = member
              ? (PARTIES[member.term.party.id]?.color ?? "#D1D5DB")
              : "#D1D5DB";
            const isSelected = selectedDistrict === sidoSgg;

            const label = sidoSgg.includes(" ") ? sidoSgg.split(" ")[1] : sidoSgg;

            const centroid = pathGenerator.centroid(feature);

            return (
              <g key={sidoSgg}>
                <path
                  d={d}
                  fill={fillColor}
                  fillOpacity={isSelected ? 1 : 0.7}
                  stroke={isSelected ? "#000" : "white"}
                  strokeWidth={isSelected ? 2.5 : 1}
                  className="cursor-pointer transition-opacity hover:opacity-90"
                  onClick={() => onDistrictClick(sidoSgg)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${sidoSgg} ${member ? member.name : "공석"}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") onDistrictClick(sidoSgg);
                  }}
                />
                {centroid && (
                  <text
                    x={centroid[0]}
                    y={centroid[1]}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="pointer-events-none fill-white text-[9px] font-semibold select-none"
                    style={{
                      paintOrder: "stroke",
                      stroke: "rgba(0,0,0,0.4)",
                      strokeWidth: 2,
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                    }}
                  >
                    {label}
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
