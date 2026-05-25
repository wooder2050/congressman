import type { CandidateAssetItem } from '@prisma/client';

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
