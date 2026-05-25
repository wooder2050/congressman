import type { CandidateAssetItem } from '@prisma/client';

/** 자산 항목 → API 응답 매핑 (BigInt → string, 검수 메타 포함) */
export function mapAssetItemForApi(item: CandidateAssetItem) {
  return {
    id: item.id,
    category: item.category,
    subCategory: item.subCategory,
    relation: item.relation,
    description: item.description,
    currentValue: item.currentValue !== null ? item.currentValue.toString() : null,
    previousValue: item.previousValue !== null ? item.previousValue.toString() : null,
    increaseValue: item.increaseValue !== null ? item.increaseValue.toString() : null,
    decreaseValue: item.decreaseValue !== null ? item.decreaseValue.toString() : null,
    marketPrice: item.marketPrice !== null ? item.marketPrice.toString() : null,
    changeReason: item.changeReason,
    source: item.source,
    sourceUrl: item.sourceUrl,
    sourceDate: item.sourceDate,
    reviewedAt: item.reviewedAt ? item.reviewedAt.toISOString() : null,
    reviewer: item.reviewer,
    pdfSourceHash: item.pdfSourceHash,
  };
}

/**
 * 항목 배열의 currentValue 합계 (BigInt → string)
 * null은 0 취급. 음수(채무)는 차감.
 */
export function sumItemValues(items: CandidateAssetItem[]): string {
  let total = BigInt(0);
  for (const it of items) {
    if (it.currentValue !== null) total += it.currentValue;
  }
  return total.toString();
}

/**
 * 검수 메타 요약: 한 source 안에서 검수된 항목 비율·가장 최근 검수일·pdfSourceHash 등
 */
interface SourceReviewSummary {
  totalItems: number;
  reviewedItems: number;
  latestReviewedAt: string | null;
  reviewers: string[]; // 고유 검수자 목록
  pdfSourceHashes: string[]; // 고유 PDF hash 목록 (보통 1개)
}

export function summarizeReview(items: CandidateAssetItem[]): SourceReviewSummary {
  const reviewers = new Set<string>();
  const hashes = new Set<string>();
  let reviewedItems = 0;
  let latestReviewedAt: Date | null = null;
  for (const it of items) {
    if (it.reviewedAt) {
      reviewedItems++;
      if (!latestReviewedAt || it.reviewedAt > latestReviewedAt) latestReviewedAt = it.reviewedAt;
    }
    if (it.reviewer) reviewers.add(it.reviewer);
    if (it.pdfSourceHash) hashes.add(it.pdfSourceHash);
  }
  return {
    totalItems: items.length,
    reviewedItems,
    latestReviewedAt: latestReviewedAt ? latestReviewedAt.toISOString() : null,
    reviewers: [...reviewers],
    pdfSourceHashes: [...hashes],
  };
}

/**
 * 후보자 자산 항목 source 우선순위·선택 헬퍼
 *
 * 한 후보가 여러 source(nec_ocr_vision, opengirok 등)에 걸쳐 자산 항목을 갖는 경우
 * 한 번에 한 source만 노출. 사용자가 다른 source를 보고 싶으면 `availableSources` 목록으로 토글 가능.
 *
 * 우선순위 결정 기준 (codex 리뷰 #2 반영):
 *   1) 사전 정의 우선순위 (nec_ocr_vision > peti > opengirok > manual)
 *   2) 동률이면 더 최근 sourceDate
 *   3) 그래도 동률이면 더 많은 항목을 가진 source (완성도)
 */

const ASSET_SOURCE_PRIORITY: Record<string, number> = {
  nec_ocr_vision: 4,
  peti: 3,
  opengirok: 2,
  manual: 1,
};

interface SourceSummary {
  source: string;
  sourceDate: string | null;
  itemCount: number;
}

interface PickResult {
  selected: CandidateAssetItem[];
  selectedSource: string | null;
  availableSources: SourceSummary[];
  /** source별 전체 item — 다른 source로 토글할 수 있도록 함께 반환 */
  itemsBySource: Record<string, CandidateAssetItem[]>;
}

function compareSources(
  a: { source: string; sourceDate: string | null; itemCount: number },
  b: { source: string; sourceDate: string | null; itemCount: number },
): number {
  // higher priority first
  const pa = ASSET_SOURCE_PRIORITY[a.source] ?? 0;
  const pb = ASSET_SOURCE_PRIORITY[b.source] ?? 0;
  if (pa !== pb) return pb - pa;
  // newer sourceDate first
  const da = a.sourceDate ?? '';
  const db = b.sourceDate ?? '';
  if (da !== db) return db.localeCompare(da);
  // more items first
  return b.itemCount - a.itemCount;
}

export function pickAssetSource(items: CandidateAssetItem[]): PickResult {
  if (items.length === 0) {
    return { selected: [], selectedSource: null, availableSources: [], itemsBySource: {} };
  }

  // source별 그룹화
  const groups = new Map<string, { items: CandidateAssetItem[]; latestDate: string | null }>();
  for (const it of items) {
    const g = groups.get(it.source) ?? { items: [], latestDate: null };
    g.items.push(it);
    if (it.sourceDate && (!g.latestDate || it.sourceDate > g.latestDate)) {
      g.latestDate = it.sourceDate;
    }
    groups.set(it.source, g);
  }

  const summaries: SourceSummary[] = [...groups.entries()].map(([source, g]) => ({
    source,
    sourceDate: g.latestDate,
    itemCount: g.items.length,
  }));
  summaries.sort(compareSources);

  const selectedSource = summaries[0]?.source ?? null;
  const selected = selectedSource ? (groups.get(selectedSource)?.items ?? []) : [];

  const itemsBySource: Record<string, CandidateAssetItem[]> = {};
  for (const [src, g] of groups.entries()) {
    itemsBySource[src] = g.items;
  }

  return { selected, selectedSource, availableSources: summaries, itemsBySource };
}
