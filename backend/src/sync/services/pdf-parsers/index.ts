import type { PollPdfParser } from './types';
import { ksoiParser } from './ksoi-parser';
import { realmeterParser } from './realmeter-parser';
import { hriParser } from './hri-parser';
import { yeoronSurveyKkokParser } from './yeoron-survey-kkok-parser';
import { kirParser } from './kir-parser';
import { embrainParser } from './embrain-parser';

/**
 * 사용 가능한 PDF 파서 목록.
 * findParser()로 agency 매칭되는 파서를 선택한다.
 */
const ALL_PARSERS: PollPdfParser[] = [
  ksoiParser,
  realmeterParser,
  hriParser,
  yeoronSurveyKkokParser,
  kirParser,
  embrainParser,
];

export function findParser(agency: string): PollPdfParser | null {
  for (const p of ALL_PARSERS) {
    if (p.canParse({ agency, fileName: '', text: '' })) return p;
  }
  return null;
}
