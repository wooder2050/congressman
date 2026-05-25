import type { PollPdfParser } from './types';
import { ksoiParser } from './ksoi-parser';
import { realmeterParser } from './realmeter-parser';

/**
 * 사용 가능한 PDF 파서 목록.
 * canParse() 순회 → 첫 매칭 파서로 처리.
 */
export const ALL_PARSERS: PollPdfParser[] = [ksoiParser, realmeterParser];

export function findParser(agency: string): PollPdfParser | null {
  for (const p of ALL_PARSERS) {
    if (p.canParse({ agency, fileName: '', text: '' })) return p;
  }
  return null;
}

export type { ParsedQuestion, ParsedResponse, ParserContext, PollPdfParser } from './types';
