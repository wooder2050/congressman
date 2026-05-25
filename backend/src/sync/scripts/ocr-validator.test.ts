import { describe, expect, it } from 'vitest';

import {
  ALLOWED_CATEGORIES,
  ALLOWED_RELATIONS,
  ValidationError,
  validateInput,
  vMoney,
  vString,
} from './ocr-validator';

describe('vMoney', () => {
  it('null/undefined/빈 문자열 → null', () => {
    expect(vMoney(null, 'x')).toBeNull();
    expect(vMoney(undefined, 'x')).toBeNull();
    expect(vMoney('', 'x')).toBeNull();
  });

  it('정수 문자열 → BigInt', () => {
    expect(vMoney('1000', 'x')).toBe(BigInt(1000));
    expect(vMoney('-50000', 'x')).toBe(BigInt(-50000));
  });

  it('큰 금액 문자열 (number 한계 초과) → BigInt', () => {
    expect(vMoney('99999999999999999', 'x')).toBe(BigInt('99999999999999999'));
  });

  it('number 타입 → 거부', () => {
    expect(() => vMoney(100, 'x')).toThrow(ValidationError);
    expect(() => vMoney(100, 'x')).toThrow(/문자열이어야/);
  });

  it('소수·콤마·잘못된 문자열 → 거부', () => {
    expect(() => vMoney('1.5', 'x')).toThrow(/정수 문자열/);
    expect(() => vMoney('1,000', 'x')).toThrow(/정수 문자열/);
    expect(() => vMoney('abc', 'x')).toThrow(/정수 문자열/);
    expect(() => vMoney('1e9', 'x')).toThrow(/정수 문자열/);
  });

  it('allowNegative=false에서 음수 → 거부', () => {
    expect(() => vMoney('-100', 'x', false)).toThrow(/음수 불허/);
    expect(vMoney('100', 'x', false)).toBe(BigInt(100));
  });
});

describe('vString', () => {
  it('필수 — null/빈문자열 거부', () => {
    expect(() => vString(null, 'x')).toThrow(/필수/);
    expect(() => vString('', 'x')).toThrow(/필수/);
  });

  it('optional — null/빈문자열은 빈 문자열로', () => {
    expect(vString(null, 'x', { optional: true })).toBe('');
    expect(vString('', 'x', { optional: true })).toBe('');
  });

  it('max 길이 초과 → 거부', () => {
    expect(() => vString('a'.repeat(11), 'x', { max: 10 })).toThrow(/10자 초과/);
  });

  it('정상 문자열 → 그대로 반환', () => {
    expect(vString('hello', 'x')).toBe('hello');
  });
});

describe('validateInput', () => {
  const validCandidate = {
    table: 'localElectionCandidate',
    id: 100,
    name: '홍길동',
    sourceDate: '2026-05-14',
    sourceUrl: 'https://info.nec.go.kr/sample',
    items: [
      {
        category: '예금',
        subCategory: '예금',
        relation: '본인',
        description: '국민은행',
        currentValue: '1000000',
      },
    ],
  };

  it('정상 입력 → 검증된 데이터 반환', () => {
    const result = validateInput({ candidates: [validCandidate] });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('홍길동');
    expect(result[0].items[0].currentValue).toBe(BigInt(1000000));
  });

  it('root가 객체가 아니면 → ValidationError', () => {
    expect(() => validateInput(null as never)).toThrow(/객체가 아닙니다/);
  });

  it('candidates 배열 없으면 → ValidationError', () => {
    expect(() => validateInput({})).toThrow(/배열이어야 합니다/);
  });

  it('잘못된 table → ValidationError', () => {
    const bad = { ...validCandidate, table: 'unknown' };
    expect(() => validateInput({ candidates: [bad] })).toThrow(/허용되지 않은 값/);
  });

  it('id가 음수/0/소수 → ValidationError', () => {
    expect(() => validateInput({ candidates: [{ ...validCandidate, id: 0 }] })).toThrow(
      /양의 정수/,
    );
    expect(() => validateInput({ candidates: [{ ...validCandidate, id: -1 }] })).toThrow(
      /양의 정수/,
    );
    expect(() => validateInput({ candidates: [{ ...validCandidate, id: 1.5 }] })).toThrow(
      /양의 정수/,
    );
  });

  it('잘못된 카테고리 → ValidationError', () => {
    const bad = {
      ...validCandidate,
      items: [{ ...validCandidate.items[0], category: '잘못된카테고리' }],
    };
    expect(() => validateInput({ candidates: [bad] })).toThrow(/허용되지 않은 카테고리/);
  });

  it('잘못된 relation → ValidationError', () => {
    const bad = {
      ...validCandidate,
      items: [{ ...validCandidate.items[0], relation: '친척' }],
    };
    expect(() => validateInput({ candidates: [bad] })).toThrow(/허용되지 않은 관계/);
  });

  it('잘못된 sourceDate 형식 → ValidationError', () => {
    const bad = { ...validCandidate, sourceDate: '2026/05/14' };
    expect(() => validateInput({ candidates: [bad] })).toThrow(/YYYY-MM-DD/);
  });

  it('잘못된 sourceUrl → ValidationError', () => {
    const bad = { ...validCandidate, sourceUrl: 'ftp://x.com' };
    expect(() => validateInput({ candidates: [bad] })).toThrow(/http\(s\)/);
  });

  it('number 금액 → ValidationError (codex #5)', () => {
    const bad = {
      ...validCandidate,
      items: [{ ...validCandidate.items[0], currentValue: 100 }],
    };
    expect(() => validateInput({ candidates: [bad] })).toThrow(/문자열이어야/);
  });

  it('sourceDate/sourceUrl optional — 없어도 통과', () => {
    const minimal = {
      table: validCandidate.table,
      id: validCandidate.id,
      name: validCandidate.name,
      items: validCandidate.items,
    };
    const result = validateInput({ candidates: [minimal] });
    expect(result[0].sourceDate).toBeNull();
    expect(result[0].sourceUrl).toBeNull();
  });

  it('items가 배열이 아니면 → ValidationError', () => {
    const bad = { ...validCandidate, items: 'not-array' };
    expect(() => validateInput({ candidates: [bad] })).toThrow(/배열이어야/);
  });

  it('candidates 빈 배열 → 빈 결과 (오류 아님)', () => {
    expect(validateInput({ candidates: [] })).toEqual([]);
  });

  // 3-C 검수 메타데이터 (codex PR #377 #6)
  it('reviewer/reviewedAt/pdfSourceHash 정상 입력 → 통과', () => {
    const withReview = {
      ...validCandidate,
      reviewer: 'manual:wooder2050',
      reviewedAt: '2026-05-25T10:00:00Z',
      pdfSourceHash: 'a3b1c2d4e5f60718abcdef0123456789',
    };
    const result = validateInput({ candidates: [withReview] });
    expect(result[0].reviewer).toBe('manual:wooder2050');
    expect(result[0].reviewedAt).toBeInstanceOf(Date);
    expect(result[0].reviewedAt?.toISOString()).toBe('2026-05-25T10:00:00.000Z');
    expect(result[0].pdfSourceHash).toBe('a3b1c2d4e5f60718abcdef0123456789');
  });

  it('reviewer/reviewedAt/pdfSourceHash 누락 → null로 통과', () => {
    const result = validateInput({ candidates: [validCandidate] });
    expect(result[0].reviewer).toBeNull();
    expect(result[0].reviewedAt).toBeNull();
    expect(result[0].pdfSourceHash).toBeNull();
  });

  it('잘못된 reviewedAt 형식 → ValidationError', () => {
    const bad = { ...validCandidate, reviewedAt: '2026-05-25 10:00:00' };
    expect(() => validateInput({ candidates: [bad] })).toThrow(/ISO 8601/);
  });

  it('pdfSourceHash가 hex가 아니면 → ValidationError', () => {
    const bad = { ...validCandidate, pdfSourceHash: 'NOT-HEX!!' };
    expect(() => validateInput({ candidates: [bad] })).toThrow(/hex 문자열/);
  });
});

describe('enum 일관성', () => {
  it('주요 카테고리 모두 포함', () => {
    for (const cat of ['토지', '건물', '예금', '증권', '채무', '가상자산']) {
      expect(ALLOWED_CATEGORIES.has(cat)).toBe(true);
    }
  });

  it('주요 가족관계 모두 포함', () => {
    for (const rel of ['본인', '배우자', '부', '모', '장남', '장녀']) {
      expect(ALLOWED_RELATIONS.has(rel)).toBe(true);
    }
  });

  it('4번째 자녀 및 외조부모 관계 포함 (다자녀 후보 OCR 대응)', () => {
    for (const rel of ['사남', '사녀', '외조부', '외조모']) {
      expect(ALLOWED_RELATIONS.has(rel)).toBe(true);
    }
  });
});
