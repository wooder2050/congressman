"use client";

import { useState } from "react";
import type { AssetResponse, AssetYear, AssetDetail } from "@/types";

interface AssetsTabProps {
  assets: AssetResponse;
}

/** 천원 단위 → 읽기 좋은 한국어 금액 */
function formatAmount(amountInThousands: number): string {
  const abs = Math.abs(amountInThousands);
  const sign = amountInThousands < 0 ? "-" : "";

  if (abs >= 100_000) {
    const eok = abs / 100_000;
    return `${sign}${eok.toFixed(1).replace(/\.0$/, "")}억원`;
  }
  if (abs >= 10_000) {
    const man = abs / 10_000;
    return `${sign}${man.toFixed(0)}만원`;
  }
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

function YearBarChart({ years }: { years: AssetYear[] }) {
  const maxTotal = Math.max(...years.map((y) => Math.abs(y.total)), 1);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-(--color-text-tertiary)">연도별 총 재산</h3>
      <div className="space-y-2">
        {years.map((y) => {
          const ratio = Math.abs(y.total) / maxTotal;
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
                            <span className="truncate text-sm font-medium">{cat}</span>
                          </div>
                          <span className="shrink-0 text-sm text-(--color-text-tertiary) tabular-nums">
                            {formatAmount(catTotal)}
                          </span>
                        </button>

                        {isCatOpen && (
                          <div className="divide-y divide-(--color-border-primary)">
                            {catDetails.map((d, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between px-10 py-2 text-sm"
                              >
                                <div className="min-w-0 flex-1">
                                  <span className="line-clamp-1">{d.item}</span>
                                  <span className="text-xs text-(--color-text-tertiary)">
                                    {d.relation}
                                  </span>
                                </div>
                                <span className="ml-3 shrink-0 font-medium tabular-nums">
                                  {formatAmount(d.amount)}
                                </span>
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

export default function AssetsTab({ assets }: AssetsTabProps) {
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
      <YearBarChart years={assets.years} />
      <CategoryBreakdown year={assets.years[0]} />
      <DetailAccordion years={assets.years} details={assets.details} />
    </div>
  );
}
