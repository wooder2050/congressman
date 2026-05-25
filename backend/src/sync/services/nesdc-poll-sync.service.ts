import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

import { SyncLogService } from './sync-log.service';

const BASE = 'https://www.nesdc.go.kr';
const LIST_URL = `${BASE}/portal/bbs/B0000005/list.do`;
const VIEW_URL = `${BASE}/portal/bbs/B0000005/view.do`;
const DOWNLOAD_URL = `${BASE}/portal/cmm/fms/FileDown.do`;
const MENU_NO = '200467';
const STORAGE_BUCKET = 'nesdc-polls';

// NESDC robots.txt가 전체 disallow이므로 저속 + UA 명시 + 동시성 1
const REQUEST_DELAY_MS = 2200;

const HTTP_HEADERS = {
  'User-Agent':
    'CongressmanDataBot/1.0 (+contact: wooder2050@gmail.com; respectful polling data collector)',
  Accept: 'text/html,application/xhtml+xml',
  'Accept-Language': 'ko-KR,ko;q=0.9',
};

// 우리 시스템이 다루는 선거 카테고리만 수집
const TARGET_ELECTION_CATEGORIES = ['제9회 전국동시지방선거', '2026년 재·보궐선거'];

type PollListItem = {
  nttId: string;
  registrationNo: string;
  agency: string;
  client: string;
  surveyMethod: string;
  pollNamePreview: string;
  registeredAt: string; // YYYY-MM-DD
  sido: string;
};

type ParsedAttachment = {
  kind: 'questionnaire' | 'result' | 'other';
  fileName: string;
  atchFileId: string;
  fileSn: string;
  bbsKey: string;
};

type ParsedPollDetail = {
  registrationNo: string;
  electionCategory: string;
  pollName: string;
  agency: string;
  client: string;
  sido: string;
  sigungu: string;
  surveyStartedAt: Date | null;
  surveyEndedAt: Date | null;
  surveyDays: number | null;
  surveyMinutes: number | null;
  sampleSize: number | null;
  weightedSampleSize: number | null;
  surveyMethod: string | null;
  samplingFrame: string | null;
  contactRate: number | null;
  responseRate: number | null;
  aaporResponseRate: number | null;
  marginOfError: number | null;
  confidenceLevel: number | null;
  weightingMethod: string | null;
  weightingTarget: string | null;
  publishMedia: string | null;
  publishMediaName: string | null;
  publishedAt: Date | null;
  attachments: ParsedAttachment[];
};

export class NesdcPollSyncService {
  private readonly supabase: SupabaseClient | null;

  constructor(
    private readonly prisma: PrismaClient,
    private readonly syncLog: SyncLogService,
  ) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    this.supabase = url && key ? createClient(url, key) : null;
    if (!this.supabase) {
      console.warn('[NesdcPollSync] SUPABASE creds missing — PDF mirroring will be skipped');
    }
  }

  /**
   * Step 1 메인: NESDC 목록을 순회하며 메타 + 첨부 메타까지 upsert.
   * PDF 다운로드/스토리지 미러링은 downloadAttachments=true일 때만 수행.
   */
  async syncPolls(
    options: {
      maxPages?: number;
      onlyCategories?: string[];
      downloadAttachments?: boolean;
      stopOnExisting?: boolean; // 첫 페이지에서 이미 본 nttId 만나면 중단 (incremental)
    } = {},
  ): Promise<void> {
    const {
      maxPages = 200,
      onlyCategories = TARGET_ELECTION_CATEGORIES,
      downloadAttachments = false,
      stopOnExisting = false,
    } = options;

    const log = await this.syncLog.start('nesdc-polls');

    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    let failed = 0;
    let attachmentsDownloaded = 0;

    try {
      for (let pageIndex = 1; pageIndex <= maxPages; pageIndex++) {
        let listHtml: string;
        try {
          listHtml = await this.fetchHtml(`${LIST_URL}?menuNo=${MENU_NO}&pageIndex=${pageIndex}`);
        } catch (e) {
          failed++;
          console.error(`[NesdcPollSync] list page ${pageIndex} failed:`, (e as Error).message);
          await this.sleep(REQUEST_DELAY_MS);
          continue;
        }

        const items = this.parseList(listHtml);
        if (items.length === 0) {
          console.log(`[NesdcPollSync] page ${pageIndex} empty — stopping`);
          break;
        }

        console.log(`[NesdcPollSync] page ${pageIndex}: ${items.length} items`);
        let sawExistingOnFirstPage = false;

        for (const item of items) {
          await this.sleep(REQUEST_DELAY_MS);

          try {
            // 상세 페이지를 일단 가져와서 electionCategory를 본 뒤 필터링
            const detailHtml = await this.fetchHtml(
              `${VIEW_URL}?nttId=${item.nttId}&menuNo=${MENU_NO}`,
            );
            const detail = this.parseDetail(detailHtml);

            if (onlyCategories.length > 0 && !onlyCategories.includes(detail.electionCategory)) {
              skipped++;
              continue;
            }

            const existing = await this.prisma.poll.findUnique({
              where: { nttId: item.nttId },
              select: { id: true, parseStatus: true },
            });

            const registeredAt = parseDate(item.registeredAt) ?? new Date();

            const data = {
              nttId: item.nttId,
              registrationNo: detail.registrationNo || item.registrationNo,
              electionCategory: detail.electionCategory,
              electionId:
                detail.electionCategory === '제9회 전국동시지방선거' ? 'local-2026' : null,
              pollName: detail.pollName || item.pollNamePreview,
              agency: detail.agency || item.agency,
              client: detail.client || item.client,
              sido: detail.sido || item.sido,
              sigungu: detail.sigungu,
              surveyStartedAt: detail.surveyStartedAt,
              surveyEndedAt: detail.surveyEndedAt,
              surveyDays: detail.surveyDays,
              surveyMinutes: detail.surveyMinutes,
              sampleSize: detail.sampleSize,
              weightedSampleSize: detail.weightedSampleSize,
              surveyMethod: detail.surveyMethod ?? item.surveyMethod,
              samplingFrame: detail.samplingFrame,
              contactRate: detail.contactRate,
              responseRate: detail.responseRate,
              aaporResponseRate: detail.aaporResponseRate,
              marginOfError: detail.marginOfError,
              confidenceLevel: detail.confidenceLevel,
              weightingMethod: detail.weightingMethod,
              weightingTarget: detail.weightingTarget,
              publishMedia: detail.publishMedia,
              publishMediaName: detail.publishMediaName,
              publishedAt: detail.publishedAt,
              registeredAt,
              parseStatus: 'meta_only',
            };

            const poll = await this.prisma.poll.upsert({
              where: { nttId: item.nttId },
              create: data,
              update: data,
            });

            if (existing) {
              updated++;
              if (stopOnExisting && pageIndex === 1) sawExistingOnFirstPage = true;
            } else {
              inserted++;
            }

            // 첨부 메타 upsert
            for (const att of detail.attachments) {
              const downloadUrl =
                `${DOWNLOAD_URL}?atchFileId=${att.atchFileId}` +
                `&fileSn=${att.fileSn}&bbsId=B0000005&bbsKey=${att.bbsKey}`;

              await this.prisma.pollAttachment.upsert({
                where: {
                  pollId_atchFileId_fileSn: {
                    pollId: poll.id,
                    atchFileId: att.atchFileId,
                    fileSn: att.fileSn,
                  },
                },
                create: {
                  pollId: poll.id,
                  kind: att.kind,
                  fileName: att.fileName,
                  atchFileId: att.atchFileId,
                  fileSn: att.fileSn,
                  bbsKey: att.bbsKey,
                  downloadUrl,
                  status: 'pending',
                },
                update: {
                  kind: att.kind,
                  fileName: att.fileName,
                  bbsKey: att.bbsKey,
                  downloadUrl,
                },
              });
            }

            if (downloadAttachments && this.supabase) {
              const r = await this.downloadAttachmentsForPoll(poll.id, item.nttId);
              attachmentsDownloaded += r.downloaded;
            }
          } catch (e) {
            failed++;
            console.error(`[NesdcPollSync] nttId=${item.nttId} failed:`, (e as Error).message);
          }
        }

        console.log(
          `[NesdcPollSync] cumulative: inserted=${inserted} updated=${updated} skipped=${skipped} failed=${failed} attachments=${attachmentsDownloaded}`,
        );

        if (sawExistingOnFirstPage) {
          console.log('[NesdcPollSync] stopOnExisting tripped — finishing');
          break;
        }
      }

      await this.syncLog.complete(log.id, inserted + updated);
    } catch (err) {
      await this.syncLog.fail(log.id, (err as Error).message);
      throw err;
    }
  }

  /**
   * 특정 조사기관 + result/questionnaire 첨부만 골라 일괄 다운로드.
   * Step 2 PDF 파싱을 위한 사전 작업 (Storage 미러링).
   */
  async downloadPdfsByAgency(options: {
    agencies: string[];
    kinds?: ('result' | 'questionnaire' | 'other')[];
    electionCategory?: string;
    limit?: number;
  }): Promise<{ downloaded: number; failed: number; notYet: number; skipped: number }> {
    if (!this.supabase) {
      throw new Error('SUPABASE creds missing — cannot download PDFs');
    }

    const log = await this.syncLog.start('nesdc-poll-pdfs');
    const kinds = options.kinds ?? ['result'];
    let downloaded = 0;
    let failed = 0;
    let notYet = 0;
    let skipped = 0;

    try {
      const candidates = await this.prisma.pollAttachment.findMany({
        where: {
          status: { in: ['pending', 'not_yet_public', 'failed'] },
          kind: { in: kinds },
          poll: {
            agency: { in: options.agencies },
            ...(options.electionCategory
              ? { electionCategory: options.electionCategory }
              : {}),
          },
        },
        select: { id: true, pollId: true, poll: { select: { nttId: true, agency: true } } },
        take: options.limit,
        orderBy: { id: 'desc' },
      });

      console.log(
        `[NesdcPdfDownload] ${candidates.length} attachments pending across ${options.agencies.length} agencies`,
      );

      let processed = 0;
      const byPoll = new Map<number, string>();
      for (const c of candidates) {
        byPoll.set(c.pollId, c.poll.nttId);
      }

      for (const [pollId, nttId] of byPoll.entries()) {
        const r = await this.downloadAttachmentsForPoll(pollId, nttId, kinds);
        downloaded += r.downloaded;
        failed += r.failed;
        notYet += r.notYet;
        skipped += r.skipped;
        processed++;
        if (processed % 10 === 0) {
          console.log(
            `[NesdcPdfDownload] progress ${processed}/${byPoll.size} polls (dl=${downloaded} failed=${failed} notYet=${notYet})`,
          );
        }
      }

      await this.syncLog.complete(log.id, downloaded);
      console.log(
        `[NesdcPdfDownload] done: downloaded=${downloaded} failed=${failed} notYet=${notYet} skipped=${skipped}`,
      );
      return { downloaded, failed, notYet, skipped };
    } catch (err) {
      await this.syncLog.fail(log.id, (err as Error).message);
      throw err;
    }
  }

  /** 특정 Poll의 pending 첨부 모두 다운로드해서 Supabase Storage에 미러링 */
  private async downloadAttachmentsForPoll(
    pollId: number,
    nttId: string,
    kindFilter?: ('result' | 'questionnaire' | 'other')[],
  ): Promise<{ downloaded: number; failed: number; notYet: number; skipped: number }> {
    const result = { downloaded: 0, failed: 0, notYet: 0, skipped: 0 };
    if (!this.supabase) return result;

    const where: {
      pollId: number;
      status: { in: string[] };
      kind?: { in: string[] };
    } = {
      pollId,
      status: { in: ['pending', 'not_yet_public', 'failed'] },
    };
    if (kindFilter && kindFilter.length > 0) {
      where.kind = { in: kindFilter };
    }

    const pending = await this.prisma.pollAttachment.findMany({ where });
    if (pending.length === 0) {
      result.skipped++;
      return result;
    }

    for (const att of pending) {
      try {
        const resp = await fetch(att.downloadUrl, {
          headers: HTTP_HEADERS,
          redirect: 'follow',
        });
        if (!resp.ok) {
          const text = await resp.text();
          const isNotYet = /공개|24시간|48시간/.test(text);
          await this.prisma.pollAttachment.update({
            where: { id: att.id },
            data: {
              status: isNotYet ? 'not_yet_public' : 'failed',
              errorMessage: `HTTP ${resp.status}`,
            },
          });
          if (isNotYet) result.notYet++;
          else result.failed++;
          continue;
        }

        const buf = Buffer.from(await resp.arrayBuffer());
        if (buf.length < 4 || buf.subarray(0, 4).toString() !== '%PDF') {
          const head = buf.subarray(0, 200).toString('utf-8', 0, Math.min(200, buf.length));
          const isNotYet = /공개|24시간|48시간|아직/.test(head);
          await this.prisma.pollAttachment.update({
            where: { id: att.id },
            data: {
              status: isNotYet ? 'not_yet_public' : 'failed',
              errorMessage: 'not a PDF',
            },
          });
          if (isNotYet) result.notYet++;
          else result.failed++;
          continue;
        }

        const sha = createHash('sha256').update(buf).digest('hex');
        // Supabase Storage 키는 ASCII 영숫자/-/_/.만 안전하게 동작.
        // fileSn은 base64(=등 포함), fileName은 한글 포함 → 안전한 키는 PollAttachment.id + sha 단축본
        const safeFileSn = att.fileSn.replace(/[^A-Za-z0-9]+/g, '');
        const ext = (att.fileName.match(/\.[A-Za-z0-9]+$/)?.[0] ?? '.pdf').toLowerCase();
        const storagePath = `${nttId}/${att.id}_${safeFileSn}${ext}`;

        const { error: upErr } = await this.supabase.storage
          .from(STORAGE_BUCKET)
          .upload(storagePath, buf, {
            contentType: 'application/pdf',
            upsert: true,
          });
        if (upErr) throw upErr;

        const { data: pub } = this.supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);

        await this.prisma.pollAttachment.update({
          where: { id: att.id },
          data: {
            status: 'downloaded',
            storagePath,
            storageUrl: pub.publicUrl,
            sha256: sha,
            byteSize: buf.length,
            downloadedAt: new Date(),
            errorMessage: null,
          },
        });
        result.downloaded++;
      } catch (e) {
        await this.prisma.pollAttachment.update({
          where: { id: att.id },
          data: { status: 'failed', errorMessage: (e as Error).message },
        });
        result.failed++;
      }
      await this.sleep(REQUEST_DELAY_MS);
    }

    return result;
  }

  // -------- HTML 파싱 --------

  private parseList(html: string): PollListItem[] {
    const $ = cheerio.load(html);
    const items: PollListItem[] = [];

    $('a[href*="B0000005/view.do"]').each((_, el) => {
      const href = $(el).attr('href') ?? '';
      const m = href.match(/nttId=(\d+)/);
      if (!m) return;
      const nttId = m[1];

      // 각 셀은 <span> 또는 <div>로 감싸여 있음 — 순서대로 추출
      const cells = $(el)
        .find('span, div')
        .map((__, c) => $(c).text().replace(/\s+/g, ' ').trim())
        .get()
        .filter((t) => t.length > 0);

      if (cells.length < 7) return;

      items.push({
        nttId,
        registrationNo: cells[0] ?? '',
        agency: cells[1] ?? '',
        client: cells[2] ?? '',
        surveyMethod: cells[3] ?? '',
        // cells[4]: 표본추출틀 (공백분리됨)
        pollNamePreview: cells[5] ?? '',
        registeredAt: cells[6] ?? '',
        sido: cells[7] ?? '',
      });
    });

    return items;
  }

  private parseDetail(html: string): ParsedPollDetail {
    const $ = cheerio.load(html);

    const cellByLabel = (label: string): string => {
      let value = '';
      $('th, td').each((_, el) => {
        const text = $(el).text().replace(/\s+/g, ' ').trim();
        if (text === label) {
          const sibling = $(el).next('td');
          if (sibling.length > 0) {
            value = sibling.text().replace(/\s+/g, ' ').trim();
            return false;
          }
        }
      });
      return value;
    };

    const region = cellByLabel('지역');
    const [sidoRaw, ...rest] = region.split(/\s+/);
    const sido = sidoRaw ?? '';
    const sigungu = rest.join(' ');

    const surveyTime = cellByLabel('조사일시');
    const { start, end } = parseSurveyTime(surveyTime);

    const contactStr = cellByLabel('접촉률 (I+R)/(I+R+eU)');
    const responseStr = cellByLabel('응답률 (I/(I+R))');
    const errorStr = cellByLabel('표본오차');

    // 표본 크기: "전체" 행
    let sampleSize: number | null = null;
    let weightedSampleSize: number | null = null;
    $('th, td').each((_, el) => {
      if ($(el).text().trim() === '전체') {
        const row = $(el).parent('tr');
        const tds = row.find('td');
        if (tds.length >= 2) {
          sampleSize = parseIntSafe(tds.eq(0).text());
          weightedSampleSize = parseIntSafe(tds.eq(1).text());
          return false;
        }
      }
    });

    // 첨부파일 추출
    const attachments: ParsedAttachment[] = [];
    $('a[onclick*="view("]').each((_, el) => {
      const onclick = $(el).attr('onclick') ?? '';
      // view('atchFileId', 'fileSn', 'B0000005', 'bbsKey')
      const m = onclick.match(
        /view\(['"]([^'"]+)['"],\s*['"]([^'"]+)['"],\s*['"][^'"]+['"],\s*['"]([^'"]+)['"]\)/,
      );
      if (!m) return;
      const fileName = $(el).text().trim();
      const kind: ParsedAttachment['kind'] = /설문지|질문지/.test(fileName)
        ? 'questionnaire'
        : /결과|분석|집계표|결과표/.test(fileName)
          ? 'result'
          : 'other';
      attachments.push({
        kind,
        fileName,
        atchFileId: m[1],
        fileSn: m[2],
        bbsKey: m[3],
      });
    });

    const contactRate = parsePercent(contactStr);
    const responseRate = parsePercent(responseStr);
    const aaporResponseRate =
      contactRate != null && responseRate != null
        ? Math.round(((contactRate * responseRate) / 100) * 100) / 100
        : null;

    return {
      registrationNo: cellByLabel('등록 글번호'),
      electionCategory: cellByLabel('선거구분'),
      pollName: cellByLabel('선거명') || cellByLabel('여론조사 명칭'),
      agency: cellByLabel('조사기관명'),
      client: cellByLabel('조사의뢰자'),
      sido,
      sigungu,
      surveyStartedAt: start,
      surveyEndedAt: end,
      surveyDays: parseIntSafe(cellByLabel('조사일수').replace(/[^\d]/g, '')),
      surveyMinutes: parseDurationMinutes(cellByLabel('조사시간')),
      sampleSize,
      weightedSampleSize,
      surveyMethod: cellByLabel('조사방법 1') || null,
      samplingFrame: cellByLabel('추출틀') || null,
      contactRate,
      responseRate,
      aaporResponseRate,
      marginOfError: parseMarginOfError(errorStr),
      confidenceLevel: parseConfidenceLevel(errorStr),
      weightingMethod: cellByLabel('적용방법') || null,
      weightingTarget: cellByLabel('산출방법') || null,
      publishMedia: cellByLabel('공표·보도 매체') || null,
      publishMediaName: cellByLabel('공표·보도 매체명') || null,
      publishedAt: parseKoreanDateTime(cellByLabel('최초 공표·보도 지정일시')),
      attachments,
    };
  }

  // -------- 유틸 --------

  private async fetchHtml(url: string): Promise<string> {
    const resp = await fetch(url, { headers: HTTP_HEADERS, redirect: 'follow' });
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status} for ${url}`);
    }
    return resp.text();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// -------- module-level pure helpers --------

function parseIntSafe(s: string | null | undefined): number | null {
  if (!s) return null;
  const cleaned = s.replace(/[,\s]/g, '');
  if (!/^\d+$/.test(cleaned)) return null;
  return parseInt(cleaned, 10);
}

function parsePercent(s: string | null | undefined): number | null {
  if (!s) return null;
  const m = s.match(/([\d.]+)\s*%/);
  if (!m) return null;
  return parseFloat(m[1]);
}

function parseMarginOfError(s: string): number | null {
  if (!s) return null;
  const m = s.match(/±\s*([\d.]+)\s*%/);
  return m ? parseFloat(m[1]) : null;
}

function parseConfidenceLevel(s: string): number | null {
  if (!s) return null;
  const m = s.match(/(\d{2,3})\s*%/);
  return m ? parseFloat(m[1]) : null;
}

function parseDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  const m = s.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00+09:00`);
}

/** "2026-05-25 16시 55분" → Date */
function parseKoreanDateTime(s: string | null | undefined): Date | null {
  if (!s) return null;
  const m = s.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2})\s*시\s*(\d{1,2})\s*분/);
  if (!m) return parseDate(s);
  return new Date(
    `${m[1]}-${m[2]}-${m[3]}T${m[4].padStart(2, '0')}:${m[5].padStart(2, '0')}:00+09:00`,
  );
}

/** "2026-05-18 13 시 06 분 ~ 20 시 59 분 2026-05-19 10 시 00 분 ~ 20 시 50 분" → 시작/종료 */
function parseSurveyTime(s: string): { start: Date | null; end: Date | null } {
  if (!s) return { start: null, end: null };
  const re =
    /(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2})\s*시\s*(\d{1,2})\s*분\s*~\s*(\d{1,2})\s*시\s*(\d{1,2})\s*분/g;
  const sessions: { start: Date; end: Date }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    const dateStr = `${m[1]}-${m[2]}-${m[3]}`;
    const start = new Date(`${dateStr}T${m[4].padStart(2, '0')}:${m[5].padStart(2, '0')}:00+09:00`);
    const end = new Date(`${dateStr}T${m[6].padStart(2, '0')}:${m[7].padStart(2, '0')}:00+09:00`);
    sessions.push({ start, end });
  }
  if (sessions.length === 0) return { start: null, end: null };
  return {
    start: sessions[0].start,
    end: sessions[sessions.length - 1].end,
  };
}

/** "18시간 43분" → 1123 */
function parseDurationMinutes(s: string): number | null {
  if (!s) return null;
  const hours = s.match(/(\d+)\s*시간/);
  const mins = s.match(/(\d+)\s*분/);
  const h = hours ? parseInt(hours[1], 10) : 0;
  const mm = mins ? parseInt(mins[1], 10) : 0;
  const total = h * 60 + mm;
  return total > 0 ? total : null;
}
