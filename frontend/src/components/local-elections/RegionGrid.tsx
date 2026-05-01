import Link from "next/link";
import type { LocalElectionRegionSummary } from "@/types";
import { SIDO_LIST } from "@/constants/local-elections";

interface Props {
  regions: LocalElectionRegionSummary[];
  baseUrl: string; // e.g. "/local-elections/2026/regions"
}

/** 17개 시도 그리드에서 유형별 race 수를 반환하는 SIDO_LIST 순서 유지 */
export default function RegionGrid({ regions, baseUrl }: Props) {
  const regionMap = new Map(regions.map((r) => [r.sido, r]));

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      {SIDO_LIST.map((sido) => {
        const region = regionMap.get(sido.id);
        const totalRaces = region
          ? Object.values(region.raceCounts).reduce((a, b) => a + b, 0)
          : 0;

        return (
          <Link
            key={sido.id}
            href={`${baseUrl}/${encodeURIComponent(sido.id)}`}
            className="flex flex-col items-center justify-center gap-1 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 transition-colors hover:border-(--color-primary) hover:bg-(--color-bg-secondary)"
          >
            <span className="text-base font-bold text-(--color-text-primary)">
              {sido.short}
            </span>
            {totalRaces > 0 && (
              <span className="text-xs text-(--color-text-tertiary)">
                {totalRaces}개 선거
              </span>
            )}
            {region && region.totalCandidates > 0 && (
              <span className="text-xs text-(--color-text-tertiary)">
                후보 {region.totalCandidates}명
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
