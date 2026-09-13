import type { ArticleSection } from "@/data/weekly/types";

/**
 * 기사형 본문(주간뉴스 기사)의 광고 삽입 위치 계산.
 *
 * 원칙(2026-09-13 codex 설계 검토 반영):
 * - 삽입 후보는 "각 섹션의 마지막 문단 뒤"뿐이다. 소제목과 첫 문단 사이, 문단 중간에는 넣지 않는다.
 * - 첫 광고 앞뒤에 각각 최소 2문단·공백 제외 200자가 남는 후보만 허용하고, 그중 본문 누적 비율이
 *   35~45% 구간(중앙값 40%)에 가장 가까운 후보를 고른다. 후보가 없으면 본문 중간 삽입을 하지 않는다.
 * - 두 번째(하단) 광고는 본문 1,200자 이상·6문단 이상이고 첫 광고 뒤에도 충분한 본문이 남을 때만.
 *   세 번째는 이번 배포에서 제외(3,000자·12문단 이상 장문이 실제로 생기면 재검토).
 * - 글자 수는 제목·요약·출처를 제외한 본문(section.body)만 센다.
 */

const MIN_PARAS_AROUND = 2;
const MIN_CHARS_AROUND = 200;
const TARGET_RATIO = 0.4;
const SECOND_SLOT_MIN_CHARS = 1200;
const SECOND_SLOT_MIN_PARAS = 6;

export interface ArticleAdPlan {
  /** 이 인덱스의 섹션 뒤에 본문 중간 광고를 넣는다. null이면 중간 광고 없음 */
  inlineAfterSection: number | null;
  /** 기사 끝 광고 허용 여부 */
  bottom: boolean;
  /** 진단용 */
  totalChars: number;
  totalParas: number;
}

function splitParas(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function countChars(paras: string[]): number {
  return paras.reduce((n, p) => n + p.replace(/\s/g, "").length, 0);
}

export function planArticleAds(sections: ArticleSection[]): ArticleAdPlan {
  const perSection = sections.map((s) => {
    const paras = splitParas(s.body);
    return { paras: paras.length, chars: countChars(paras) };
  });
  const totalParas = perSection.reduce((n, s) => n + s.paras, 0);
  const totalChars = perSection.reduce((n, s) => n + s.chars, 0);

  // 후보: 섹션 i 뒤(마지막 섹션 뒤는 하단 광고와 겹치므로 제외)
  let best: { index: number; distance: number } | null = null;
  let cumParas = 0;
  let cumChars = 0;
  for (let i = 0; i < perSection.length - 1; i++) {
    cumParas += perSection[i].paras;
    cumChars += perSection[i].chars;
    const restParas = totalParas - cumParas;
    const restChars = totalChars - cumChars;
    const ok =
      cumParas >= MIN_PARAS_AROUND &&
      cumChars >= MIN_CHARS_AROUND &&
      restParas >= MIN_PARAS_AROUND &&
      restChars >= MIN_CHARS_AROUND;
    if (!ok) continue;
    const distance = Math.abs(cumChars / totalChars - TARGET_RATIO);
    if (!best || distance < best.distance) best = { index: i, distance };
  }

  const inlineAfterSection = best ? best.index : null;
  // 중간 광고가 없으면 기존처럼 하단 1개만. 중간 광고가 있으면 장문일 때만 하단을 함께 둔다.
  const bottom =
    inlineAfterSection === null ||
    (totalChars >= SECOND_SLOT_MIN_CHARS && totalParas >= SECOND_SLOT_MIN_PARAS);

  return { inlineAfterSection, bottom, totalChars, totalParas };
}
