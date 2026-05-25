import { PrismaClient } from '@prisma/client';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { execFile } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { promisify } from 'util';

import { SyncLogService } from './sync-log.service';

/**
 * NEC 재산신고서 스캔 PDF → PNG 변환 + Supabase Storage 미러링
 *
 * 작동 흐름:
 *   1) `assetPdfUrls`가 있고 `assetPagePngUrls`가 비어 있는 후보를 조회
 *   2) 각 PDF URL을 다운로드 (NEC 서버)
 *   3) `pdftoppm` (poppler) 으로 단일 페이지 PDF를 PNG로 변환
 *   4) `candidate-asset-pdfs` 버킷에 업로드 (publicUrl)
 *   5) DB `assetPagePngUrls` 배열에 페이지순으로 저장
 *
 * 시스템 요구사항: poppler 설치 (`brew install poppler` 또는 `apt-get install poppler-utils`)
 *
 * 사용처:
 *   - LocalElectionPdfPngSyncService (지방선거 7,781명)
 *   - ByElectionPdfPngSyncService (재보궐 30명)
 */

const BUCKET = 'candidate-asset-pdfs';
const DPI = 120; // 모바일 가독성과 파일 크기 절충

const HTTP_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

const execFileP = promisify(execFile);

interface CandidateRow {
  id: number;
  huboid: string | null;
  name: string;
  assetPdfUrls: string[];
}

interface SyncCounters {
  processed: number;
  updated: number;
  skipped: number;
  failed: number;
}

export type CandidateTable = 'localElectionCandidate' | 'candidate';

export class AssetPdfPngSyncService {
  private readonly supabase: SupabaseClient;

  constructor(
    private readonly prisma: PrismaClient,
    private readonly syncLog: SyncLogService,
  ) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing');
    }
    this.supabase = createClient(url, key);
  }

  /**
   * 후보 테이블별로 동기화. concurrency는 PDF 다운로드+변환 부담이 커 낮게 권장(2~4).
   */
  async sync(
    table: CandidateTable,
    options: { limit?: number; concurrency?: number; candidateIds?: number[] } = {},
  ): Promise<SyncCounters> {
    const { limit, concurrency = 3, candidateIds } = options;
    const logRow = await this.syncLog.start(`${table}-asset-pdf-png`);

    const counters: SyncCounters = { processed: 0, updated: 0, skipped: 0, failed: 0 };

    try {
      // Prisma client 동적 접근
      const candidates: CandidateRow[] = await this.fetchPending(table, {
        limit,
        candidateIds,
      });
      console.log(`[AssetPdfPngSync:${table}] ${candidates.length} candidates pending`);

      // 동시 처리 워커
      let index = 0;
      const next = (): CandidateRow | null => {
        const i = index++;
        return i < candidates.length ? candidates[i] : null;
      };

      const workers = Array.from({ length: concurrency }, async () => {
        for (let c = next(); c !== null; c = next()) {
          counters.processed++;
          try {
            const pngUrls = await this.processCandidate(c);
            if (pngUrls.length > 0) {
              await this.updateCandidate(table, c.id, pngUrls);
              counters.updated++;
            } else {
              counters.skipped++;
            }
          } catch (err) {
            counters.failed++;
            console.error(
              `[AssetPdfPngSync:${table}] ${c.name} (id=${c.id}) failed:`,
              (err as Error).message,
            );
          }
          if (counters.processed % 10 === 0) {
            console.log(
              `[AssetPdfPngSync:${table}] progress ${counters.processed}/${candidates.length} (updated=${counters.updated}, failed=${counters.failed})`,
            );
          }
        }
      });
      await Promise.all(workers);

      await this.syncLog.complete(logRow.id, counters.updated);
      return counters;
    } catch (err) {
      await this.syncLog.fail(logRow.id, (err as Error).message);
      throw err;
    }
  }

  private async fetchPending(
    table: CandidateTable,
    { limit, candidateIds }: { limit?: number; candidateIds?: number[] },
  ): Promise<CandidateRow[]> {
    const where: Record<string, unknown> = {
      assetPdfUrls: { isEmpty: false },
      assetPagePngUrls: { isEmpty: true },
    };
    if (candidateIds && candidateIds.length > 0) {
      where.id = { in: candidateIds };
    }
    const select = { id: true, huboid: true, name: true, assetPdfUrls: true };
    if (table === 'localElectionCandidate') {
      return this.prisma.localElectionCandidate.findMany({
        where,
        select,
        take: limit,
        orderBy: { id: 'asc' },
      });
    }
    return this.prisma.candidate.findMany({
      where,
      select,
      take: limit,
      orderBy: { id: 'asc' },
    });
  }

  /**
   * 후보 1명의 모든 PDF URL을 PNG로 변환 후 업로드.
   * 페이지 순서를 유지하기 위해 순차 처리.
   */
  private async processCandidate(c: CandidateRow): Promise<string[]> {
    const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), `assetpdf-${c.id}-`));
    const pngUrls: string[] = [];

    try {
      for (let i = 0; i < c.assetPdfUrls.length; i++) {
        const pdfUrl = c.assetPdfUrls[i];
        const pageNum = i + 1;

        // 1) PDF 다운로드
        const pdfPath = path.join(tmpDir, `page-${pageNum}.pdf`);
        const res = await fetch(pdfUrl, { headers: HTTP_HEADERS });
        if (!res.ok) {
          console.warn(
            `[AssetPdfPngSync] ${c.name} page${pageNum} download HTTP ${res.status}: ${pdfUrl}`,
          );
          continue;
        }
        const buf = Buffer.from(await res.arrayBuffer());
        await fs.promises.writeFile(pdfPath, buf);

        // 2) pdftoppm으로 PNG 변환 (단일 페이지 PDF라 -singlefile)
        const pngBase = path.join(tmpDir, `page-${pageNum}`);
        await execFileP('pdftoppm', ['-png', '-r', String(DPI), '-singlefile', pdfPath, pngBase]);
        const pngPath = `${pngBase}.png`;
        if (!fs.existsSync(pngPath)) {
          console.warn(`[AssetPdfPngSync] ${c.name} page${pageNum} pdftoppm output missing`);
          continue;
        }

        // 3) Storage 업로드
        const pngBuf = await fs.promises.readFile(pngPath);
        const huboPart = c.huboid ?? `id-${c.id}`;
        const objectPath = `${huboPart}/page-${pageNum}.png`;
        const { error: uploadErr } = await this.supabase.storage
          .from(BUCKET)
          .upload(objectPath, pngBuf, {
            contentType: 'image/png',
            upsert: true,
            cacheControl: '604800', // 7일
          });
        if (uploadErr) {
          console.warn(
            `[AssetPdfPngSync] ${c.name} page${pageNum} upload failed: ${uploadErr.message}`,
          );
          continue;
        }
        const { data: pub } = this.supabase.storage.from(BUCKET).getPublicUrl(objectPath);
        pngUrls.push(pub.publicUrl);
      }
    } finally {
      await fs.promises.rm(tmpDir, { recursive: true, force: true });
    }

    return pngUrls;
  }

  private async updateCandidate(
    table: CandidateTable,
    id: number,
    pngUrls: string[],
  ): Promise<void> {
    if (table === 'localElectionCandidate') {
      await this.prisma.localElectionCandidate.update({
        where: { id },
        data: { assetPagePngUrls: pngUrls },
      });
    } else {
      await this.prisma.candidate.update({
        where: { id },
        data: { assetPagePngUrls: pngUrls },
      });
    }
  }
}
