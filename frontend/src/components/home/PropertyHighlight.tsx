"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getPropertyStats } from "@/lib/api";
import MemberAvatar from "@/components/members/MemberAvatar";
import {
  type PropertyCategory,
  type MemberPropertyProfile,
  buildProfiles,
  formatPropertyAmount,
} from "@/lib/property-utils";

const CATEGORIES: {
  value: PropertyCategory;
  label: string;
  color: string;
  bgClass: string;
  textClass: string;
}[] = [
  {
    value: "multi-home",
    label: "다주택자",
    color: "#dc2626",
    bgClass: "bg-red-50 dark:bg-red-950/30",
    textClass: "text-red-600 dark:text-red-400",
  },
  {
    value: "expensive-home",
    label: "고가주택",
    color: "#d97706",
    bgClass: "bg-amber-50 dark:bg-amber-950/30",
    textClass: "text-amber-600 dark:text-amber-400",
  },
  {
    value: "excessive-property",
    label: "부동산 과다",
    color: "#7c3aed",
    bgClass: "bg-violet-50 dark:bg-violet-950/30",
    textClass: "text-violet-600 dark:text-violet-400",
  },
];

function getTopMembers(
  profiles: MemberPropertyProfile[],
  category: PropertyCategory,
  count: number,
) {
  const filtered = profiles.filter((p) => p.categories.includes(category));
  switch (category) {
    case "multi-home":
      return filtered
        .sort(
          (a, b) => b.housingCount - a.housingCount || b.housingTotalAmount - a.housingTotalAmount,
        )
        .slice(0, count);
    case "expensive-home":
      return filtered
        .sort((a, b) => b.maxSingleHousingAmount - a.maxSingleHousingAmount)
        .slice(0, count);
    case "excessive-property":
      return filtered
        .sort((a, b) => b.totalRealEstateAmount - a.totalRealEstateAmount)
        .slice(0, count);
    default:
      return [];
  }
}

function formatValue(profile: MemberPropertyProfile, category: PropertyCategory): string {
  switch (category) {
    case "multi-home":
      return `${profile.housingCount}채 · ${formatPropertyAmount(profile.housingTotalAmount)}`;
    case "expensive-home":
      return formatPropertyAmount(profile.maxSingleHousingAmount);
    case "excessive-property":
      return formatPropertyAmount(profile.totalRealEstateAmount);
    default:
      return "";
  }
}

export default function PropertyHighlight() {
  const { data } = useCongressSuspenseQuery(getPropertyStats);
  const profiles = useMemo(() => buildProfiles(data.members, data.assets), [data]);

  const categoryCounts = useMemo(() => {
    const counts: Record<PropertyCategory, number> = {
      "multi-home": 0,
      "expensive-home": 0,
      "excessive-property": 0,
      none: 0,
    };
    for (const p of profiles) {
      for (const c of p.categories) counts[c]++;
    }
    return counts;
  }, [profiles]);

  return (
    <div className="space-y-4">
      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.value}
            href={`/members/property?tab=${cat.value}`}
            className={`rounded-xl p-3 text-center no-underline transition-colors hover:opacity-80 ${cat.bgClass}`}
          >
            <div className={`text-2xl font-extrabold ${cat.textClass}`}>
              {categoryCounts[cat.value]}명
            </div>
            <div className="mt-0.5 text-xs text-(--color-text-secondary)">{cat.label}</div>
            <div className="text-xs text-(--color-text-tertiary)">
              {((categoryCounts[cat.value] / profiles.length) * 100).toFixed(0)}%
            </div>
          </Link>
        ))}
      </div>

      {/* TOP 3 리스트 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {CATEGORIES.map((cat) => {
          const top = getTopMembers(profiles, cat.value, 3);
          return (
            <div key={cat.value} className="space-y-2">
              <h3 className="text-sm font-bold text-(--color-text-primary)">{cat.label} TOP 3</h3>
              <div className="space-y-1.5">
                {top.map((member, idx) => (
                  <Link
                    key={member.memberId}
                    href={`/members/${member.memberId}?term=22`}
                    className="flex items-center gap-2.5 rounded-lg border border-(--color-border-primary) bg-(--color-bg-primary) p-2.5 no-underline transition-colors hover:bg-(--color-bg-hover)"
                  >
                    <span
                      className={`w-5 text-center text-sm font-bold ${
                        idx === 0
                          ? "text-amber-500"
                          : idx === 1
                            ? "text-gray-400"
                            : "text-amber-700"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <MemberAvatar
                      name={member.name}
                      photoUrl={member.photoUrl}
                      size={32}
                      bgColor={member.partyColor}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-(--color-text-primary)">
                          {member.name}
                        </span>
                        <span className="text-xs text-(--color-text-tertiary)">{member.party}</span>
                      </div>
                      <div className={`text-xs font-medium ${cat.textClass}`}>
                        {formatValue(member, cat.value)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 상세 보기 링크 */}
      <div className="text-center">
        <Link
          href="/members/property"
          className="inline-flex items-center gap-1 text-sm font-medium text-(--color-primary) hover:underline"
        >
          전체 부동산 현황 보기 →
        </Link>
      </div>
    </div>
  );
}
