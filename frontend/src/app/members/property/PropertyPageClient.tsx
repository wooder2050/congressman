"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getPropertyStats } from "@/lib/api";
import {
  type PropertyCategory,
  type MemberPropertyProfile,
  PROPERTY_TABS,
  buildProfiles,
  formatPropertyAmount,
  isPropertyRelatedCommittee,
} from "@/lib/property-utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Pagination from "@/components/ui/pagination";
import ColorBadge from "@/components/ui/color-badge";
import MemberAvatar from "@/components/members/MemberAvatar";

const PAGE_SIZE = 30;

type SortKey = "count" | "amount" | "name" | "total" | "max";

const TAB_SORT_DEFAULTS: Record<PropertyCategory, SortKey> = {
  "multi-home": "count",
  "expensive-home": "max",
  "excessive-property": "total",
  none: "name",
};

function sortProfiles(profiles: MemberPropertyProfile[], sort: SortKey): MemberPropertyProfile[] {
  return [...profiles].sort((a, b) => {
    switch (sort) {
      case "count":
        return b.housingCount - a.housingCount || b.housingTotalAmount - a.housingTotalAmount;
      case "amount":
        return b.housingTotalAmount - a.housingTotalAmount;
      case "max":
        return b.maxSingleHousingAmount - a.maxSingleHousingAmount;
      case "total":
        return b.totalRealEstateAmount - a.totalRealEstateAmount;
      case "name":
        return a.name.localeCompare(b.name, "ko");
      default:
        return 0;
    }
  });
}

function extractLocation(item: string): string {
  const match = item.match(/- (.+?)(?:\s+(?:대지|건물))/);
  return match ? match[1] : (item.split(" - ")[1]?.split(" 건물")[0]?.split(" 대지")[0] ?? "");
}

export default function PropertyPageClient() {
  const { data } = useCongressSuspenseQuery(getPropertyStats);
  const profiles = useMemo(() => buildProfiles(data.members, data.assets), [data]);

  const [activeTab, setActiveTab] = useState<PropertyCategory>("multi-home");
  const [search, setSearch] = useState("");
  const [partyFilter, setPartyFilter] = useState("all");
  const [committeeFilter, setCommitteeFilter] = useState("all");
  const [sort, setSort] = useState<SortKey>(TAB_SORT_DEFAULTS["multi-home"]);
  const [page, setPage] = useState(1);

  // 탭별 인원수
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

  // 정당 목록
  const parties = useMemo(() => {
    const set = new Set(profiles.map((p) => p.party));
    return [...set].sort((a, b) => a.localeCompare(b, "ko"));
  }, [profiles]);

  // 위원회 목록
  const committees = useMemo(() => {
    const set = new Set(profiles.flatMap((p) => p.committees));
    return [...set].sort((a, b) => a.localeCompare(b, "ko"));
  }, [profiles]);

  const handleTabChange = useCallback((tab: string) => {
    const t = tab as PropertyCategory;
    setActiveTab(t);
    setSort(TAB_SORT_DEFAULTS[t]);
    setPage(1);
  }, []);

  // 필터링
  const filtered = useMemo(() => {
    let list = profiles.filter((p) => p.categories.includes(activeTab));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.includes(q));
    }
    if (partyFilter !== "all") {
      list = list.filter((p) => p.party === partyFilter);
    }
    if (committeeFilter !== "all") {
      list = list.filter((p) => p.committees.some((c) => c.includes(committeeFilter)));
    }
    return sortProfiles(list, sort);
  }, [profiles, activeTab, search, partyFilter, committeeFilter, sort]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetFilters = useCallback(() => {
    setSearch("");
    setPartyFilter("all");
    setCommitteeFilter("all");
    setPage(1);
  }, []);

  return (
    <div className="space-y-6">
      {/* 요약 카드 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {PROPERTY_TABS.map((tab) => {
          const count = categoryCounts[tab.value];
          const pct = ((count / profiles.length) * 100).toFixed(1);
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`rounded-xl border p-4 text-left transition-all ${
                isActive
                  ? "border-2 bg-(--color-bg-primary) shadow-sm"
                  : "border-(--color-border-primary) bg-(--color-bg-secondary) hover:bg-(--color-bg-hover)"
              }`}
              style={isActive ? { borderColor: tab.color } : undefined}
            >
              <div className="text-xs font-semibold text-(--color-text-tertiary)">{tab.label}</div>
              <div className="mt-1 text-xl font-bold" style={{ color: tab.color }}>
                {count}명
              </div>
              <div className="mt-0.5 text-xs text-(--color-text-tertiary)">
                {profiles.length}명 중 {pct}%
              </div>
            </button>
          );
        })}
      </div>

      {/* 탭 */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList variant="line" className="w-full">
          {PROPERTY_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-sm font-semibold">
              {tab.label} ({categoryCounts[tab.value]})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* 컨트롤 바 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="의원 이름 검색"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-48"
        />
        <Select
          value={partyFilter}
          onValueChange={(v) => {
            setPartyFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="정당 전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">정당 전체</SelectItem>
            {parties.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={committeeFilter}
          onValueChange={(v) => {
            setCommitteeFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="위원회 전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">위원회 전체</SelectItem>
            {committees.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-1">
          {activeTab === "multi-home" && (
            <>
              <SortButton label="주택수" sort="count" current={sort} onClick={setSort} />
              <SortButton label="금액" sort="amount" current={sort} onClick={setSort} />
            </>
          )}
          {activeTab === "expensive-home" && (
            <SortButton label="금액" sort="max" current={sort} onClick={setSort} />
          )}
          {activeTab === "excessive-property" && (
            <SortButton label="총액" sort="total" current={sort} onClick={setSort} />
          )}
          <SortButton label="이름" sort="name" current={sort} onClick={setSort} />
        </div>
      </div>

      {/* 결과 수 + 필터 초기화 */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-(--color-text-tertiary)">총 {filtered.length}명</span>
        {(search || partyFilter !== "all" || committeeFilter !== "all") && (
          <button
            onClick={resetFilters}
            className="text-sm text-(--color-text-tertiary) hover:text-(--color-text-primary)"
          >
            필터 초기화
          </button>
        )}
      </div>

      {/* 의원 리스트 */}
      {pageItems.length === 0 ? (
        <div className="py-12 text-center text-(--color-text-tertiary)">
          조건에 해당하는 의원이 없습니다.
        </div>
      ) : (
        <div className="space-y-2">
          {pageItems.map((m, i) => (
            <MemberPropertyRow
              key={m.memberId}
              profile={m}
              rank={(page - 1) * PAGE_SIZE + i + 1}
              tab={activeTab}
            />
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {/* 하단 disclaimer */}
      <div className="rounded-lg bg-(--color-bg-secondary) p-4 text-xs leading-relaxed text-(--color-text-tertiary)">
        <p className="font-semibold">안내</p>
        <ul className="mt-1 list-inside list-disc space-y-0.5">
          <li>
            이 페이지는 2025년 12월 31일 기준 재산신고 공개 자료(2026년 3월 공개)를 기반으로
            대통령의 부동산 관련 인사 기준을 22대 국회의원에 참고 적용한 것입니다.
          </li>
          <li>재산신고 가액은 공시가격 기준이며 실거래 시세와 차이가 있을 수 있습니다.</li>
          <li>대통령 지시는 행정부 공직자 대상이며, 국회의원에 직접 적용되는 기준이 아닙니다.</li>
          <li>본인 및 배우자 명의 자산만 포함됩니다. 전세(임차)권은 제외됩니다.</li>
        </ul>
      </div>
    </div>
  );
}

// ====== 하위 컴포넌트 ======

function SortButton({
  label,
  sort,
  current,
  onClick,
}: {
  label: string;
  sort: SortKey;
  current: SortKey;
  onClick: (s: SortKey) => void;
}) {
  const isActive = sort === current;
  return (
    <button
      onClick={() => onClick(sort)}
      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
        isActive
          ? "bg-(--color-text-primary) text-(--color-text-inverse)"
          : "bg-(--color-bg-secondary) text-(--color-text-secondary) hover:bg-(--color-bg-tertiary)"
      }`}
    >
      {label}순
    </button>
  );
}

function MemberPropertyRow({
  profile: m,
  rank,
  tab,
}: {
  profile: MemberPropertyProfile;
  rank: number;
  tab: PropertyCategory;
}) {
  return (
    <Link
      href={`/members/${m.memberId}`}
      className="flex items-center gap-3 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-3 no-underline transition-colors hover:bg-(--color-bg-hover) sm:p-4"
    >
      {/* 순위 */}
      <span className="w-7 shrink-0 text-center text-sm font-bold text-(--color-text-tertiary)">
        {rank}
      </span>

      {/* 사진 */}
      <MemberAvatar name={m.name} photoUrl={m.photoUrl} size={44} bgColor={m.partyColor} />

      {/* 정보 */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-(--color-text-primary)">{m.name}</span>
          <ColorBadge label={m.party} color={m.partyColor} size="sm" />
        </div>
        <div className="mt-0.5 text-xs text-(--color-text-tertiary)">
          {m.proportional ? "비례대표" : m.district}
          {m.committees.length > 0 && (
            <>
              {" · "}
              {m.committees.map((c, i) => (
                <span key={c}>
                  {i > 0 && ", "}
                  <span
                    className={isPropertyRelatedCommittee(c) ? "font-semibold text-purple-600" : ""}
                  >
                    {c.replace("위원회", "")}
                  </span>
                </span>
              ))}
            </>
          )}
        </div>
      </div>

      {/* 탭별 핵심 수치 */}
      <div className="shrink-0 text-right">
        {tab === "multi-home" && (
          <>
            <div className="text-base font-bold text-(--color-text-primary)">
              {m.housingCount}채
            </div>
            <div className="text-xs text-(--color-text-tertiary)">
              {formatPropertyAmount(m.housingTotalAmount)}
            </div>
          </>
        )}
        {tab === "expensive-home" && (
          <>
            <div className="text-base font-bold text-(--color-text-primary)">
              {formatPropertyAmount(m.maxSingleHousingAmount)}
            </div>
            <div className="max-w-40 truncate text-xs text-(--color-text-tertiary)">
              {extractLocation(m.maxSingleHousingItem)}
            </div>
            <div className="text-xs text-(--color-text-tertiary)">{m.maxSingleHousingRelation}</div>
          </>
        )}
        {tab === "excessive-property" && (
          <>
            <div className="text-base font-bold text-(--color-text-primary)">
              {formatPropertyAmount(m.totalRealEstateAmount)}
            </div>
            <div className="text-xs text-(--color-text-tertiary)">
              건물 {formatPropertyAmount(m.buildingAmount)} · 토지{" "}
              {formatPropertyAmount(m.landAmount)}
            </div>
          </>
        )}
        {tab === "none" && (
          <div className="text-xs text-(--color-text-tertiary)">{m.electedCount}선</div>
        )}
      </div>
    </Link>
  );
}
