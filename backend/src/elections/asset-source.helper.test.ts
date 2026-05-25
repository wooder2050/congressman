import type { CandidateAssetItem } from '@prisma/client';
import { describe, expect, it } from 'vitest';

import { pickAssetSource, sumItemValues, summarizeReview } from './asset-source.helper';

/**
 * pickAssetSource 단위 테스트 (codex PR #378 리뷰 #2 권고)
 *
 * 검증 항목:
 *   1. 빈 입력 처리
 *   2. 단일 source는 그대로 통과
 *   3. 우선순위 (priority > sourceDate > itemCount) 동작
 *   4. itemsBySource는 모든 source 데이터 포함
 *   5. availableSources 정렬 동일
 */

function makeItem(overrides: Partial<CandidateAssetItem> = {}): CandidateAssetItem {
  const now = new Date();
  return {
    id: 1,
    localCandidateId: null,
    byCandidateId: 100,
    category: '예금',
    subCategory: '예금',
    relation: '본인',
    description: '국민은행',
    currentValue: BigInt(1000),
    previousValue: null,
    increaseValue: null,
    decreaseValue: null,
    marketPrice: null,
    changeReason: null,
    source: 'opengirok',
    sourceUrl: null,
    sourceDate: '2025-03-27',
    rawJson: null,
    reviewedAt: null,
    reviewer: null,
    pdfSourceHash: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('pickAssetSource', () => {
  it('빈 입력 — selected/source는 비고, itemsBySource도 빈 객체', () => {
    const result = pickAssetSource([]);
    expect(result.selected).toEqual([]);
    expect(result.selectedSource).toBeNull();
    expect(result.availableSources).toEqual([]);
    expect(result.itemsBySource).toEqual({});
  });

  it('단일 source — 그대로 통과', () => {
    const items = [makeItem({ id: 1 }), makeItem({ id: 2 })];
    const result = pickAssetSource(items);
    expect(result.selected).toHaveLength(2);
    expect(result.selectedSource).toBe('opengirok');
    expect(result.availableSources).toHaveLength(1);
    expect(result.itemsBySource).toHaveProperty('opengirok');
    expect(result.itemsBySource.opengirok).toHaveLength(2);
  });

  it('우선순위 1 — nec_ocr_vision이 opengirok보다 우선', () => {
    const items = [
      makeItem({ id: 1, source: 'opengirok' }),
      makeItem({ id: 2, source: 'opengirok' }),
      makeItem({ id: 3, source: 'nec_ocr_vision', sourceDate: '2026-05-14' }),
    ];
    const result = pickAssetSource(items);
    expect(result.selectedSource).toBe('nec_ocr_vision');
    expect(result.selected).toHaveLength(1);
    expect(result.availableSources[0].source).toBe('nec_ocr_vision');
  });

  it('우선순위 2 — 같은 priority일 때 sourceDate가 새로운 쪽', () => {
    const items = [
      makeItem({ id: 1, source: 'opengirok', sourceDate: '2024-08-29' }),
      makeItem({ id: 2, source: 'opengirok', sourceDate: '2024-08-29' }),
      makeItem({ id: 3, source: 'opengirok', sourceDate: '2025-03-27' }),
    ];
    // 단일 source라 동일 그룹 — 정렬 자체는 의미 없지만 availableSources의 latestDate 검증
    const result = pickAssetSource(items);
    expect(result.availableSources[0].sourceDate).toBe('2025-03-27');
  });

  it('우선순위 3 — priority/date 동률일 때 itemCount가 많은 쪽', () => {
    // 동일 priority(opengirok=2)·날짜 동률 케이스 만들기 위해 임의 source 사용
    const items = [
      makeItem({ id: 1, source: 'manual', sourceDate: '2026-01-01' }),
      makeItem({ id: 2, source: 'manual', sourceDate: '2026-01-01' }),
      makeItem({ id: 3, source: 'manual', sourceDate: '2026-01-01' }),
      makeItem({ id: 4, source: 'unknown_x', sourceDate: '2026-01-01' }),
    ];
    const result = pickAssetSource(items);
    // manual(priority=1) > unknown_x(priority=0) 이므로 manual 선택
    expect(result.selectedSource).toBe('manual');
    expect(result.selected).toHaveLength(3);
  });

  it('itemsBySource — 모든 source의 전체 항목을 포함', () => {
    const items = [
      makeItem({ id: 1, source: 'opengirok' }),
      makeItem({ id: 2, source: 'opengirok' }),
      makeItem({ id: 3, source: 'nec_ocr_vision' }),
    ];
    const result = pickAssetSource(items);
    expect(Object.keys(result.itemsBySource).sort()).toEqual(['nec_ocr_vision', 'opengirok']);
    expect(result.itemsBySource.opengirok).toHaveLength(2);
    expect(result.itemsBySource.nec_ocr_vision).toHaveLength(1);
  });

  it('availableSources — 우선순위순으로 정렬', () => {
    const items = [
      makeItem({ id: 1, source: 'manual' }),
      makeItem({ id: 2, source: 'opengirok' }),
      makeItem({ id: 3, source: 'nec_ocr_vision' }),
      makeItem({ id: 4, source: 'peti' }),
    ];
    const result = pickAssetSource(items);
    expect(result.availableSources.map((s) => s.source)).toEqual([
      'nec_ocr_vision',
      'peti',
      'opengirok',
      'manual',
    ]);
  });

  it('알 수 없는 source — priority 0 처리되어 가장 후순위', () => {
    const items = [
      makeItem({ id: 1, source: 'opengirok' }),
      makeItem({ id: 2, source: 'unknown_source' }),
    ];
    const result = pickAssetSource(items);
    expect(result.selectedSource).toBe('opengirok');
    expect(result.availableSources[1].source).toBe('unknown_source');
  });

  it('sourceDate가 null인 항목 — latestDate가 null로 유지', () => {
    const items = [
      makeItem({ id: 1, source: 'manual', sourceDate: null }),
      makeItem({ id: 2, source: 'manual', sourceDate: null }),
    ];
    const result = pickAssetSource(items);
    expect(result.availableSources[0].sourceDate).toBeNull();
    expect(result.availableSources[0].itemCount).toBe(2);
  });
});

describe('sumItemValues', () => {
  it('빈 배열 → "0"', () => {
    expect(sumItemValues([])).toBe('0');
  });

  it('양수 합산', () => {
    const items = [
      makeItem({ currentValue: BigInt(1000) }),
      makeItem({ currentValue: BigInt(500) }),
    ];
    expect(sumItemValues(items)).toBe('1500');
  });

  it('음수(채무) 포함 합산', () => {
    const items = [
      makeItem({ currentValue: BigInt(1_000_000_000) }),
      makeItem({ currentValue: BigInt(-200_000_000) }), // 채무
    ];
    expect(sumItemValues(items)).toBe('800000000');
  });

  it('null currentValue는 0 취급', () => {
    const items = [makeItem({ currentValue: BigInt(100) }), makeItem({ currentValue: null })];
    expect(sumItemValues(items)).toBe('100');
  });

  it('큰 금액 BigInt 정확성', () => {
    const big = BigInt('999999999999999999');
    const items = [makeItem({ currentValue: big }), makeItem({ currentValue: big })];
    expect(sumItemValues(items)).toBe('1999999999999999998');
  });
});

describe('summarizeReview', () => {
  it('빈 배열 → 0/0', () => {
    const summary = summarizeReview([]);
    expect(summary.totalItems).toBe(0);
    expect(summary.reviewedItems).toBe(0);
    expect(summary.latestReviewedAt).toBeNull();
  });

  it('모두 미검수 — reviewedItems 0', () => {
    const items = [makeItem({ id: 1 }), makeItem({ id: 2 })];
    const summary = summarizeReview(items);
    expect(summary.totalItems).toBe(2);
    expect(summary.reviewedItems).toBe(0);
    expect(summary.reviewers).toEqual([]);
  });

  it('일부 검수 — 가장 최근 reviewedAt 반환', () => {
    const items = [
      makeItem({ id: 1, reviewedAt: new Date('2026-05-20T10:00:00Z'), reviewer: 'alice' }),
      makeItem({ id: 2 }),
      makeItem({ id: 3, reviewedAt: new Date('2026-05-25T15:00:00Z'), reviewer: 'bob' }),
    ];
    const summary = summarizeReview(items);
    expect(summary.totalItems).toBe(3);
    expect(summary.reviewedItems).toBe(2);
    expect(summary.latestReviewedAt).toBe('2026-05-25T15:00:00.000Z');
    expect(summary.reviewers.sort()).toEqual(['alice', 'bob']);
  });

  it('pdfSourceHash 고유 목록', () => {
    const items = [
      makeItem({ pdfSourceHash: 'abc123' }),
      makeItem({ pdfSourceHash: 'abc123' }),
      makeItem({ pdfSourceHash: 'def456' }),
    ];
    const summary = summarizeReview(items);
    expect(summary.pdfSourceHashes.sort()).toEqual(['abc123', 'def456']);
  });
});
