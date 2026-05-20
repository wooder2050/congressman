import { PrismaClient } from '@prisma/client';

import { SyncLogService } from './sync-log.service';

const NEC_ELECTION_ID = '0020260603';
const CANDIDATE_DETAIL_URL = (huboid: string) =>
  `http://info.nec.go.kr/electioninfo/candidate_detail_info.xhtml?electionId=${NEC_ELECTION_ID}&huboId=${huboid}`;

// 재산신고서 스캔파일 목록 JSON API (재산 탭 클릭 시 호출되는 엔드포인트)
const SCAN_SEARCH_URL = 'http://info.nec.go.kr/electioninfo/candidate_detail_scanSearchJson.json';
const PDF_BASE = 'https://info.nec.go.kr/unielec_pdf_file/';

const HTTP_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

interface DisclosureFields {
  assetDeclared: bigint | null;
  militaryService: string | null;
  taxPaid: bigint | null;
  taxOverdue5y: bigint | null;
  taxOverdueCurrent: bigint | null;
  criminalRecord: string | null;
  electionCount: number | null;
}

/** 재보궐 후보자 기본정보 — NEC 상세 HTML에서만 채워지고 시드에는 없는 필드.
 *  career는 시드 데이터가 더 정리돼 있어 보강 대상에서 제외한다. */
interface ProfileFields {
  birthDate: string | null;
  education: string | null;
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

/** "1970.02.14 (56세)/남" → "19700214" (LocalElectionCandidate.birthDate와 동일한 YYYYMMDD 포맷) */
function parseBirthDate(text: string | undefined): string | null {
  if (!text) return null;
  const m = text.match(/(\d{4})\.(\d{1,2})\.(\d{1,2})/);
  if (!m) return null;
  return `${m[1]}${m[2].padStart(2, '0')}${m[3].padStart(2, '0')}`;
}

interface ParsedCandidate {
  disclosure: DisclosureFields;
  profile: ProfileFields;
}

/** 후보자 상세 HTML에서 기본정보 테이블 파싱 */
function parseDisclosureFromHtml(html: string): ParsedCandidate | null {
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
    disclosure: {
      assetDeclared: parseThousandsWon(fields.get('재산신고액(천원)')),
      militaryService: cleanText(fields.get('병역신고사항(본인)')),
      taxPaid: parseThousandsWon(fields.get('납부액(천원)')),
      taxOverdue5y: parseThousandsWon(fields.get('최근 5년간 체납액(천원)')),
      taxOverdueCurrent: parseThousandsWon(fields.get('현체납액(천원)')),
      criminalRecord: cleanText(fields.get('전과기록유무(건수)')),
      electionCount: parseElectionCount(fields.get('입후보 횟수')),
    },
    profile: {
      birthDate: parseBirthDate(fields.get('생년월일')),
      education: cleanText(fields.get('학력')),
    },
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

/**
 * 재산신고서 원문 PDF URL 목록을 페이지순으로 조회한다.
 * NEC 재산 탭의 scanSearch JSON API → 각 페이지 파일경로(.tif) → PDF URL로 변환.
 * 재산신고서는 여러 장(1페이지 표지 + 금액 내역)이므로 전체 페이지를 보관한다.
 */
async function fetchAssetPdfUrls(huboid: string): Promise<string[]> {
  try {
    const res = await fetch(SCAN_SEARCH_URL, {
      method: 'POST',
      headers: {
        ...HTTP_HEADERS,
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      body: `gubun=2&electionId=${NEC_ELECTION_ID}&huboId=${huboid}&statementId=CPRI03_candidate_scanSearch`,
    });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      jsonResult?: { body?: { FILEPATH?: string; DISP_SEQ?: number }[] };
    };
    const files = json.jsonResult?.body ?? [];
    return (
      files
        .filter((f): f is { FILEPATH: string; DISP_SEQ?: number } => Boolean(f.FILEPATH))
        .sort((a, b) => (a.DISP_SEQ ?? 0) - (b.DISP_SEQ ?? 0))
        // "20260603/open/.../jaesan/...._1.tif" → ".../...._1.PDF"
        .map((f) => `${PDF_BASE}${f.FILEPATH.replace(/\.tif$/i, '.PDF')}`)
    );
  } catch {
    return [];
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
              // disclosure 미수집분 + 재산 PDF 미수집분 모두 대상에 포함
              where: {
                huboid: { not: '' },
                OR: [{ assetDeclared: null }, { assetPdfUrls: { isEmpty: true } }],
              },
              select: { id: true, huboid: true, name: true },
              take: limit,
            })
          : await this.prisma.candidate.findMany({
              // 재보궐 후보자는 disclosure 5종이 이미 채워져 있을 수 있으므로
              // 기본정보(birthDate)·재산 PDF 누락분도 대상에 포함한다.
              where: {
                huboid: { not: null },
                OR: [
                  { assetDeclared: null },
                  { birthDate: null },
                  { assetPdfUrls: { isEmpty: true } },
                ],
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

    const parsed = parseDisclosureFromHtml(html);
    if (!parsed) return 'skipped';
    const { disclosure, profile } = parsed;

    // disclosure 5종이 모두 null이면 사실상 빈 페이지로 보고 skip
    const hasDisclosure =
      disclosure.assetDeclared !== null ||
      disclosure.militaryService !== null ||
      disclosure.taxPaid !== null ||
      disclosure.criminalRecord !== null ||
      disclosure.electionCount !== null;
    if (!hasDisclosure) return 'skipped';

    // 재산신고서 원문 PDF URL 목록 (실패해도 disclosure 저장은 계속 진행)
    const assetPdfUrls = await fetchAssetPdfUrls(huboid);

    if (target === 'local') {
      await this.prisma.localElectionCandidate.update({
        where: { id: candidateId },
        data: { ...disclosure, assetPdfUrls },
      });
    } else {
      // 재보궐 후보자는 시드에 birthDate/education/career가 없으므로 함께 보강한다.
      await this.prisma.candidate.update({
        where: { id: candidateId },
        data: { ...disclosure, ...profile, assetPdfUrls },
      });
    }
    return 'updated';
  }
}
