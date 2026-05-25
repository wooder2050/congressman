import type { PollPdfParser } from './types';
import { ksoiParser } from './ksoi-parser';
import { realmeterParser } from './realmeter-parser';

/**
 * 사용 가능한 PDF 파서 목록.
 * findParser()로 agency 매칭되는 파서를 선택한다.
 */
const ALL_PARSERS: PollPdfParser[] = [ksoiParser, realmeterParser];

export function findParser(agency: string): PollPdfParser | null {
  for (const p of ALL_PARSERS) {
    if (p.canParse({ agency, fileName: '', text: '' })) return p;
  }
  return null;
}
