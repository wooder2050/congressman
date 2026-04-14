"use client";

import { useState, useMemo } from "react";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getAssets } from "@/lib/api";
import type { AssetYear, AssetDetail } from "@/types";

interface AssetsTabProps {
  memberId: string;
}

/** 천원 단위 → 읽기 좋은 한국어 금액 (일관된 형식) */
function formatAmount(amountInThousands: number): string {
  const abs = Math.abs(amountInThousands);
  const sign = amountInThousands < 0 ? "-" : "";

  // 1억 이상: 억 단위 (소수점 1자리, .0 제거)
  if (abs >= 100_000) {
    const eok = abs / 100_000;
    return `${sign}${eok.toLocaleString("ko-KR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    })}억원`;
  }

  // 1만원 이상: 만 단위 (천 단위 구분자)
  if (abs >= 10) {
    const man = abs / 10;
    return `${sign}${man.toLocaleString("ko-KR")}만원`;
  }

  // 1만원 미만: 천원 단위 (천 단위 구분자)
  return `${sign}${abs.toLocaleString("ko-KR")}천원`;
}

const CATEGORY_COLORS: Record<string, string> = {
  건물: "#3B82F6",
  토지: "#10B981",
  예금: "#F59E0B",
  증권: "#8B5CF6",
  채무: "#EF4444",
  기타: "#6B7280",
};

/** 긴 카테고리명을 짧게 축약 */
const CATEGORY_SHORT: Record<string, string> = {
  "부동산에 관한 규정이 준용되는 권리와 자동차·건설기계·선박 및 항공기": "자동차·선박 등",
  "정치자금법에 따른 정치자금의 수입 및 지출을 위한 예금계좌의 예금": "정치자금 예금",
  "고지거부및 등록제외사항": "고지거부·제외",
  "고지거부 및 등록제외사항": "고지거부·제외",
};

function shortCategory(category: string): string {
  return CATEGORY_SHORT[category] ?? category;
}

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? "#6B7280";
}

/** 원본 데이터의 불필요한 중간 공백 정리 (예: "동양생 명보험" → "동양생명보험") */
function cleanSpaces(s: string): string {
  // 한글 사이의 단일 공백 제거 (예: "동양생 명보험", "푸르 덴셜")
  // 단, "증가", "감소" 앞 공백이나 숫자-한글 사이는 유지
  return s.replace(/([가-힣])(\s)([가-힣])/g, (_, a, _sp, b) => {
    // "증가", "감소" 같은 변동 키워드 앞은 유지
    if ("증감".includes(b)) return `${a} ${b}`;
    return `${a}${b}`;
  });
}

/**
 * 예금/보험 등 콤마로 연결된 item 문자열을 개별 항목으로 분리
 * "국민은행 3,430(2,230 증가), 신한은행 9,833(3,267 증가)" →
 * ["국민은행 3,430(2,230 증가)", "신한은행 9,833(3,267 증가)"]
 *
 * 분리 기준:
 * 1. "), " 뒤 한글/영문 시작 → 괄호 있는 항목 구분
 * 2. "숫자, " 뒤 한글/영문 시작 → 괄호 없는 항목 구분 (예: "새마을금고 52, 신한은행 7")
 */
function splitItemEntries(item: string): string[] {
  // "종류 - 세부내역" 형태면 세부내역 부분만 분리 대상
  const dashIdx = item.indexOf(" - ");
  let prefix = "";
  let body = item;
  if (dashIdx > 0 && dashIdx < 30) {
    prefix = item.slice(0, dashIdx + 3);
    body = item.slice(dashIdx + 3);
  }

  // 먼저 불필요한 공백 정리
  body = cleanSpaces(body);

  // 두 가지 패턴으로 분리:
  // 1) 닫는 괄호+콤마+공백+한글/영문: "), 국민은행"
  // 2) 숫자+콤마+공백+한글/영문(괄호 없는 항목): "52, 신한은행"
  const regex = /(?:\)|[\d])(?:,\s*)(?=[가-힣A-Za-z(])/g;
  const parts: string[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(body)) !== null) {
    // 분리 지점: 콤마 앞 문자()/숫자)는 이전 항목에 포함
    const splitAt = match.index + 1; // ")" 또는 숫자 다음
    parts.push(body.slice(lastIndex, splitAt));
    lastIndex = splitAt;
    // 콤마+공백 건너뛰기
    const rest = body.slice(splitAt);
    const skipMatch = rest.match(/^,\s*/);
    if (skipMatch) lastIndex = splitAt + skipMatch[0].length;
  }
  parts.push(body.slice(lastIndex));

  // 분리 결과가 1개면 원본 그대로
  if (parts.length <= 1) return [item];

  // prefix가 있으면 첫 항목에만 붙임
  return parts.map((p, i) => (i === 0 && prefix ? prefix + p.trim() : p.trim()));
}

/** 분리된 개별 항목에서 기관명, 금액, 증감을 파싱 */
function parseSubEntry(entry: string): {
  name: string;
  amountText: string;
  changeText: string;
} {
  // 불필요한 공백 정리
  const clean = cleanSpaces(entry);

  // "국민은행 3,430(2,230 증가)" or "신한은행 9,833" or "국민은행 3,110"
  const m = clean.match(/^(.+?)\s+([\d,]+)(?:\(([\d,]+\s*(?:증가|감소))\))?$/);
  if (m) {
    return {
      name: m[1].trim(),
      amountText: m[2],
      changeText: m[3] || "",
    };
  }
  return { name: clean, amountText: "", changeText: "" };
}

/** item 문자열에서 종류와 상세 설명을 분리 */
function parseItem(item: string): { type: string; detail: string } {
  const clean = cleanSpaces(item);
  const dashIdx = clean.indexOf(" - ");
  if (dashIdx > 0 && dashIdx < 30) {
    return { type: clean.slice(0, dashIdx).trim(), detail: clean.slice(dashIdx + 3).trim() };
  }
  const parenMatch = clean.match(/^(.+?\s*\(.+?\))\s*-\s*(.+)$/);
  if (parenMatch) {
    return { type: parenMatch[1].trim(), detail: parenMatch[2].trim() };
  }
  return { type: clean, detail: "" };
}

/** 예금/증권/보험 등 콤마 나열 패턴인지 판별 */
function isMultiEntryItem(item: string): boolean {
  return splitItemEntries(item).length > 1;
}

const RELATION_LABEL: Record<string, string> = {
  본인: "본인",
  배우자: "배우자",
  모: "어머니",
  부: "아버지",
  장녀: "장녀",
  장남: "장남",
  차녀: "차녀",
  차남: "차남",
};

const RELATION_COLORS: Record<string, string> = {
  본인: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  배우자: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
};

function relationBadgeClass(relation: string): string {
  return RELATION_COLORS[relation] ?? "bg-(--color-bg-tertiary) text-(--color-text-tertiary)";
}

function AssetSummaryCard({ years }: { years: AssetYear[] }) {
  const latest = years[0];
  const prev = years.length >= 2 ? years[1] : null;
  const diff = prev ? latest.total - prev.total : null;
  const pct = prev && prev.total !== 0 ? (diff! / Math.abs(prev.total)) * 100 : null;

  return (
    <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-(--color-text-tertiary)">{latest.year}년 총 재산</p>
        <p className="text-[11px] text-(--color-text-tertiary)">
          ({latest.year}년 정기 재산공개 기준)
        </p>
      </div>
      <p className="mt-1 text-3xl font-bold tabular-nums">{formatAmount(latest.total)}</p>
      {diff !== null && (
        <p
          className={`mt-1.5 text-sm font-medium ${
            diff > 0 ? "text-red-500" : diff < 0 ? "text-blue-500" : "text-(--color-text-tertiary)"
          }`}
        >
          {diff > 0 ? "▲" : diff < 0 ? "▼" : ""} {formatAmount(Math.abs(diff))}
          {pct !== null && ` (${diff >= 0 ? "+" : ""}${pct.toFixed(1)}%)`}
          <span className="ml-1 text-(--color-text-tertiary)">전년 대비</span>
        </p>
      )}
    </div>
  );
}

function CategoryCards({ year }: { year: AssetYear }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-(--color-text-tertiary)">
        {year.year}년 항목별 금액
      </h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {year.categories.map((c) => (
          <div key={c.category} className="rounded-lg bg-(--color-bg-secondary) p-3">
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: getCategoryColor(c.category) }}
              />
              <span className="text-xs text-(--color-text-tertiary)">
                {shortCategory(c.category)}
              </span>
            </div>
            <p className="mt-1 text-lg font-bold tabular-nums">{formatAmount(c.amount)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function YearBarChart({ years }: { years: AssetYear[] }) {
  const maxTotal = Math.max(...years.map((y) => Math.abs(y.total)), 1);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-(--color-text-tertiary)">연도별 총 재산</h3>
      <div className="space-y-2">
        {years.map((y, idx) => {
          const ratio = Math.abs(y.total) / maxTotal;
          const next = years[idx + 1];
          const diff = next ? y.total - next.total : null;
          return (
            <div key={y.year} className="flex items-center gap-3">
              <span className="w-10 text-right text-sm font-medium tabular-nums">{y.year}</span>
              <div className="relative h-7 flex-1 overflow-hidden rounded-md bg-(--color-bg-tertiary)">
                <div
                  className="absolute inset-y-0 left-0 rounded-md"
                  style={{
                    width: `${Math.max(ratio * 100, 2)}%`,
                    backgroundColor: y.total >= 0 ? "#3B82F6" : "#EF4444",
                  }}
                />
              </div>
              <span className="w-20 text-right text-sm font-semibold tabular-nums">
                {formatAmount(y.total)}
              </span>
              {diff !== null ? (
                <span
                  className={`w-24 text-right text-xs tabular-nums ${
                    diff > 0
                      ? "text-red-400"
                      : diff < 0
                        ? "text-blue-400"
                        : "text-(--color-text-tertiary)"
                  }`}
                >
                  {diff > 0 ? "▲" : diff < 0 ? "▼" : ""}
                  {formatAmount(Math.abs(diff))}
                </span>
              ) : (
                <span className="w-24" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CategoryBreakdown({ year }: { year: AssetYear }) {
  const positiveCategories = year.categories.filter((c) => c.amount > 0);
  const positiveTotal = positiveCategories.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-(--color-text-tertiary)">
        {year.year}년 항목별 비율
      </h3>
      {/* 스택 바 */}
      <div className="flex h-6 overflow-hidden rounded-full">
        {positiveCategories.map((c) => (
          <div
            key={c.category}
            style={{
              width: `${(c.amount / positiveTotal) * 100}%`,
              backgroundColor: getCategoryColor(c.category),
            }}
          />
        ))}
      </div>
      {/* 범례 */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {year.categories.map((c) => (
          <div key={c.category} className="flex items-center gap-1.5 text-xs sm:text-sm">
            <span
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: getCategoryColor(c.category) }}
            />
            <span className="text-(--color-text-secondary)">
              {shortCategory(c.category)} {formatAmount(c.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 콤마 나열 항목을 테이블로 렌더링 */
function MultiEntryTable({ item }: { item: string }) {
  const entries = splitItemEntries(item);
  const { type, detail } = parseItem(item);
  const hasPrefix = detail !== "";

  // entries에서 prefix(종류 - )를 제거한 뒤 파싱
  const parsed = entries.map((e) => {
    // 첫 항목은 "종류 - 국민은행 3,430..." 형태일 수 있음
    const dashIdx = e.indexOf(" - ");
    const clean = dashIdx > 0 && dashIdx < 30 ? e.slice(dashIdx + 3) : e;
    return parseSubEntry(clean);
  });

  // 순수 텍스트만 있는 경우(금액 파싱 실패) 줄바꿈만
  const hasAmounts = parsed.some((p) => p.amountText);

  if (!hasAmounts) {
    return (
      <div className="mt-1.5 space-y-0.5">
        {parsed.map((p, i) => (
          <p key={i} className="text-xs leading-relaxed text-(--color-text-secondary)">
            {p.name}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-1.5">
      {hasPrefix && <p className="mb-1 text-xs font-medium text-(--color-text-tertiary)">{type}</p>}
      <div className="divide-border-primary/50 divide-y text-xs sm:text-sm">
        {parsed.map((p, i) => (
          <div key={i} className="flex items-baseline justify-between gap-2 py-1 sm:py-1.5">
            <span className="min-w-0 shrink text-(--color-text-secondary)">{p.name}</span>
            <span className="flex shrink-0 items-baseline gap-1">
              <span className="font-medium tabular-nums">{p.amountText}</span>
              {p.changeText && (
                <span
                  className={`text-[11px] tabular-nums sm:text-xs ${
                    p.changeText.includes("증가") ? "text-red-400" : "text-blue-400"
                  }`}
                >
                  {p.changeText}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 건물/토지 소재지에서 주소 추출 (지도 링크용) — cleanSpaces 적용 전 원본 사용 */
function extractAddress(item: string): string | null {
  // parseItem의 cleanSpaces가 주소 공백을 제거하므로, 원본 item에서 직접 추출
  const dashIdx = item.indexOf(" - ");
  const target = dashIdx > 0 && dashIdx < 30 ? item.slice(dashIdx + 3) : item;
  const m = target.match(
    /((?:서울특별시|부산광역시|대구광역시|인천광역시|광주광역시|대전광역시|울산광역시|세종특별자치시|경기도|충청북도|충청남도|전라북도|전북특별자치도|전라남도|경상북도|경상남도|강원특별자치도|강원도|제주특별자치도)\s+\S+\s+\S+(?:\s+\S+)?)/,
  );
  return m ? m[1].replace(/\s+\d[\d,.]*㎡.*$/, "").trim() : null;
}

/** 단일 항목 렌더링 */
function SingleItemContent({ item, category }: { item: string; category: string }) {
  const { type, detail } = parseItem(item);
  const isRealEstate = category === "건물" || category === "토지";
  const address = isRealEstate ? extractAddress(item) : null;

  return (
    <div className="min-w-0 flex-1">
      <span className="text-sm font-medium">{type}</span>
      {detail && (
        <p className="mt-0.5 text-xs leading-relaxed text-(--color-text-secondary)">{detail}</p>
      )}
      {address && (
        <div className="mt-1 flex gap-2">
          <a
            href={`https://map.kakao.com/?q=${encodeURIComponent(address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-(--color-member-accent) no-underline hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            카카오맵
          </a>
          <a
            href={`https://map.naver.com/v5/search/${encodeURIComponent(address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-emerald-600 no-underline hover:underline dark:text-emerald-400"
            onClick={(e) => e.stopPropagation()}
          >
            네이버지도
          </a>
        </div>
      )}
    </div>
  );
}

function DetailSection({ years, details }: { years: AssetYear[]; details: AssetDetail[] }) {
  const [openYears, setOpenYears] = useState<Set<number>>(() => new Set([years[0]?.year]));
  const [openCategories, setOpenCategories] = useState<Set<string>>(() => new Set());

  const allYearKeys = useMemo(() => years.map((y) => y.year), [years]);
  const allCategoryKeys = useMemo(() => {
    const keys: string[] = [];
    for (const y of years) {
      if (!openYears.has(y.year)) continue;
      const yearDetails = details.filter((d) => d.year === y.year);
      const cats = [...new Set(yearDetails.map((d) => d.category))];
      for (const cat of cats) keys.push(`${y.year}-${cat}`);
    }
    return keys;
  }, [years, details, openYears]);

  const allYearsOpen = allYearKeys.every((y) => openYears.has(y));
  const allCatsOpen =
    allCategoryKeys.length > 0 && allCategoryKeys.every((k) => openCategories.has(k));

  const toggleYear = (year: number) => {
    setOpenYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
  };

  const toggleCategory = (key: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const expandAll = () => {
    setOpenYears(new Set(allYearKeys));
    const allKeys: string[] = [];
    for (const y of years) {
      const yearDetails = details.filter((d) => d.year === y.year);
      const cats = [...new Set(yearDetails.map((d) => d.category))];
      for (const cat of cats) allKeys.push(`${y.year}-${cat}`);
    }
    setOpenCategories(new Set(allKeys));
  };

  const collapseAll = () => {
    setOpenYears(new Set());
    setOpenCategories(new Set());
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-(--color-text-tertiary)">상세 내역</h3>
        <button
          onClick={allYearsOpen && allCatsOpen ? collapseAll : expandAll}
          className="rounded-md px-2.5 py-1 text-xs font-medium text-(--color-text-tertiary) transition-colors hover:bg-(--color-bg-secondary) hover:text-(--color-text-primary)"
        >
          {allYearsOpen && allCatsOpen ? "전체 접기" : "전체 펼치기"}
        </button>
      </div>

      <div className="divide-y divide-(--color-border-primary) overflow-hidden rounded-xl border border-(--color-border-primary)">
        {years.map((y) => {
          const isYearOpen = openYears.has(y.year);
          const yearDetails = details.filter((d) => d.year === y.year);
          const categories = [...new Set(yearDetails.map((d) => d.category))];

          return (
            <div key={y.year}>
              <button
                onClick={() => toggleYear(y.year)}
                className="flex w-full items-center justify-between bg-(--color-bg-primary) px-4 py-3 text-left transition-colors hover:bg-(--color-bg-secondary)"
              >
                <span className="text-base font-semibold">{y.year}년</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-(--color-text-tertiary)">
                    {formatAmount(y.total)}
                  </span>
                  <svg
                    className={`h-4 w-4 transition-transform ${isYearOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {isYearOpen && (
                <div className="divide-y divide-(--color-border-primary) bg-(--color-bg-secondary)">
                  {categories.map((cat) => {
                    const catKey = `${y.year}-${cat}`;
                    const isCatOpen = openCategories.has(catKey);
                    const catDetails = yearDetails.filter((d) => d.category === cat);
                    const catTotal = catDetails.reduce((sum, d) => sum + d.amount, 0);

                    // 관계별로 그룹핑
                    const byRelation = new Map<string, AssetDetail[]>();
                    for (const d of catDetails) {
                      const arr = byRelation.get(d.relation) || [];
                      arr.push(d);
                      byRelation.set(d.relation, arr);
                    }

                    return (
                      <div key={cat}>
                        <button
                          onClick={() => toggleCategory(catKey)}
                          className="flex w-full items-center justify-between gap-3 px-6 py-2.5 text-left transition-colors hover:bg-(--color-bg-tertiary)"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className="inline-block h-2 w-2 shrink-0 rounded-full"
                              style={{ backgroundColor: getCategoryColor(cat) }}
                            />
                            <span className="truncate text-sm font-medium">
                              {shortCategory(cat)}
                            </span>
                            <span className="shrink-0 text-xs text-(--color-text-tertiary)">
                              {catDetails.length}건
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="shrink-0 text-sm font-semibold tabular-nums">
                              {formatAmount(catTotal)}
                            </span>
                            <svg
                              className={`h-3.5 w-3.5 text-(--color-text-tertiary) transition-transform ${isCatOpen ? "rotate-180" : ""}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </button>

                        {isCatOpen && (
                          <div className="px-6 pt-1 pb-3">
                            {[...byRelation.entries()].map(([relation, items]) => (
                              <div key={relation} className="mt-2 first:mt-0">
                                <div className="mb-1.5 flex items-center gap-2">
                                  <span
                                    className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${relationBadgeClass(relation)}`}
                                  >
                                    {RELATION_LABEL[relation] ?? relation}
                                  </span>
                                  {items.length > 1 && (
                                    <span className="text-[11px] text-(--color-text-tertiary)">
                                      {items.length}건
                                    </span>
                                  )}
                                </div>
                                <div className="space-y-1.5 pl-0.5">
                                  {items.map((d, i) => {
                                    const multi = isMultiEntryItem(d.item);
                                    return (
                                      <div
                                        key={i}
                                        className="rounded-lg bg-(--color-bg-primary) p-3"
                                      >
                                        {multi ? (
                                          <div>
                                            <span
                                              className={`text-sm font-bold tabular-nums ${
                                                d.amount < 0 ? "text-blue-500" : ""
                                              }`}
                                            >
                                              {formatAmount(d.amount)}
                                            </span>
                                            <MultiEntryTable item={d.item} />
                                          </div>
                                        ) : (
                                          <div className="flex items-start justify-between gap-2">
                                            <SingleItemContent item={d.item} category={cat} />
                                            <span
                                              className={`shrink-0 text-sm font-bold tabular-nums ${
                                                d.amount < 0 ? "text-blue-500" : ""
                                              }`}
                                            >
                                              {formatAmount(d.amount)}
                                            </span>
                                          </div>
                                        )}
                                        {d.changeReason && (
                                          <p className="mt-1 text-[11px] text-(--color-text-tertiary)">
                                            변동사유: {d.changeReason}
                                          </p>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AssetsTab({ memberId }: AssetsTabProps) {
  const { data: assets } = useCongressSuspenseQuery(getAssets, memberId);

  if (assets.years.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-(--color-text-tertiary)">재산 신고 데이터가 없습니다.</p>
        <p className="text-text-tertiary/60 mt-1 text-sm">
          초선 의원의 경우 다음 신고 기간 이후 공개될 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4" role="tabpanel">
      <AssetSummaryCard years={assets.years} />
      <CategoryCards year={assets.years[0]} />
      <CategoryBreakdown year={assets.years[0]} />
      <YearBarChart years={assets.years} />
      <DetailSection years={assets.years} details={assets.details} />
    </div>
  );
}
