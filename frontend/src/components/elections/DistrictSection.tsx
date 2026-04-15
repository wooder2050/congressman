import Image from "next/image";
import Link from "next/link";
import type { ElectionDistrictInfo } from "@/types";
import CandidateCard from "./CandidateCard";

const REASON_ICON: Record<string, string> = {
  대통령: "🏛️",
  비서실장: "🏛️",
  당선무효: "⚖️",
  사퇴: "📋",
};

function getReasonIcon(reason: string): string {
  for (const [key, icon] of Object.entries(REASON_ICON)) {
    if (reason.includes(key)) return icon;
  }
  return "📌";
}

export default function DistrictSection({ district }: { district: ElectionDistrictInfo }) {
  const icon = getReasonIcon(district.vacancyReason);
  const prev = district.previousMember;

  return (
    <section
      id={`district-${district.id}`}
      className="scroll-mt-20 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary)"
    >
      {/* 선거구 헤더 */}
      <div className="border-b border-(--color-border-primary) px-4 py-4 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-(--color-text-primary) sm:text-xl">
              {district.district}
            </h3>
            <div className="mt-1.5 flex items-center gap-2 text-sm text-(--color-text-secondary)">
              <span>{icon}</span>
              <span>{district.vacancyReason}</span>
            </div>
          </div>
          <span className="shrink-0 rounded-md bg-(--color-bg-secondary) px-2 py-1 text-xs font-medium text-(--color-text-tertiary)">
            {district.region}
          </span>
        </div>

        {/* 전임 의원 */}
        {prev && prev.name !== "공석" && (
          <div className="mt-3 flex items-center gap-3 rounded-lg bg-(--color-bg-secondary) px-3 py-2">
            {prev.photoUrl ? (
              <Image
                src={prev.photoUrl}
                alt={prev.name}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: prev.party?.color ?? "#9ca3af" }}
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
      </div>

      {/* 후보자 목록 */}
      <div className="px-4 py-4 sm:px-5">
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
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-sm text-(--color-text-tertiary)">아직 등록된 후보가 없습니다</p>
            <p className="mt-1 text-xs text-(--color-text-tertiary)">
              후보 등록 기간에 업데이트됩니다
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
