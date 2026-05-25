/**
 * 자기-동치 행(self-identifying row) 기반 컬럼 매핑 추출 로직.
 *
 * NESDC 결과표 PDF의 공통 패턴:
 *   - 표 식별자 (예: "【 표 N 】 ... 후보 지지도", "표Ⅲ-2 : 후보 지지도")
 *   - 컬럼 헤더 (정당명 / 후보명) — 텍스트가 여러 줄에 걸쳐 흩어져 신뢰성 낮음
 *   - "전체" 데이터 행
 *   - subgroup별 데이터 행
 *   - 자기-동치 행 ("더불어민주당 김경수 (n) (n) 100.0 0.0 ...")
 *
 * 자기-동치 행의 100.0 컬럼 인덱스 → 그 컬럼이 그 후보·정당의 지지율 컬럼.
 * 이 매핑을 만들고 "전체" 행의 숫자로 후보별 지지율을 추출한다.
 */

import type { ParsedQuestion, ParsedResponse } from './types';

const KNOWN_PARTIES = [
  '더불어민주당',
  '국민의힘',
  '개혁신당',
  '진보당',
  '조국혁신당',
  '정의당',
  '기본소득당',
  '사회민주당',
  '여성의당',
  '자유통일당',
  '국가혁명당',
  '노동당',
  '녹색당',
  '우리공화당',
];

function isKnownParty(token: string): boolean {
  return KNOWN_PARTIES.includes(token.trim());
}

function parseDataRow(line: string): { sampleSize: number; numbers: number[] } | null {
  const m = line.match(/\s*([\S][^()]*?)\s+\((\d+)\)\s+\((\d+)\)\s+([\d.\s]+)\s*$/);
  if (!m) return null;
  const sampleSize = parseInt(m[2], 10);
  const nums = m[4]
    .trim()
    .split(/\s+/)
    .map((s) => parseFloat(s))
    .filter((n) => Number.isFinite(n));
  if (nums.length < 4) return null;
  return { sampleSize, numbers: nums };
}

function isTotalRow(line: string): boolean {
  return /^\s*전체\s+\(/.test(line);
}

function parseSelfIdentifyingRow(
  line: string,
): { partyName: string; candidateName: string; columnIndex: number } | null {
  const data = parseDataRow(line);
  if (!data) return null;
  const hundredIdxes = data.numbers
    .map((n, i) => (Math.abs(n - 100) < 0.01 ? i : -1))
    .filter((i) => i >= 0);
  // 자기-동치 행: 100.0이 1개(리얼미터·KIR 등) 또는 2개(KSOI·계 컬럼 있음).
  // 2개일 때는 두 번째가 마지막 컬럼(계)이어야 함.
  if (hundredIdxes.length === 0 || hundredIdxes.length > 2) return null;
  if (hundredIdxes.length === 2 && hundredIdxes[1] !== data.numbers.length - 1) return null;
  const columnIndex = hundredIdxes[0];
  // 본 컬럼이 마지막이면 "계" 컬럼만 잡힌 일반 데이터일 가능성 — 자기-동치 행 아님
  if (columnIndex === data.numbers.length - 1) return null;
  // 본 컬럼과 (계 컬럼이 있을 경우) 마지막 컬럼을 제외한 모든 값이 0이어야 자기-동치 행
  const endExclusive = hundredIdxes.length === 2 ? data.numbers.length - 1 : data.numbers.length;
  for (let i = 0; i < endExclusive; i++) {
    if (i === columnIndex) continue;
    if (Math.abs(data.numbers[i]) > 0.01) return null;
  }

  const labelMatch = line.match(/^\s*(.+?)\s+\(\d+\)\s+\(\d+\)/);
  if (!labelMatch) return null;
  const labelTokens = labelMatch[1].trim().split(/\s+/);

  // 라벨에서 알려진 정당명 찾기
  let partyIdx = -1;
  for (let i = 0; i < labelTokens.length; i++) {
    if (isKnownParty(labelTokens[i])) {
      partyIdx = i;
      break;
    }
  }
  if (partyIdx < 0 || partyIdx >= labelTokens.length - 1) return null;

  const partyName = labelTokens[partyIdx];
  const candidateName = labelTokens.slice(partyIdx + 1).join(' ');
  return { partyName, candidateName, columnIndex };
}

type ColumnMap = Map<number, { partyName: string | null; candidateName: string | null }>;

function buildColumnMap(allLines: string[], startIdx: number, endIdx: number): ColumnMap {
  const map: ColumnMap = new Map();
  for (let i = startIdx; i < endIdx; i++) {
    const r = parseSelfIdentifyingRow(allLines[i]);
    if (r) {
      map.set(r.columnIndex, { partyName: r.partyName, candidateName: r.candidateName });
    }
  }
  return map;
}

type TableDetector = {
  detectCandidateTable: (line: string) => boolean;
  detectPartyTable: (line: string) => boolean;
  /** 표 식별자 라인 인덱스 → race 라벨 추출 (실패 시 null) */
  extractRaceLabel: (allLines: string[], headerIdx: number) => string | null;
  /** 임의의 표 시작(다음 표가 후보·정당이 아니더라도)을 판단할 패턴 */
  detectAnyTable: (line: string) => boolean;
};

function findNextTableStart(
  allLines: string[],
  fromIdx: number,
  detector: TableDetector,
): number {
  for (let i = fromIdx + 1; i < allLines.length; i++) {
    if (detector.detectAnyTable(allLines[i])) {
      return i;
    }
  }
  return allLines.length;
}

function parseTable(params: {
  raceLabel: string;
  startIdx: number;
  endIdx: number;
  allLines: string[];
  questionType: 'candidate_support' | 'party_support';
}): ParsedQuestion | null {
  const { raceLabel, startIdx, endIdx, allLines, questionType } = params;

  const columnMap = buildColumnMap(allLines, startIdx, endIdx);
  if (columnMap.size === 0) return null;

  // "전체" 행 찾기
  let totalRow: { sampleSize: number; numbers: number[] } | null = null;
  for (let i = startIdx + 1; i < endIdx; i++) {
    if (isTotalRow(allLines[i])) {
      totalRow = parseDataRow(allLines[i]);
      break;
    }
  }
  if (!totalRow) return null;

  const responses: ParsedResponse[] = [];
  for (const [columnIndex, mapping] of columnMap.entries()) {
    if (columnIndex >= totalRow.numbers.length) continue;
    const rate = totalRow.numbers[columnIndex];
    if (!Number.isFinite(rate)) continue;
    responses.push({
      partyName: mapping.partyName,
      candidateName: mapping.candidateName,
      rate,
      subgroup: '전체',
      subgroupKey: 'total',
      sampleSize: totalRow.sampleSize,
    });
  }
  if (responses.length === 0) return null;

  return {
    questionType,
    questionText: null,
    raceLabel,
    pageNumber: null,
    responses,
  };
}

/**
 * 자기-동치 행 + 전체 행 기반 후보·정당 지지율 추출.
 */
export function extractByColumnMap(
  lines: string[],
  detector: TableDetector,
): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (detector.detectCandidateTable(line)) {
      const raceLabel = detector.extractRaceLabel(lines, i) ?? '미식별';
      const endIdx = findNextTableStart(lines, i, detector);
      const q = parseTable({
        raceLabel,
        startIdx: i,
        endIdx,
        allLines: lines,
        questionType: 'candidate_support',
      });
      if (q) questions.push(q);
      continue;
    }
    if (detector.detectPartyTable(line)) {
      const endIdx = findNextTableStart(lines, i, detector);
      const q = parseTable({
        raceLabel: '정당 지지도',
        startIdx: i,
        endIdx,
        allLines: lines,
        questionType: 'party_support',
      });
      if (q) questions.push(q);
    }
  }

  // 중복 제거: 같은 (questionType, raceLabel)이면 마지막 표만 유지
  const dedup = new Map<string, ParsedQuestion>();
  for (const q of questions) {
    const key = `${q.questionType}:${q.raceLabel}`;
    dedup.set(key, q);
  }
  return Array.from(dedup.values());
}
