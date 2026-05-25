/**
 * 리얼미터 PDF 결과표 파서
 *
 * 리얼미터 결과표는 표 식별자가 두 줄에 걸쳐 나온다:
 *   표Ⅲ-2 : 후보 지지도
 *   Q2. 귀하께서는 경남도지사 선거에 출마하는 다음 후보 중 ...
 *
 * 데이터/자기-동치 행 패턴은 KSOI와 동일.
 */

import { extractByColumnMap } from './common-column-mapper';
import type { PollPdfParser } from './types';

export const realmeterParser: PollPdfParser = {
  name: 'realmeter',

  canParse({ agency }) {
    return /리얼미터|realmeter/i.test(agency);
  },

  parse({ text }) {
    const lines = text.split('\n');
    return extractByColumnMap(lines, {
      detectCandidateTable: (line) => /표[\sⅠ-Ⅻ\d\-\.]+:\s*후보\s*지지도/.test(line),
      detectPartyTable: (line) => /표[\sⅠ-Ⅻ\d\-\.]+:\s*정당\s*지지도/.test(line),
      detectAnyTable: (line) => /^\s*표[\sⅠ-Ⅻ\d\-\.]+:/.test(line),
      extractRaceLabel: (lines, idx) => {
        const qLine = lines[idx + 1] ?? '';
        const m = qLine.match(/(?:는|은)\s+([가-힣A-Za-z\s·]+?(?:도지사|시장|군수|구청장|교육감))/);
        return m ? m[1].trim() : null;
      },
    });
  },
};
