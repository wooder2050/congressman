import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';
import { SyncLogService } from './sync-log.service';

const DETAIL_BASE = 'https://likms.assembly.go.kr/bill/billDetail.do?billId=';
const BILL_INFO_URL = 'https://likms.assembly.go.kr/bill/bi/bill/detail/billInfo.do';
const BATCH_SIZE = 50;
const DELAY_MS = 200;

/**
 * 제안이유가 비어 있는 법안의 재크롤링 정책.
 *
 * 국회는 법안 접수 직후 제안이유를 공개하지 않고 며칠~몇 주 뒤에 올리는 경우가 있다.
 * 예전에는 크롤링 결과가 없으면 summary에 ''를 저장하면서 대상 조회는 `summary: null`만
 * 봤기 때문에, 한 번 ''이 된 법안은 국회가 나중에 원문을 올려도 영원히 다시 긁지 않았다.
 * summary가 비면 AI 요약도 만들지 않고, AI 요약이 없는 법안은 noindex라 영구 누락이었다.
 *
 * 그렇다고 빈 법안을 매일 다시 긁을 수는 없다. 22대만 해도 266건이 비어 있는데 그중 263건은
 * 결의안·동의안·기금운용계획안·위원회 대안처럼 제안이유가 원래 없는 유형이다(2026-09-16 실측).
 *
 * 그래서 두 가지로 제한한다.
 * - RETRY_AFTER_MS: 같은 법안을 최소 이 간격을 두고 다시 시도한다.
 * - RETRY_WINDOW_DAYS: 발의 후 이 기간이 지나면 포기한다. 공개 지연은 길어야 몇 주라
 *   180일이 지나도 비어 있으면 원래 없는 유형으로 본다.
 *
 * 두 조건을 합치면 대상은 46건(발의 180일 이내 빈 법안) / 7일 ≈ 하루 7건 수준이다.
 */
const RETRY_AFTER_MS = 7 * 24 * 60 * 60 * 1000;
const RETRY_WINDOW_DAYS = 180;
const FETCH_TIMEOUT_MS = 20_000;

export class BillContentSyncService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly syncLog: SyncLogService,
  ) {}

  async syncBillContent(termId: number): Promise<void> {
    const log = await this.syncLog.start('bill-content', termId);

    try {
      // summary가 비어 있는 법안만 대상 (incremental).
      // null은 한 번도 안 긁은 것, ''은 긁었지만 국회가 아직 안 올린 것 — 둘 다 재시도 대상이다.
      const emptySummary = { OR: [{ summary: null }, { summary: '' }] };
      const retryCutoff = new Date(Date.now() - RETRY_AFTER_MS);
      // proposedDate는 String('YYYY-MM-DD')이라 문자열 비교로 자른다
      const windowStart = new Date(Date.now() - RETRY_WINDOW_DAYS * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);

      const bills = await this.prisma.bill.findMany({
        where: {
          termId,
          proposedDate: { gte: windowStart },
          AND: [
            emptySummary,
            {
              OR: [{ summaryLastTriedAt: null }, { summaryLastTriedAt: { lte: retryCutoff } }],
            },
          ],
        },
        select: { id: true },
        orderBy: { proposedDate: 'desc' },
      });

      console.log(
        `[BillContentSync] Found ${bills.length} bills without content for term ${termId} ` +
          `(proposed since ${windowStart}, retried before ${retryCutoff.toISOString()})`,
      );

      let processed = 0;
      let failed = 0;

      for (let i = 0; i < bills.length; i += BATCH_SIZE) {
        const batch = bills.slice(i, i + BATCH_SIZE);

        for (const bill of batch) {
          try {
            const content = await this.fetchBillContent(bill.id);

            // 조건부 쓰기 — 다른 실행이 이미 채운 summary를 빈 값으로 덮지 않는다
            await this.prisma.bill.updateMany({
              where: { id: bill.id, ...emptySummary },
              data: {
                summary: content.summary?.trim() || '',
                // 이번 응답에 PDF가 없다고 기존 bookId를 지우지 않는다
                ...(content.pdfBookId ? { pdfBookId: content.pdfBookId } : {}),
                detailLink: `${DETAIL_BASE}${bill.id}`,
                summaryLastTriedAt: new Date(),
              },
            });

            processed++;
          } catch (error) {
            failed++;
            const msg = error instanceof Error ? error.message : String(error);
            console.error(`[BillContentSync] Failed for ${bill.id}: ${msg}`);
          }

          await this.delay(DELAY_MS);
        }

        console.log(
          `[BillContentSync]   Progress: ${Math.min(i + BATCH_SIZE, bills.length)}/${bills.length} (${failed} failed)`,
        );
      }

      await this.syncLog.complete(log.id, processed);
      console.log(
        `[BillContentSync] Completed: ${processed} processed, ${failed} failed out of ${bills.length}`,
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      await this.syncLog.fail(log.id, msg);
      console.error(`[BillContentSync] Failed: ${msg}`);
      throw error;
    }
  }

  private async fetchBillContent(
    billId: string,
  ): Promise<{ summary: string | null; pdfBookId: string | null }> {
    // billDetail.do는 SPA shell만 반환
    // billInfo.do POST에 tmprAnYn, stageMemo 파라미터가 있어야 summary 포함 응답
    const params = new URLSearchParams({
      billId,
      tmprAnYn: 'N',
      stageMemo: 'N',
    });

    const res = await fetch(BILL_INFO_URL, {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CongressInfo/1.0)',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
      // 국회 서버가 응답을 붙들면 daily sync 전체가 멈춘다(2026-09-12 주간싱크 15분 행 사례)
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} for ${billId}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // <pre id="prntSummary">에서 제안이유 및 주요내용 추출
    let summary: string | null = null;
    const prntSummary = $('#prntSummary');
    if (prntSummary.length) {
      const text = prntSummary.text().trim();
      // 앞에 붙는 "제안이유 및 주요내용" 헤딩 텍스트 제거
      summary = text.replace(/^제안이유\s*(및\s*)?주요내용\s*/, '').trim();
    }

    // 의안원문 PDF bookId 추출 (첫 번째 FileGate type=1 PDF 링크)
    let pdfBookId: string | null = null;
    $('a[href*="FileGate"]').each((_, el) => {
      const href = $(el).attr('href') ?? '';
      if (href.includes('type=1') && !pdfBookId) {
        const match = href.match(/bookId=([^&]+)/);
        if (match) {
          pdfBookId = match[1];
        }
      }
    });

    // onclick의 goDownload 함수에서도 bookId 추출 시도
    if (!pdfBookId) {
      $('a[onclick*="goDownload"]').each((_, el) => {
        const onclick = $(el).attr('onclick') ?? '';
        const match = onclick.match(/bookId=([^&')"]+)/);
        if (match && !pdfBookId) {
          pdfBookId = match[1];
        }
      });
    }

    return { summary, pdfBookId };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
