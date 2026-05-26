/**
 * 코리아정보리서치 PDF 결과표 파서
 *
 * 패턴:
 *   2. {race명} 후보 지지도
 *   이번 {race명} 선거에 출마한 다음 N명의 후보 중 ...
 *   ... 헤더 (후보명·없음·모름) ...
 *   합계  709  709  47.0%  41.4%  5.6%  3.9%  2.0%
 *   ...
 *
 * 데이터 행: "{라벨} {n} {n} %1 %2 ... %N" (% 기호 포함)
 * 자기-동치 행 없음 → DB 후보 명단 fallback (HRI와 같은 방식)
 *
 * KIR PDF의 후보 컬럼 = 데이터 컬럼 수 - 2 (없음·모름).
 */

import type { ParsedQuestion, ParsedResponse, PollPdfParser } from './types';

const TABLE_HEADER_RE = /^\s*\d+\.\s+([^\n]+?)\s+후보\s*지지도/;
// "합계  709  709  47.0%  41.4%  5.6%  3.9%  2.0%"
const TOTAL_ROW_RE = /^\s*합\s*계\s+(\d+)\s+(\d+)\s+([\d.%\s]+)$/;

function parseKIRTotalRow(line: string): { sampleSize: number; numbers: number[] } | null {
  const m = line.match(TOTAL_ROW_RE);
  if (!m) return null;
  const sampleSize = parseInt(m[1], 10);
  // 숫자 부분에서 % 제거 후 파싱
  const nums = m[3]
    .trim()
    .split(/\s+/)
    .map((s) => parseFloat(s.replace('%', '')))
    .filter((n) => Number.isFinite(n));
  if (nums.length < 3) return null;
  return { sampleSize, numbers: nums };
}

/**
 * 후보 컬럼 수 추정 — "합계" 행의 컬럼 수 - 2(없음·모름).
 * KIR은 "계" 컬럼이 없는 형식 (합산은 외부 검증으로).
 */
function estimateCandidateColumnCount(numbers: number[]): number {
  return Math.max(0, numbers.length - 2);
}

export const kirParser: PollPdfParser = {
  name: 'kir',

  canParse({ agency }) {
    return /코리아정보리서치|KIR/i.test(agency);
  },

  parse({ text }) {
    const lines = text.split('\n');
    const questions: ParsedQuestion[] = [];

    for (let i = 0; i < lines.length; i++) {
      const headerMatch = lines[i].match(TABLE_HEADER_RE);
      if (!headerMatch) continue;

      const raceLabel = headerMatch[1].trim();

      // 다음 20줄에서 "합계" 행 찾기
      let totalRow: { sampleSize: number; numbers: number[] } | null = null;
      let qText: string | null = null;
      for (let j = i + 1; j < Math.min(i + 25, lines.length); j++) {
        if (!qText && /이번\s+.+선거에/.test(lines[j])) {
          qText = lines[j].trim();
        }
        const parsed = parseKIRTotalRow(lines[j]);
        if (parsed) {
          totalRow = parsed;
          break;
        }
      }
      if (!totalRow) continue;

      const candidateCount = estimateCandidateColumnCount(totalRow.numbers);
      if (candidateCount === 0) continue;

      // 응답 생성 (sync 단계에서 DB 후보로 candidateName 채움)
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
        questionText: qText,
        raceLabel,
        pageNumber: null,
        responses,
      });
    }

    return questions;
  },
};
