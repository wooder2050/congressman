"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getMembers } from "@/lib/api";
import { DISTRICT_MAP } from "@/lib/geo/district-mapping";
import NationalMap from "./NationalMap";
import ProvinceMap from "./ProvinceMap";
import DistrictPopup from "./DistrictPopup";
import MapBreadcrumb from "./MapBreadcrumb";
import MapLegend from "./MapLegend";
import type { MemberWithTerm } from "@/types";

interface MapPageInnerProps {
  termId: number;
  initialSido?: string;
  initialDistrict?: string;
}

/** GeoJSON SIDO_SGG → DB district로 변환하여 의원 찾기 */
function buildDistrictMemberMap(members: MemberWithTerm[]) {
  const map = new Map<string, MemberWithTerm>();
  for (const m of members) {
    if (!m.term.proportional) {
      map.set(m.term.district.trim(), m);
    }
  }
  return map;
}

export default function MapPageInner({ termId, initialSido, initialDistrict }: MapPageInnerProps) {
  const { data: members } = useCongressSuspenseQuery(getMembers, termId);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedSido, setSelectedSido] = useState<string | null>(initialSido ?? null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(initialDistrict ?? null);

  // Build lookup: DB district → member
  const memberByDistrict = buildDistrictMemberMap(members);

  // GeoJSON SIDO_SGG → member
  const getMemberForGeo = useCallback(
    (sidoSgg: string): MemberWithTerm | undefined => {
      const dbDistrict = DISTRICT_MAP[sidoSgg];
      if (!dbDistrict) return undefined;
      return memberByDistrict.get(dbDistrict);
    },
    [memberByDistrict],
  );

  // main의 min-h-screen과 body의 padding-bottom 무효화하여
  // 지도 페이지가 정확히 뷰포트에 맞도록 함
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const prevMinHeight = main.style.minHeight;
    const prevBodyPb = document.body.style.paddingBottom;
    main.style.minHeight = "0";
    document.body.style.paddingBottom = "0";
    return () => {
      main.style.minHeight = prevMinHeight;
      document.body.style.paddingBottom = prevBodyPb;
    };
  }, []);

  // URL sync
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedSido) {
      params.set("sido", selectedSido);
    } else {
      params.delete("sido");
    }
    if (selectedDistrict) {
      params.set("district", selectedDistrict);
    } else {
      params.delete("district");
    }
    const newUrl = `/map?${params.toString()}`;
    const currentUrl = `/map?${searchParams.toString()}`;
    if (newUrl !== currentUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [selectedSido, selectedDistrict, searchParams, router]);

  const handleSidoClick = (sido: string) => {
    setSelectedSido(sido);
    setSelectedDistrict(null);
  };

  const handleDistrictClick = (sidoSgg: string) => {
    setSelectedDistrict(sidoSgg);
  };

  const handleBack = () => {
    if (selectedDistrict) {
      setSelectedDistrict(null);
    } else if (selectedSido) {
      setSelectedSido(null);
    }
  };

  const handleHome = () => {
    setSelectedSido(null);
    setSelectedDistrict(null);
  };

  // Count members by party for each SIDO
  const sidoPartyStats = getSidoPartyStats(members);

  // Selected member for popup
  const selectedMember = selectedDistrict ? getMemberForGeo(selectedDistrict) : undefined;

  return (
    <div className="flex h-[calc(100dvh-13rem)] flex-col overflow-hidden">
      <MapBreadcrumb
        sido={selectedSido}
        district={selectedDistrict}
        onHome={handleHome}
        onBack={handleBack}
      />

      <div className="relative flex-1 overflow-hidden">
        {!selectedSido ? (
          <NationalMap
            getMemberForGeo={getMemberForGeo}
            sidoPartyStats={sidoPartyStats}
            onSidoClick={handleSidoClick}
          />
        ) : (
          <ProvinceMap
            sido={selectedSido}
            getMemberForGeo={getMemberForGeo}
            onDistrictClick={handleDistrictClick}
            selectedDistrict={selectedDistrict}
          />
        )}
      </div>

      <MapLegend members={members} />

      {selectedDistrict && (
        <DistrictPopup
          sidoSgg={selectedDistrict}
          member={selectedMember}
          onClose={() => setSelectedDistrict(null)}
        />
      )}
    </div>
  );
}

/** 시도별 정당 통계 — 다수당 결정에 사용 */
export type SidoPartyStats = Record<string, Record<string, number>>;

function getSidoPartyStats(members: MemberWithTerm[]): SidoPartyStats {
  const stats: SidoPartyStats = {};
  for (const m of members) {
    if (m.term.proportional) continue;
    const district = m.term.district.trim();
    const spaceIdx = district.indexOf(" ");
    const sido = spaceIdx > 0 ? district.substring(0, spaceIdx) : district;
    // 세종특별자치시 special case
    const sidoKey = sido.startsWith("세종") ? "세종" : sido;
    if (!stats[sidoKey]) stats[sidoKey] = {};
    const partyId = m.term.party.id;
    stats[sidoKey][partyId] = (stats[sidoKey][partyId] ?? 0) + 1;
  }
  return stats;
}
