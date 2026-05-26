/**
 * KSOI (한국사회여론연구소) PDF 결과표 파서
 *
 * 표 식별자: 【 표 N 】 ... 후보 지지도 / 후보 적합도 / 가상대결
 * 데이터/자기-동치 행은 NESDC 공통 패턴이라 extractByColumnMap에 위임.
 *
 * 한 PDF에 후보 지지도·적합도·가상대결이 모두 있는 케이스(부산·강서구 등)에서는
 * "후보 지지도" 표를 우선 선택. 그것이 없을 때만 적합도/가상대결로 fallback.
 * 적합도(당내 경선)와 가상대결(가상 매치업)은 같은 race를 다루지만 후보 명단이
 * 다르므로 같은 raceLabel로 union하면 안 됨.
 */

import { extractByColumnMap } from './common-column-mapper';
import type { ParsedQuestion, PollPdfParser } from './types';

function runOnce(
  lines: string[],
  detectCandidateTable: (line: string) => boolean,
): ParsedQuestion[] {
  return extractByColumnMap(lines, {
    detectCandidateTable,
    detectPartyTable: (line) => /【\s*표\s+\d+\s*】\s*정당\s*지지도/.test(line),
    detectAnyTable: (line) => /【\s*표\s+\d+\s*】/.test(line),
    extractRaceLabel: (allLines, idx) => {
      const line = allLines[idx];
      const m = /【\s*표\s+\d+\s*】\s*([^\n]+?)\s+(?:후보\s*지지도|후보\s*적합도|가상대결)/.exec(
        line,
      );
      return m ? m[1].trim() : null;
    },
  });
}

export const ksoiParser: PollPdfParser = {
  name: 'ksoi',

  canParse({ agency }) {
    return /케이에스오아이|KSOI|한국사회여론연구소/i.test(agency);
  },

  parse({ text }) {
    const lines = text.split('\n');

    // 우선순위 1: "후보 지지도" 표만
    let questions = runOnce(lines, (line) =>
      /【\s*표\s+\d+\s*】\s*[^\n]+?후보\s*지지도/.test(line),
    );
    if (questions.length > 0) return questions;

    // fallback: 가상대결 표 (적합도는 당내 경선이라 일반 지지율과 의미가 달라 제외)
    questions = runOnce(lines, (line) => /【\s*표\s+\d+\s*】\s*[^\n]+?가상대결/.test(line));
    if (questions.length > 0) return questions;

    // 최종 fallback: 적합도
    return runOnce(lines, (line) => /【\s*표\s+\d+\s*】\s*[^\n]+?후보\s*적합도/.test(line));
  },
};
