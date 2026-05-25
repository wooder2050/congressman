/**
 * 여론조사꽃 PDF 결과표 파서
 *
 * 패턴 (다자대결 표):
 *   3. {지역} 보궐선거 다자대결(1)
 *   Q  {지역} 선거구 국회의원 보궐선거에 출마한 다음 후보 중 누구에게 투표하시겠습니까? ...
 *   ... 헤더 ...
 *      전체  (500)  40.3  39.3  3.8  4.3  7.3  5.0  (500)
 *      ...
 *
 * 데이터 행 형식: "라벨 (n) v1 v2 ... vN (n)" — 끝에 가중값 사례수 한 컬럼 추가.
 *
 * 자기-동치 행 없음 (정당지지 응답분포 행은 있지만 100% 정렬 아님).
 * → DB 후보 명단 fallback (HRI와 같은 방식).
 */

import type { ParsedQuestion, ParsedResponse, PollPdfParser } from './types';

// "3. 울산 남구 갑 보궐선거 다자대결(1)" 또는 "3. ... 후보 지지도(1)"
const TABLE_HEADER_RE = /^\s*\d+\.\s*[^\n]*?(?:다자대결|후보\s*지지도|후보\s*적합도)/;
const QUESTION_RE = /^\s*Q\s+([^\n]+?(?:보궐선거|선거)[^\n]+?)$/;
// "전체  (500)  40.3 39.3 ... (500)"
const TOTAL_ROW_RE = /^\s*전\s*체\s+\((\d+)\)\s+([\d.\s]+?)\s+\((\d+)\)\s*$/;

function parseYRKTotalRow(line: string): { sampleSize: number; numbers: number[] } | null {
  const m = line.match(TOTAL_ROW_RE);
  if (!m) return null;
  const sampleSize = parseInt(m[1], 10);
  const nums = m[2]
    .trim()
    .split(/\s+/)
    .map((s) => parseFloat(s))
    .filter((n) => Number.isFinite(n));
  if (nums.length < 3) return null;
  return { sampleSize, numbers: nums };
}

/**
 * 후보 컬럼 수 추정.
 * 여론조사꽃 "전체" 행:
 *   [후보1, 후보2, ..., 후보N, 투표할 후보 없다, 잘 모름]
 * 마지막 2 컬럼은 보조(없다·모름). 단, "투표할 후보 없다"·"기타 후보"·"무응답" 등이
 * 더 추가될 수 있어 일반 케이스에는 마지막 2개 제외가 안전.
 */
function estimateCandidateColumnCount(numbers: number[]): number {
  return Math.max(0, numbers.length - 2);
}

export const yeoronSurveyKkokParser: PollPdfParser = {
  name: 'yeoron-survey-kkok',

  canParse({ agency }) {
    return /여론조사꽃/.test(agency);
  },

  parse({ text }) {
    const lines = text.split('\n');
    const questions: ParsedQuestion[] = [];

    for (let i = 0; i < lines.length; i++) {
      if (!TABLE_HEADER_RE.test(lines[i])) continue;
      // 다자대결·후보지지도 표만 (정당지지도는 별도)
      if (!/다자대결|후보\s*지지도|후보\s*적합도/.test(lines[i])) continue;
      // 첫 번째 표(1)만 — 부속표는 정당지지자별 응답이라 중복 데이터
      if (!/\(1\)$/.test(lines[i].trim())) continue;

      let totalRow: { sampleSize: number; numbers: number[] } | null = null;
      let qText: string | null = null;
      for (let j = i + 1; j < Math.min(i + 40, lines.length); j++) {
        if (!qText) {
          const qm = lines[j].match(QUESTION_RE);
          if (qm) qText = qm[1].trim();
        }
        const parsed = parseYRKTotalRow(lines[j]);
        if (parsed) {
          totalRow = parsed;
          break;
        }
      }
      if (!totalRow) continue;

      const candidateCount = estimateCandidateColumnCount(totalRow.numbers);
      if (candidateCount === 0) continue;

      const responses: ParsedResponse[] = [];
      for (let k = 0; k < candidateCount; k++) {
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
        raceLabel: null,
        pageNumber: null,
        responses,
      });
    }

    return questions;
  },
};
