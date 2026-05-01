import Image from "next/image";
import Link from "next/link";
import type { ElectionDistrictInfo } from "@/types";
import CandidateCard from "./CandidateCard";

export default function DistrictSection({ district }: { district: ElectionDistrictInfo }) {
  const prev = district.previousMember;
  const partyColor = prev?.party?.color ?? "#9ca3af";

  return (
    <div className="space-y-4 pt-3">
      {/* 전임 의원 */}
      {prev && prev.name !== "공석" && (
        <div className="flex items-center gap-3 rounded-lg bg-(--color-bg-primary) px-3 py-2.5">
          {prev.photoUrl ? (
            <Image
              src={prev.photoUrl}
              alt={prev.name}
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: partyColor }}
            >
              {prev.name.slice(0, 1)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-(--color-text-primary)">{prev.name}</span>
              {prev.party && (
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-white"
                  style={{ backgroundColor: prev.party.color }}
                >
                  {prev.party.shortName}
                </span>
              )}
              <span className="text-xs text-(--color-text-tertiary)">전임</span>
            </div>
          </div>
          {prev.id && (
            <Link
              href={`/members/${prev.id}`}
              className="shrink-0 text-xs text-(--color-primary) no-underline hover:underline"
            >
              프로필 →
            </Link>
          )}
        </div>
      )}

      {/* 후보자 목록 */}
      {district.candidates.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-(--color-text-secondary)">
            등록 후보 {district.candidates.length}명
          </h4>
          <div className="grid gap-3 lg:grid-cols-2">
            {district.candidates.map((c) => (
              <CandidateCard key={c.id} candidate={c} />
            ))}
          </div>
          {district.candidates.length >= 2 && (
            <Link
              href={`/elections/2026-06-03/races/${district.id}`}
              className="inline-flex items-center gap-1 rounded-lg bg-(--color-bg-tertiary) px-3 py-2 text-xs font-medium text-(--color-text-secondary) transition-colors hover:bg-(--color-bg-hover)"
            >
              후보 비교하기 →
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-lg bg-(--color-bg-primary) py-4 text-center">
          <p className="text-sm text-(--color-text-tertiary)">아직 등록된 후보가 없습니다</p>
          <p className="mt-0.5 text-xs text-(--color-text-tertiary)">
            후보 등록 기간에 업데이트됩니다
          </p>
        </div>
      )}
    </div>
  );
}
