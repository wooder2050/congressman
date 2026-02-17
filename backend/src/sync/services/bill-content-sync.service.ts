import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';
import { SyncLogService } from './sync-log.service';

const DETAIL_BASE = 'https://likms.assembly.go.kr/bill/billDetail.do?billId=';
const BILL_INFO_URL = 'https://likms.assembly.go.kr/bill/bi/bill/detail/billInfo.do';
const BATCH_SIZE = 50;
const DELAY_MS = 200;

export class BillContentSyncService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly syncLog: SyncLogService,
  ) {}

  async syncBillContent(termId: number): Promise<void> {
    const log = await this.syncLog.start('bill-content', termId);

    try {
      // summary가 없는 법안만 대상 (incremental)
      const bills = await this.prisma.bill.findMany({
        where: { termId, summary: null },
        select: { id: true },
        orderBy: { proposedDate: 'desc' },
      });

      console.log(
        `[BillContentSync] Found ${bills.length} bills without content for term ${termId}`,
      );

      let processed = 0;
      let failed = 0;

      for (let i = 0; i < bills.length; i += BATCH_SIZE) {
        const batch = bills.slice(i, i + BATCH_SIZE);

        for (const bill of batch) {
          try {
            const content = await this.fetchBillContent(bill.id);

            await this.prisma.bill.update({
              where: { id: bill.id },
              data: {
                summary: content.summary || '',
                pdfBookId: content.pdfBookId,
                detailLink: `${DETAIL_BASE}${bill.id}`,
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
