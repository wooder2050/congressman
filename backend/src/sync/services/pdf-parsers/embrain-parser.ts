/**
 * 엠브레인퍼블릭 PDF 결과표 파서
 *
 * 패턴:
 *   [표N] {race명} 후보 선호도 / 후보 지지도
 *   ... 헤더 (후보명·기타후보·없다·모름) ...
 *   ■ 전체 ■  (802) (802) 18 16 8 5 4 4 4 1 3 25 12
 *
 * 자기-동치 행 없음 → DB 후보 명단 fallback
 * 후보 컬럼 = 데이터 컬럼 수 - 3(기타후보·없다·모름)
 */

import type { ParsedQuestion, ParsedResponse, PollPdfParser } from './types';

const TABLE_HEADER_RE = /\[\s*표\s*\d+\s*\][^\n]*?([가-힣A-Za-z0-9·]+(?:시장|도지사|군수|구청장|교육감))\s*후보\s*(?:선호도|지지도)/;
const TOTAL_ROW_RE = /^\s*■?\s*전\s*체\s*■?\s+\((\d+)\)\s+\((\d+)\)\s+([\d.\s]+)\s*$/;

function parseEmbrainTotalRow(line: string): { sampleSize: number; numbers: number[] } | null {
  const m = line.match(TOTAL_ROW_RE);
  if (!m) return null;
  const sampleSize = parseInt(m[1], 10);
  const nums = m[3]
    .trim()
    .split(/\s+/)
    .map((s) => parseFloat(s))
    .filter((n) => Number.isFinite(n));
  if (nums.length < 4) return null;
  return { sampleSize, numbers: nums };
}

function estimateCandidateColumnCount(numbers: number[]): number {
  // 엠브레인: [후보1..N, 기타후보, 없다, 모름] — 보조 3개
  return Math.max(0, numbers.length - 3);
}

export const embrainParser: PollPdfParser = {
  name: 'embrain',

  canParse({ agency }) {
    return /엠브레인퍼블릭|embrain/i.test(agency);
  },

  parse({ text }) {
    const lines = text.split('\n');
    const questions: ParsedQuestion[] = [];

    for (let i = 0; i < lines.length; i++) {
      const headerMatch = lines[i].match(TABLE_HEADER_RE);
      if (!headerMatch) continue;

      const raceLabel = headerMatch[1].trim();

      let totalRow: { sampleSize: number; numbers: number[] } | null = null;
      for (let j = i + 1; j < Math.min(i + 30, lines.length); j++) {
        const parsed = parseEmbrainTotalRow(lines[j]);
        if (parsed) {
          totalRow = parsed;
          break;
        }
      }
      if (!totalRow) continue;

      const candidateCount = estimateCandidateColumnCount(totalRow.numbers);
      if (candidateCount === 0) continue;

      const responses: ParsedResponse[] = [];
      const upper = Math.min(totalRow.numbers.length, candidateCount + 1);
      for (let k = 0; k < upper; k++) {
        const rate = totalRow.numbers[k];
        if (!Number.isFinite(rate)) continue;
        responses.push({
          partyName: null,
          candidateName: null,
          rate,
          subgroup: '전체',
          subgroupKey: 'total',
          sampleSize: totalRow.sampleSize,
        });
      }
      if (responses.length === 0) continue;

      questions.push({
        questionType: 'candidate_support',
        questionText: null,
        raceLabel,
        pageNumber: null,
        responses,
      });
    }

    return questions;
  },
};
