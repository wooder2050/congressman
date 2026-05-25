"use client";

import { useEffect, useId, useMemo, useState } from "react";
import type { CandidateAssetItem } from "@/types";
import { formatWon } from "./CandidateDisclosureSection";

/** 카테고리 라벨 → DOM id 안전한 슬러그 */
function categoryToSlug(cat: string): string {
  return cat.replace(/[^a-zA-Z0-9가-힣]/g, "-").slice(0, 32);
}

/** source identifier → 표시용 라벨 */
function sourceLabel(source: string): string {
  switch (source) {
    case "nec_ocr_vision":
      return "선관위 신고서 (Vision OCR)";
    case "opengirok":
      return "정보공개센터";
    case "peti":
      return "공직윤리시스템";
    case "manual":
      return "수동 입력";
    default:
      return source;
  }
}

interface Props {
  items: CandidateAssetItem[];
  /** 본인 기준 신고된 총액(있다면) — 항목 합계와 함께 표시 */
  declaredTotal?: string | null;
  /** source별 전체 데이터 (다중 source 토글용) */
  itemsBySource?: Record<string, CandidateAssetItem[]>;
}

/** 항목별 합계 계산 (BigInt 누적 후 string 환원) */
function sumValues(items: CandidateAssetItem[]): string {
  let total = BigInt(0);
  for (const it of items) {
    if (it.currentValue) {
      try {
        total = total + BigInt(it.currentValue);
      } catch {
        /* ignore */
      }
    }
  }
  return total.toString();
}

const CATEGORY_ORDER = [
  "토지",
  "건물",
  "현금",
  "예금",
  "증권",
  "채권",
  "채무",
  "회원권",
  "보석류",
  "골동품 및 예술품",
  "금 및 백금",
  "지식재산권",
  "가상자산",
  "합명·합자·유한회사 출자지분",
  "비영리법인에 출연한 재산",
  "정치자금법에 따른 정치자금의 수입 및 지출을 위한 예금계좌의 예금",
  "고지거부 및 등록제외사항",
  // 자동차 카테고리 — 정확한 명칭은 매우 길어 별도 매핑
];

const CATEGORY_ICONS: Record<string, string> = {
  토지: "🏞️",
  건물: "🏢",
  현금: "💵",
  예금: "🏦",
  증권: "📈",
  채권: "📜",
  채무: "💳",
  회원권: "🎫",
  보석류: "💎",
  지식재산권: "📚",
  가상자산: "🪙",
  "고지거부 및 등록제외사항": "🚫",
};

function getCategoryIcon(cat: string): string {
  if (CATEGORY_ICONS[cat]) return CATEGORY_ICONS[cat];
  if (cat.includes("자동차") || cat.includes("건설기계")) return "🚗";
  if (cat.includes("정치자금")) return "📒";
  if (cat.includes("출자지분")) return "🤝";
  if (cat.includes("비영리")) return "🎗️";
  if (cat.includes("골동품") || cat.includes("예술")) return "🖼️";
  if (cat.includes("금 및 백금")) return "🥇";
  return "📂";
}

/** 카테고리 라벨 단축 (긴 카테고리는 짧게) */
function shortCategoryLabel(cat: string): string {
  if (cat.includes("부동산에") && cat.includes("자동차")) return "자동차·건설기계 등";
  if (cat.includes("정치자금")) return "정치자금 예금";
  if (cat.includes("출자지분")) return "출자지분";
  if (cat.includes("비영리")) return "비영리법인 출연재산";
  return cat;
}

function sortCategories(cats: string[]): string[] {
  return cats.sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a);
    const ib = CATEGORY_ORDER.indexOf(b);
    if (ia < 0 && ib < 0) return a.localeCompare(b);
    if (ia < 0) return 1;
    if (ib < 0) return -1;
    return ia - ib;
  });
}

interface CategorySummary {
  category: string;
  total: bigint;
  itemCount: number;
  items: CandidateAssetItem[];
}

export default function CandidateAssetBreakdown({ items, declaredTotal, itemsBySource }: Props) {
  const reactId = useId();
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  // 다중 source 토글: 기본은 props로 받은 items의 source
  const defaultSource = items[0]?.source ?? "";
  const [activeSource, setActiveSource] = useState<string>(defaultSource);

  // codex #1: props로 받은 source(후보 변경 등)와 activeSource 동기화 — stale state 방지
  useEffect(() => {
    setActiveSource(defaultSource);
    // codex #4: 후보가 바뀌면 펼친 카테고리도 reset
    setExpandedCats(new Set());
  }, [defaultSource]);

  // 실제 표시할 items — 토글된 source가 있으면 그쪽 데이터, 아니면 기본 props
  const effectiveItems =
    itemsBySource && activeSource && itemsBySource[activeSource]
      ? itemsBySource[activeSource]
      : items;

  // 사용 가능한 source 목록 (itemsBySource가 있고 2개 이상일 때만 토글 노출)
  const sourceOptions =
    itemsBySource && Object.keys(itemsBySource).length > 1
      ? Object.entries(itemsBySource)
          .map(([src, list]) => ({ source: src, itemCount: list.length }))
          .sort((a, b) => b.itemCount - a.itemCount)
      : null;

  const summary = useMemo(() => {
    const byCat = new Map<string, CategorySummary>();
    for (const item of effectiveItems) {
      const existing = byCat.get(item.category) ?? {
        category: item.category,
        total: BigInt(0),
        itemCount: 0,
        items: [],
      };
      existing.itemCount += 1;
      existing.items.push(item);
      if (item.currentValue) {
        try {
          existing.total += BigInt(item.currentValue);
        } catch {
          /* ignore */
        }
      }
      byCat.set(item.category, existing);
    }
    const sorted = sortCategories(Array.from(byCat.keys())).map((c) => byCat.get(c)!);
    return sorted;
  }, [effectiveItems]);

  const itemsTotal = useMemo(() => sumValues(effectiveItems), [effectiveItems]);
  const source = effectiveItems[0]?.source ?? "";
  const sourceUrl = effectiveItems[0]?.sourceUrl ?? null;
  const sourceDate = effectiveItems[0]?.sourceDate ?? null;

  if (effectiveItems.length === 0) return null;

  function toggleCat(cat: string) {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  return (
    <div className="mt-3 rounded-lg border border-(--color-border-secondary) bg-(--color-bg-secondary) p-3">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h4 className="text-xs font-bold text-(--color-text-tertiary)">
          항목별 재산 상세 ({effectiveItems.length}건)
        </h4>
        <span className="text-[10px] text-(--color-text-tertiary)">
          {sourceLabel(source)}
          {sourceDate && ` · ${sourceDate}`}
        </span>
      </div>

      {/* Source 토글 — 2개 이상 source가 있을 때만 노출 (codex #6 a11y) */}
      {sourceOptions && (
        <div
          role="group"
          aria-label="자산 데이터 출처 선택"
          className="mb-2 flex flex-wrap gap-1.5"
        >
          <span className="text-[10px] text-(--color-text-tertiary)">출처 전환:</span>
          {sourceOptions.map((opt) => {
            const isActive = opt.source === activeSource;
            return (
              <button
                key={opt.source}
                type="button"
                aria-pressed={isActive}
                onClick={() => {
                  setActiveSource(opt.source);
                  // codex #4: source 전환 시 펼친 카테고리 reset (다른 source는 카테고리 구성이 다를 수 있음)
                  setExpandedCats(new Set());
                }}
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
                  isActive
                    ? "bg-(--color-primary) text-white"
                    : "bg-(--color-bg-primary) text-(--color-text-secondary) hover:bg-(--color-bg-hover)"
                }`}
              >
                {sourceLabel(opt.source)} ({opt.itemCount})
              </button>
            );
          })}
        </div>
      )}

      {/* 합계 비교 (선관위 신고 vs 항목 합계) */}
      {declaredTotal && (
        <div className="mb-2 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-md bg-(--color-bg-primary) px-2.5 py-2">
            <p className="text-[10px] text-(--color-text-tertiary)">선관위 신고액</p>
            <p className="font-bold text-(--color-text-primary)">{formatWon(declaredTotal)}</p>
          </div>
          <div className="rounded-md bg-(--color-bg-primary) px-2.5 py-2">
            <p className="text-[10px] text-(--color-text-tertiary)">항목 합계</p>
            <p className="font-bold text-(--color-text-primary)">{formatWon(itemsTotal)}</p>
          </div>
        </div>
      )}

      {/* 카테고리별 카드 */}
      <ul className="space-y-1.5">
        {summary.map((cat) => {
          const expanded = expandedCats.has(cat.category);
          const totalStr = cat.total.toString();
          const panelId = `${reactId}-${categoryToSlug(cat.category)}`;
          return (
            <li
              key={cat.category}
              className="overflow-hidden rounded-md border border-(--color-border-secondary) bg-(--color-bg-primary)"
            >
              <button
                type="button"
                onClick={() => toggleCat(cat.category)}
                className="flex w-full items-center gap-2 px-2.5 py-2 text-left transition-colors hover:bg-(--color-bg-hover)"
                aria-expanded={expanded}
                aria-controls={panelId}
              >
                <span className="text-base leading-none" aria-hidden="true">
                  {getCategoryIcon(cat.category)}
                </span>
                <span className="flex-1 text-xs font-medium text-(--color-text-primary)">
                  {shortCategoryLabel(cat.category)}
                </span>
                <span className="text-[10px] text-(--color-text-tertiary)">{cat.itemCount}건</span>
                <span className="min-w-20 text-right text-xs font-bold text-(--color-text-primary)">
                  {cat.total !== BigInt(0) ? formatWon(totalStr) : "—"}
                </span>
                <span
                  className={`text-[10px] text-(--color-text-tertiary) transition-transform ${expanded ? "rotate-180" : ""}`}
                  aria-hidden="true"
                >
                  ▼
                </span>
              </button>

              {expanded && (
                <ul
                  id={panelId}
                  className="divide-y divide-(--color-border-secondary) border-t border-(--color-border-secondary) bg-(--color-bg-secondary)"
                >
                  {cat.items.map((item) => (
                    <li key={item.id} className="px-2.5 py-2 text-[11px]">
                      <div className="flex items-start gap-2">
                        <span className="shrink-0 rounded bg-(--color-bg-tertiary) px-1.5 py-0.5 text-[10px] font-medium text-(--color-text-secondary)">
                          {item.relation}
                        </span>
                        <div className="min-w-0 flex-1">
                          {item.subCategory && (
                            <p className="text-(--color-text-secondary)">{item.subCategory}</p>
                          )}
                          <p className="mt-0.5 leading-snug text-(--color-text-tertiary)">
                            {item.description}
                          </p>
                          {item.changeReason && (
                            <p className="mt-0.5 text-[10px] text-(--color-text-tertiary)">
                              변동사유: {item.changeReason}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-medium text-(--color-text-primary)">
                            {item.currentValue ? formatWon(item.currentValue) : "—"}
                          </p>
                          {item.previousValue && item.previousValue !== item.currentValue && (
                            <p className="text-[10px] text-(--color-text-tertiary)">
                              종전 {formatWon(item.previousValue)}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-2 space-y-1">
        {/* OCR 경고는 sourceUrl 유무와 무관하게 항상 표시 (codex #1) */}
        {source === "nec_ocr_vision" && (
          <p className="rounded-md border border-amber-300 bg-amber-50 px-2 py-1.5 text-[10px] leading-relaxed text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-200">
            <span className="font-bold">⚠ 자동 OCR 변환 결과</span>입니다. 일부 글자·숫자에 오차가
            있을 수 있으니 정확한 수치는 상단의 <strong>재산신고서 원문 PDF</strong>를 참고하세요.
          </p>
        )}
        {sourceUrl && (
          <p className="text-[10px] text-(--color-text-tertiary)">
            출처:{" "}
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-(--color-primary) hover:underline"
            >
              {source === "nec_ocr_vision"
                ? "중앙선관위 후보자 재산신고서"
                : source === "opengirok"
                  ? "정보공개센터 국회의원 재산공개 데이터"
                  : sourceLabel(source)}
            </a>{" "}
            · 본인 외 가족 정보 포함
          </p>
        )}
      </div>
    </div>
  );
}
