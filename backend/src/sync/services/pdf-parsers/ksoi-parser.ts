/**
 * KSOI (한국사회여론연구소) PDF 결과표 파서
 *
 * 표 식별자: 【 표 N 】 ... 후보 지지도 / 【 표 N 】 정당 지지도
 * 데이터/자기-동치 행은 NESDC 공통 패턴이라 extractByColumnMap에 위임.
 */

import { extractByColumnMap } from './common-column-mapper';
import type { PollPdfParser } from './types';

export const ksoiParser: PollPdfParser = {
  name: 'ksoi',

  canParse({ agency }) {
    return /케이에스오아이|KSOI|한국사회여론연구소/i.test(agency);
  },

  parse({ text }) {
    const lines = text.split('\n');
    return extractByColumnMap(lines, {
      // 후보 단위 표는 다양한 명칭으로 나옴:
      //   "{race} 후보 지지도" / "{race} 후보 적합도" / "{race} 가상대결" 등
      detectCandidateTable: (line) =>
        /【\s*표\s+\d+\s*】\s*[^\n]+?(후보\s*지지도|후보\s*적합도|가상대결)/.test(line),
      detectPartyTable: (line) => /【\s*표\s+\d+\s*】\s*정당\s*지지도/.test(line),
      detectAnyTable: (line) => /【\s*표\s+\d+\s*】/.test(line),
      extractRaceLabel: (allLines, idx) => {
        // race 라벨 추출: "후보 지지도"·"후보 적합도"·"가상대결" 앞쪽
        const line = allLines[idx];
        const m =
          /【\s*표\s+\d+\s*】\s*([^\n]+?)\s+(?:후보\s*지지도|후보\s*적합도|가상대결)/.exec(line);
        if (m) return m[1].trim();
        // "가상대결" 같이 race가 표 내부 다른 행에 있는 경우는 추후 확장
        return null;
      },
    });
  },
};
