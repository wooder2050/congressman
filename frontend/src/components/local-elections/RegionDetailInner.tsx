"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getLocalElectionRegion } from "@/lib/api";
import { BALLOT_ORDER, SIGUNGU_SCOPED_TYPES } from "@/constants/local-elections";
import type { LocalElectionRaceSummary, LocalElectionType } from "@/types";
import BallotCard from "./BallotCard";
import SigunguPicker, {
  pushRecentSigungu,
  readLastSigungu,
  useRecentSigungu,
} from "./SigunguPicker";

interface Props {
  year: string;
  electionId: string;
  sido: string;
}

export default function RegionDetailInner({ year, electionId, sido }: Props) {
  const { data } = useCongressSuspenseQuery(getLocalElectionRegion, {
    id: electionId,
    sido,
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("sigungu");

  const [selectedSigungu, setSelectedSigungu] = useState<string | null>(queryParam);
  const recent = useRecentSigungu(sido);

  // URL 파라미터가 없고 LocalStorage에 마지막 선택이 있다면 복원
  useEffect(() => {
    if (queryParam) {
      setSelectedSigungu(queryParam);
      return;
    }
    const last = readLastSigungu(sido);
    if (last && data?.sigunguList.some((opt) => opt.name === last)) {
      setSelectedSigungu(last);
    }
  }, [queryParam, sido, data]);

  const handleSelect = (sigungu: string | null) => {
    setSelectedSigungu(sigungu);

    // URL 동기화 + LocalStorage 기록
    const params = new URLSearchParams(searchParams.toString());
    if (sigungu) {
      params.set("sigungu", sigungu);
      pushRecentSigungu(sido, sigungu);
    } else {
      params.delete("sigungu");
    }
    const queryString = params.toString();
    router.replace(queryString ? `?${queryString}` : "?", { scroll: false });
  };

  // 투표용지(7장) 순서로 race를 그룹화 + 선택된 시군구로 필터
  const groupedByBallot = useMemo(() => {
    if (!data) return new Map<LocalElectionType, LocalElectionRaceSummary[]>();
    const map = new Map<LocalElectionType, LocalElectionRaceSummary[]>();
    for (const race of data.races) {
      const type = race.electionType;
      // 시군구가 선택됐다면 시군구 종속 선거는 해당 시군구만, 시도 공통 선거는 그대로
      if (selectedSigungu && SIGUNGU_SCOPED_TYPES.has(type) && race.sigungu !== selectedSigungu) {
        continue;
      }
      const list = map.get(type) ?? [];
      list.push(race);
      map.set(type, list);
    }
    return map;
  }, [data, selectedSigungu]);

  if (!data || data.races.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-(--color-text-tertiary)">
        등록된 선거구가 없습니다.
      </p>
    );
  }

  const totalRaceCount = data.races.length;
  const filteredRaceCount = Array.from(groupedByBallot.values()).reduce(
    (sum, races) => sum + races.length,
    0,
  );

  return (
    <div className="space-y-6">
      {/* 안내 헤더 */}
      <section>
        <p className="text-sm text-(--color-text-secondary)">
          6·3 지방선거에서 받게 될 투표용지 순서대로 정리했습니다. 시·군·구를 선택하면 해당 지역의
          투표 7장(또는 그 이하)만 보입니다.
        </p>
        <p className="mt-1 text-xs text-(--color-text-tertiary)">
          총 {totalRaceCount.toLocaleString()}개 선거구
          {selectedSigungu && (
            <span className="ml-1">
              · {selectedSigungu} 기준 {filteredRaceCount.toLocaleString()}개
            </span>
          )}
        </p>
      </section>

      {/* 시군구 선택기 */}
      <SigunguPicker
        sido={sido}
        sigunguList={data.sigunguList}
        selected={selectedSigungu}
        onSelect={handleSelect}
        recent={recent}
      />

      {/* 투표용지 7장 카드 */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-(--color-text-primary)">
          {selectedSigungu ? `${selectedSigungu} 투표용지` : `${sido} 투표용지`}
        </h2>
        <div className="space-y-3">
          {BALLOT_ORDER.map((ballot) => (
            <BallotCard
              key={ballot.type}
              number={ballot.number}
              ballotLabel={ballot.ballotLabel}
              kind={ballot.kind}
              type={ballot.type}
              races={groupedByBallot.get(ballot.type) ?? []}
              year={year}
              sido={sido}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
