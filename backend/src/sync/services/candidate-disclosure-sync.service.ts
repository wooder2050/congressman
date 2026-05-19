import { PrismaClient } from '@prisma/client';

import { SyncLogService } from './sync-log.service';

const NEC_ELECTION_ID = '0020260603';
const CANDIDATE_DETAIL_URL = (huboid: string) =>
  `http://info.nec.go.kr/electioninfo/candidate_detail_info.xhtml?electionId=${NEC_ELECTION_ID}&huboId=${huboid}`;

const HTTP_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

export interface DisclosureFields {
  assetDeclared: bigint | null;
  militaryService: string | null;
  taxPaid: bigint | null;
  taxOverdue5y: bigint | null;
  taxOverdueCurrent: bigint | null;
  criminalRecord: string | null;
  electionCount: number | null;
}

/** "717,243" → 717243000n (천원 → 원), "" / "-" → null */
function parseThousandsWon(text: string | undefined): bigint | null {
  if (!text) return null;
  const cleaned = text.replace(/[,\s]/g, '').trim();
  if (!cleaned || cleaned === '-') return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  return BigInt(n) * 1000n;
}

/** "6회" → 6, "0회" → 0, 그 외 null */
function parseElectionCount(text: string | undefined): number | null {
  if (!text) return null;
  const m = text.match(/(-?\d+)/);
  if (!m) return null;
  return parseInt(m[1], 10);
}

/** 빈/대시/공백만 있으면 null, 의미있는 값이면 그대로 */
function cleanText(text: string | undefined): string | null {
  if (!text) return null;
  const t = text.trim();
  if (!t || t === '-' || t === '–') return null;
  return t;
}

/** 후보자 상세 HTML에서 기본정보 테이블 파싱 */
export function parseDisclosureFromHtml(html: string): DisclosureFields | null {
  const tableMatch = html.match(/<table>([\s\S]*?)<\/table>/);
  if (!tableMatch) return null;
  const tbody = tableMatch[1];

  const fields = new Map<string, string>();
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
  let trMatch: RegExpExecArray | null;
  while ((trMatch = trRegex.exec(tbody)) !== null) {
    const trContent = trMatch[1];
    const ths = [...trContent.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((m) => m[1]);
    const tds = [...trContent.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => m[1]);
    for (let i = 0; i < Math.min(ths.length, tds.length); i++) {
      const key = ths[i].replace(/<[^>]+>/g, '').trim();
      const val = tds[i]
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      fields.set(key, val);
    }
  }

  return {
    assetDeclared: parseThousandsWon(fields.get('재산신고액(천원)')),
    militaryService: cleanText(fields.get('병역신고사항(본인)')),
    taxPaid: parseThousandsWon(fields.get('납부액(천원)')),
    taxOverdue5y: parseThousandsWon(fields.get('최근 5년간 체납액(천원)')),
    taxOverdueCurrent: parseThousandsWon(fields.get('현체납액(천원)')),
    criminalRecord: cleanText(fields.get('전과기록유무(건수)')),
    electionCount: parseElectionCount(fields.get('입후보 횟수')),
  };
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: HTTP_HEADERS, redirect: 'follow' });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

type Target = 'local' | 'by';

export class CandidateDisclosureSyncService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly syncLog: SyncLogService,
  ) {}

  async syncDisclosures(
    target: Target,
    options: { limit?: number; concurrency?: number } = {},
  ): Promise<void> {
    const { limit, concurrency = 8 } = options;
    const syncType = target === 'local' ? 'local-election-disclosure' : 'by-election-disclosure';
    const logRow = await this.syncLog.start(syncType);

    try {
      const candidates =
        target === 'local'
          ? await this.prisma.localElectionCandidate.findMany({
              where: {
                huboid: { not: '' },
                assetDeclared: null,
              },
              select: { id: true, huboid: true, name: true },
              take: limit,
            })
          : await this.prisma.candidate.findMany({
              where: {
                huboid: { not: null },
                assetDeclared: null,
              },
              select: { id: true, huboid: true, name: true },
              take: limit,
            });

      console.log(`[DisclosureSync:${target}] ${candidates.length} candidates pending`);

      let updated = 0;
      let skipped = 0;
      let failed = 0;
      let processed = 0;

      const queue = [...candidates];
      const workers = Array.from({ length: concurrency }, async () => {
        while (queue.length > 0) {
          const c = queue.shift();
          if (!c || !c.huboid) break;
          processed++;
          try {
            const result = await this.processOne(target, c.id, c.huboid);
            if (result === 'updated') updated++;
            else if (result === 'skipped') skipped++;
            else failed++;
          } catch (e) {
            failed++;
            console.error(
              `[DisclosureSync:${target}] ${c.name}(${c.huboid}) failed:`,
              (e as Error).message,
            );
          }
          if (processed % 200 === 0) {
            console.log(
              `[DisclosureSync:${target}] progress ${processed}/${candidates.length} (updated=${updated} skipped=${skipped} failed=${failed})`,
            );
          }
        }
      });

      await Promise.all(workers);

      console.log(
        `[DisclosureSync:${target}] Completed: updated=${updated} skipped=${skipped} failed=${failed} total=${candidates.length}`,
      );

      await this.syncLog.complete(logRow.id, updated);
    } catch (err) {
      await this.syncLog.fail(logRow.id, (err as Error).message);
      throw err;
    }
  }

  private async processOne(
    target: Target,
    candidateId: number,
    huboid: string,
  ): Promise<'updated' | 'skipped' | 'failed'> {
    const html = await fetchHtml(CANDIDATE_DETAIL_URL(huboid));
    if (!html) return 'failed';

    const fields = parseDisclosureFromHtml(html);
    if (!fields) return 'skipped';

    // 모든 필드가 null이면 skip
    const hasAny =
      fields.assetDeclared !== null ||
      fields.militaryService !== null ||
      fields.taxPaid !== null ||
      fields.criminalRecord !== null ||
      fields.electionCount !== null;
    if (!hasAny) return 'skipped';

    if (target === 'local') {
      await this.prisma.localElectionCandidate.update({
        where: { id: candidateId },
        data: fields,
      });
    } else {
      await this.prisma.candidate.update({
        where: { id: candidateId },
        data: fields,
      });
    }
    return 'updated';
  }
}
