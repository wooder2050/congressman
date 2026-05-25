/**
 * 한국리서치 PDF 결과표 파서
 *
 * 패턴:
 *   [표 N] 국회의원 선거 지지후보 / 국회의원 선거 후보 지지도 등
 *   [문 N] ... 보궐선거에서 다음 인물들 중 누구를 지지하시겠습니까? ...
 *   ▣ 전체 ▣  (500) (500)  42  31  3  13  11  100
 *
 * 자기-동치 행 없음. 헤더 텍스트가 여러 줄에 흩어져 추출 어려움.
 * → DB의 ElectionDistrict 후보 명단을 후보 순서로 사용 (PDF 컬럼이
 *    후보 등록 순서로 정렬된다는 가정).
 *
 * 단점: race 매칭이 선행되어야 하지만, PollResponseSyncService 흐름은
 *    파서 → race 매칭 순서. 그래서 이 파서는 후보명을 빈 채로 두고
 *    sync 서비스가 DB 후보 명단으로 채우는 방식.
 *
 * 대신 raceLabel과 columnIndex만 보존:
 *   responses[i].candidateName = null
 *   responses[i].rate = numbers[i]
 *   responses[i].partyName = null
 *   ParsedQuestion.rawText = "candidateColumns:N" (sync가 N을 알 수 있도록)
 */

import type { ParsedQuestion, ParsedResponse, PollPdfParser } from './types';

const TABLE_HEADER_RE =
  /\[\s*표\s*\d+\s*\][^\n]*?(?:국회의원\s*선거\s*지지후보|국회의원\s*선거\s*후보\s*지지|보궐선거\s*후보\s*지지)/;
const QUESTION_RE = /\[\s*문\s*\d+\s*\]\s*([^\n]+?(?:보궐선거|선거)[^\n]+?)$/;
const TOTAL_ROW_RE = /^\s*▣?\s*전\s*체\s*▣?\s+\((\d+)\)\s+\((\d+)\)\s+([\d.\s]+)\s*$/;

/**
 * "▣ 전체 ▣ (500) (500) 42 31 3 13 11 100" 같은 행 파싱
 */
function parseHRITotalRow(line: string): { sampleSize: number; numbers: number[] } | null {
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

/**
 * 후보 컬럼 추정.
 * 한국리서치 "▣ 전체 ▣" 행 패턴:
 *   [후보1, 후보2, ..., 후보N, 기타 후보, 없다, 모름/무응답, 계]
 * 마지막 컬럼(계)이 100인 케이스가 일반적이므로, 100을 제외한 컬럼 수 - 3(보조)
 * = 후보 컬럼 수.
 */
function estimateCandidateColumnCount(numbers: number[]): number {
  // 마지막이 100이면 "계" 컬럼이 있음
  const hasGyeColumn = Math.abs(numbers[numbers.length - 1] - 100) < 0.5;
  // 마지막 3컬럼(기타·없다·모름)을 제외 (계가 있으면 계도 제외)
  const total = hasGyeColumn ? numbers.length - 1 : numbers.length;
  return Math.max(0, total - 3);
}

export const hriParser: PollPdfParser = {
  name: 'hri',

  canParse({ agency }) {
    return /한국리서치/.test(agency);
  },

  parse({ text }) {
    const lines = text.split('\n');
    const questions: ParsedQuestion[] = [];

    for (let i = 0; i < lines.length; i++) {
      if (!TABLE_HEADER_RE.test(lines[i])) continue;
      // 표 식별 — 다음 30줄에서 "▣ 전체 ▣" 행 찾기
      let totalRow: { sampleSize: number; numbers: number[] } | null = null;
      let qText: string | null = null;
      for (let j = i + 1; j < Math.min(i + 40, lines.length); j++) {
        if (!qText) {
          const qm = lines[j].match(QUESTION_RE);
          if (qm) qText = qm[1].trim();
        }
        const parsed = parseHRITotalRow(lines[j]);
        if (parsed) {
          totalRow = parsed;
          break;
        }
      }
      if (!totalRow) continue;

      const candidateCount = estimateCandidateColumnCount(totalRow.numbers);
      if (candidateCount === 0) continue;

      // 후보별 응답 생성 — candidateName/partyName은 null (sync가 DB로 채움)
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
        raceLabel: null, // sync가 Poll 메타로 매칭
        pageNumber: null,
        responses,
      });
    }

    return questions;
  },
};
