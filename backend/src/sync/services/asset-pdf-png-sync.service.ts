import { PrismaClient } from '@prisma/client';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { execFile } from 'child_process';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { promisify } from 'util';

import { SyncLogService } from './sync-log.service';

/**
 * NEC 재산신고서 스캔 PDF → PNG 변환 + Supabase Storage 미러링
 *
 * 작동 흐름:
 *   1) pending/stale 후보 조회 (PDF URL이 있고, PNG 미러가 없거나 sourceHash가 변경된 경우)
 *   2) 각 PDF URL을 다운로드 (timeout + maxSize + content-type 검증)
 *   3) `pdftoppm` (poppler) 으로 PNG 변환 (timeout)
 *   4) `candidate-asset-pdfs` 버킷에 업로드
 *   5) **모든 페이지 성공 시에만** DB 업데이트 (all-or-nothing, 리뷰 #2)
 *   6) `assetPdfSourceHash` 저장 (URL 변경 감지용, 리뷰 #3)
 *
 * 시스템 요구사항: poppler 설치 (`brew install poppler` 또는 `apt-get install poppler-utils`)
 *
 * 운영:
 *   - Storage 버킷 `candidate-asset-pdfs`는 public (재산공개 자료, 공직선거법 제49조)
 *   - upsert=true로 같은 path 덮어쓰기
 */

const BUCKET = 'candidate-asset-pdfs';
const DPI = 120; // 모바일 가독성과 파일 크기 절충
const FETCH_TIMEOUT_MS = 30_000; // 30초
const MAX_PDF_BYTES = 20 * 1024 * 1024; // 20MB
const PDFTOPPM_TIMEOUT_MS = 60_000; // 60초
const PDFTOPPM_MAX_BUFFER = 50 * 1024 * 1024; // 50MB (stderr/stdout)

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
  assetPagePngUrls: string[];
  assetPdfSourceHash: string | null;
  assetPdfSyncStatus: string | null;
}

interface SyncCounters {
  processed: number;
  updated: number;
  skipped: number;
  failed: number;
}

export type CandidateTable = 'localElectionCandidate' | 'candidate';

/** Storage path 안전 정규화 (리뷰 #1) — 영숫자·하이픈·언더스코어만 허용 */
function safeSlug(input: string | null | undefined): string {
  if (!input) return '';
  return input.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64);
}

/** PDF URL 배열의 안정적인 hash (리뷰 #3) — 페이지 순서 + URL 자체로 변경 감지 */
function hashPdfUrls(urls: string[]): string {
  const h = crypto.createHash('sha256');
  for (const u of urls) {
    h.update(u);
    h.update('\n');
  }
  return h.digest('hex').slice(0, 32);
}

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

  async sync(
    table: CandidateTable,
    options: { limit?: number; concurrency?: number; candidateIds?: number[] } = {},
  ): Promise<SyncCounters> {
    const { limit, concurrency = 3, candidateIds } = options;
    const logRow = await this.syncLog.start(`${table}-asset-pdf-png`);

    const counters: SyncCounters = { processed: 0, updated: 0, skipped: 0, failed: 0 };

    try {
      const candidates: CandidateRow[] = await this.fetchPending(table, { limit, candidateIds });
      console.log(`[AssetPdfPngSync:${table}] ${candidates.length} candidates pending/stale`);

      // 동시 처리 워커
      let index = 0;
      const next = (): CandidateRow | null => {
        const i = index++;
        return i < candidates.length ? candidates[i] : null;
      };

      const workers = Array.from({ length: concurrency }, async () => {
        for (let c = next(); c !== null; c = next()) {
          counters.processed++;
          const expectedHash = hashPdfUrls(c.assetPdfUrls);
          try {
            const pngUrls = await this.processCandidate(c, table);
            if (pngUrls.length === c.assetPdfUrls.length) {
              // All-or-nothing: 모든 페이지 성공 시에만 commit (리뷰 #2)
              await this.updateCandidate(table, c.id, {
                assetPagePngUrls: pngUrls,
                assetPdfSourceHash: expectedHash,
                assetPdfSyncStatus: 'completed',
                assetPdfSyncError: null,
              });
              counters.updated++;
            } else {
              await this.updateCandidate(table, c.id, {
                assetPdfSyncStatus: 'failed',
                assetPdfSyncError: `partial: ${pngUrls.length}/${c.assetPdfUrls.length} pages succeeded`,
              });
              counters.failed++;
            }
          } catch (err) {
            counters.failed++;
            const msg = (err as Error).message.slice(0, 500);
            console.error(`[AssetPdfPngSync:${table}] ${c.name} (id=${c.id}) failed:`, msg);
            await this.updateCandidate(table, c.id, {
              assetPdfSyncStatus: 'failed',
              assetPdfSyncError: msg,
            }).catch(() => {
              /* DB 업데이트 실패는 무시 — 다음 sync에서 재시도 */
            });
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

  /**
   * Pending 조회 (리뷰 #3): 다음 중 하나면 처리 대상
   *   - assetPagePngUrls가 비어있음 (미처리)
   *   - assetPdfSyncStatus != 'completed' (실패/null)
   *   - assetPdfSourceHash 가 현재 URL 배열 hash와 다름 (URL 변경)
   * 마지막 조건은 SQL에서 계산이 어려워 일단 hash가 없거나 status != completed인 행을 polling하고
   * 워커에서 다시 확인.
   */
  private async fetchPending(
    table: CandidateTable,
    { limit, candidateIds }: { limit?: number; candidateIds?: number[] },
  ): Promise<CandidateRow[]> {
    const where: Record<string, unknown> = {
      assetPdfUrls: { isEmpty: false },
      OR: [
        { assetPagePngUrls: { isEmpty: true } },
        { assetPdfSyncStatus: { not: 'completed' } },
        { assetPdfSourceHash: null },
      ],
    };
    if (candidateIds && candidateIds.length > 0) {
      where.id = { in: candidateIds };
    }
    const select = {
      id: true,
      huboid: true,
      name: true,
      assetPdfUrls: true,
      assetPagePngUrls: true,
      assetPdfSourceHash: true,
      assetPdfSyncStatus: true,
    };
    const orderBy = { id: 'asc' as const };
    const rows =
      table === 'localElectionCandidate'
        ? await this.prisma.localElectionCandidate.findMany({ where, select, take: limit, orderBy })
        : await this.prisma.candidate.findMany({ where, select, take: limit, orderBy });

    // 메모리에서 hash 비교 (이미 completed인 행은 hash 일치 시 skip)
    const expected = rows.filter((r) => {
      if (!r.assetPagePngUrls || r.assetPagePngUrls.length === 0) return true;
      if (r.assetPdfSyncStatus !== 'completed') return true;
      const newHash = hashPdfUrls(r.assetPdfUrls);
      return newHash !== r.assetPdfSourceHash;
    });
    return expected;
  }

  /**
   * 후보 1명의 모든 PDF URL을 PNG로 변환 후 업로드.
   * 페이지 순서를 유지하기 위해 순차 처리. 어느 페이지든 실패하면 throw.
   */
  private async processCandidate(c: CandidateRow, table: CandidateTable): Promise<string[]> {
    const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), `assetpdf-${c.id}-`));
    const pngUrls: string[] = [];

    try {
      for (let i = 0; i < c.assetPdfUrls.length; i++) {
        const pdfUrl = c.assetPdfUrls[i];
        const pageNum = i + 1;

        // 1) PDF 다운로드 (timeout + size + content-type, 리뷰 #4)
        const pdfPath = path.join(tmpDir, `page-${pageNum}.pdf`);
        await this.downloadPdf(pdfUrl, pdfPath, `${c.name} page${pageNum}`);

        // 2) pdftoppm으로 PNG 변환 (timeout + stderr, 리뷰 #5)
        const pngBase = path.join(tmpDir, `page-${pageNum}`);
        try {
          const { stderr } = await execFileP(
            'pdftoppm',
            ['-png', '-r', String(DPI), '-singlefile', pdfPath, pngBase],
            { timeout: PDFTOPPM_TIMEOUT_MS, maxBuffer: PDFTOPPM_MAX_BUFFER },
          );
          if (stderr && stderr.trim()) {
            console.warn(
              `[AssetPdfPngSync] ${c.name} page${pageNum} pdftoppm stderr: ${stderr.trim().slice(0, 200)}`,
            );
          }
        } catch (e) {
          throw new Error(`pdftoppm failed page${pageNum}: ${(e as Error).message.slice(0, 200)}`);
        }
        const pngPath = `${pngBase}.png`;
        if (!fs.existsSync(pngPath)) {
          throw new Error(`pdftoppm output missing page${pageNum}`);
        }

        // 3) Storage 업로드 (path: <table>/<id>-<huboSlug>/page-N.png, 리뷰 #1)
        const pngBuf = await fs.promises.readFile(pngPath);
        const huboSlug = safeSlug(c.huboid);
        const dir = huboSlug ? `${table}/${c.id}-${huboSlug}` : `${table}/${c.id}`;
        const objectPath = `${dir}/page-${pageNum}.png`;
        const { error: uploadErr } = await this.supabase.storage
          .from(BUCKET)
          .upload(objectPath, pngBuf, {
            contentType: 'image/png',
            upsert: true,
            cacheControl: '604800', // 7일
          });
        if (uploadErr) {
          throw new Error(`upload page${pageNum}: ${uploadErr.message}`);
        }
        const { data: pub } = this.supabase.storage.from(BUCKET).getPublicUrl(objectPath);
        pngUrls.push(pub.publicUrl);
      }
    } finally {
      await fs.promises.rm(tmpDir, { recursive: true, force: true });
    }

    return pngUrls;
  }

  /**
   * PDF 다운로드 (timeout, max size, content-type 검증)
   */
  private async downloadPdf(url: string, dest: string, label: string): Promise<void> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        headers: HTTP_HEADERS,
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${url}`);
      }
      const contentType = res.headers.get('content-type') ?? '';
      if (!contentType.includes('pdf') && !contentType.includes('octet-stream')) {
        throw new Error(`unexpected content-type "${contentType}" for ${label}: ${url}`);
      }
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.byteLength > MAX_PDF_BYTES) {
        throw new Error(`PDF too large (${buf.byteLength} bytes) for ${label}`);
      }
      // PDF 매직 바이트 확인 (%PDF-)
      if (buf.length < 5 || buf.slice(0, 5).toString('ascii') !== '%PDF-') {
        throw new Error(`not a PDF (magic bytes mismatch) for ${label}`);
      }
      await fs.promises.writeFile(dest, buf);
    } finally {
      clearTimeout(timer);
    }
  }

  private async updateCandidate(
    table: CandidateTable,
    id: number,
    data: {
      assetPagePngUrls?: string[];
      assetPdfSourceHash?: string | null;
      assetPdfSyncStatus?: string | null;
      assetPdfSyncError?: string | null;
    },
  ): Promise<void> {
    if (table === 'localElectionCandidate') {
      await this.prisma.localElectionCandidate.update({ where: { id }, data });
    } else {
      await this.prisma.candidate.update({ where: { id }, data });
    }
  }
}
