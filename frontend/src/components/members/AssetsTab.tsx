"use client";

import { useState } from "react";
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
};

function shortCategory(category: string): string {
  return CATEGORY_SHORT[category] ?? category;
}

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? "#6B7280";
}

function AssetSummaryCard({ years }: { years: AssetYear[] }) {
  const latest = years[0];
  const prev = years.length >= 2 ? years[1] : null;
  const diff = prev ? latest.total - prev.total : null;
  const pct = prev && prev.total !== 0 ? (diff! / Math.abs(prev.total)) * 100 : null;

  return (
    <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
      <p className="text-sm text-(--color-text-tertiary)">{latest.year}년 총 재산</p>
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

/** item 문자열에서 종류와 상세 설명을 분리 */
function parseItem(item: string): { type: string; detail: string } {
  // "아파트 - 서울특별시 ..." or "자동차 - 2021년식 ..." or "상장주식 - 안랩 ..."
  const dashIdx = item.indexOf(" - ");
  if (dashIdx > 0 && dashIdx < 30) {
    return { type: item.slice(0, dashIdx).trim(), detail: item.slice(dashIdx + 3).trim() };
  }
  // "(전세(임차)권)" 같은 접미사가 포함된 경우
  const parenMatch = item.match(/^(.+?\s*\(.+?\))\s*-\s*(.+)$/);
  if (parenMatch) {
    return { type: parenMatch[1].trim(), detail: parenMatch[2].trim() };
  }
  return { type: item, detail: "" };
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

function DetailAccordion({ years, details }: { years: AssetYear[]; details: AssetDetail[] }) {
  const [openYear, setOpenYear] = useState<number | null>(years[0]?.year ?? null);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-(--color-text-tertiary)">상세 내역</h3>
      <div className="divide-y divide-(--color-border-primary) overflow-hidden rounded-xl border border-(--color-border-primary)">
        {years.map((y) => {
          const isYearOpen = openYear === y.year;
          const yearDetails = details.filter((d) => d.year === y.year);
          const categories = [...new Set(yearDetails.map((d) => d.category))];

          return (
            <div key={y.year}>
              <button
                onClick={() => setOpenYear(isYearOpen ? null : y.year)}
                className="flex w-full items-center justify-between bg-(--color-bg-primary) px-4 py-3 text-left hover:bg-(--color-bg-secondary)"
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
                    const isCatOpen = openCategory === `${y.year}-${cat}`;
                    const catDetails = yearDetails.filter((d) => d.category === cat);
                    const catTotal = catDetails.reduce((sum, d) => sum + d.amount, 0);

                    return (
                      <div key={cat}>
                        <button
                          onClick={() => setOpenCategory(isCatOpen ? null : `${y.year}-${cat}`)}
                          className="flex w-full items-center justify-between gap-3 px-6 py-2.5 text-left hover:bg-(--color-bg-tertiary)"
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
                          <span className="shrink-0 text-sm font-semibold tabular-nums">
                            {formatAmount(catTotal)}
                          </span>
                        </button>

                        {isCatOpen && (
                          <div className="space-y-1 px-6 pt-1 pb-3">
                            {catDetails.map((d, i) => {
                              const { type, detail } = parseItem(d.item);
                              const relationLabel = RELATION_LABEL[d.relation] ?? d.relation;
                              return (
                                <div key={i} className="rounded-lg bg-(--color-bg-primary) p-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="text-sm font-medium">{type}</span>
                                        <span className="rounded-full bg-(--color-bg-tertiary) px-2 py-0.5 text-xs text-(--color-text-tertiary)">
                                          {relationLabel}
                                        </span>
                                      </div>
                                      {detail && (
                                        <p className="mt-1 text-xs leading-relaxed text-(--color-text-secondary)">
                                          {detail}
                                        </p>
                                      )}
                                    </div>
                                    <span
                                      className={`shrink-0 text-sm font-bold tabular-nums ${
                                        d.amount < 0 ? "text-blue-500" : ""
                                      }`}
                                    >
                                      {formatAmount(d.amount)}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
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
        <p className="mt-1 text-sm text-(--color-text-tertiary)/60">
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
      <DetailAccordion years={assets.years} details={assets.details} />
    </div>
  );
}
