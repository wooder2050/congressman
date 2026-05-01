"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getElection } from "@/lib/api";
import type { ByElectionDetail, ElectionDistrictInfo } from "@/types";
import { proxyPhotoUrl } from "@/lib/photo";
import DistrictSection from "./DistrictSection";

export default function RegionalElectionInner({
  electionId,
  region,
}: {
  electionId: string;
  region: string;
}) {
  const { data: election } = useCongressSuspenseQuery<ByElectionDetail | null, string>(
    getElection,
    electionId,
  );

  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);

  if (!election) return null;

  const districts = election.districts.filter((d) => d.region === region);

  if (districts.length === 0) {
    return (
      <section className="space-y-3">
        <h2 className="text-xl font-bold">재보궐 선거구</h2>
        <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) py-12 text-center">
          <p className="text-sm text-(--color-text-tertiary)">
            {region} 지역에는 이번 재보궐 선거구가 없습니다.
          </p>
          <Link
            href={`/elections/${electionId}`}
            className="mt-3 inline-block text-sm font-medium text-(--color-primary) hover:underline"
          >
            전체 선거구 보기 →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold">
        재보궐 선거구{" "}
        <span className="text-base font-normal text-(--color-text-tertiary)">
          {districts.length}곳
        </span>
      </h2>
      <div className="space-y-3">
        {districts.map((d) => (
          <DistrictCard
            key={d.id}
            district={d}
            electionId={electionId}
            isExpanded={selectedDistrict === d.id}
            onToggle={() => setSelectedDistrict((prev) => (prev === d.id ? null : d.id))}
          />
        ))}
      </div>
    </section>
  );
}

function DistrictCard({
  district: d,
  electionId,
  isExpanded,
  onToggle,
}: {
  district: ElectionDistrictInfo;
  electionId: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const prev = d.previousMember;
  const partyColor = prev?.party?.color ?? "#9ca3af";

  return (
    <div
      className="overflow-hidden rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary)"
      style={{ borderLeftWidth: "4px", borderLeftColor: partyColor }}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-(--color-bg-hover)"
      >
        {prev && prev.photoUrl ? (
          <Image
            src={proxyPhotoUrl(prev.photoUrl)}
            alt={prev.name}
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: partyColor }}
          >
            {prev?.name?.slice(0, 1) ?? "?"}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-bold">{d.district}</p>
          <p className="mt-0.5 text-xs text-(--color-text-tertiary)">
            {d.vacancyReason} · 후보 {d.candidates.length}명
          </p>
        </div>
        <span
          className={`shrink-0 text-xs text-(--color-text-tertiary) transition-transform ${isExpanded ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>
      {isExpanded && (
        <div className="border-t border-(--color-border-primary) bg-(--color-bg-secondary) px-4 pb-4">
          <DistrictSection district={d} electionId={electionId} />
        </div>
      )}
    </div>
  );
}
