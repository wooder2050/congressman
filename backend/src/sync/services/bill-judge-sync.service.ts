import { PrismaClient } from '@prisma/client';
import { AssemblyApiService } from './assembly-api.service';
import { SyncLogService } from './sync-log.service';

/** BILLJUDGE (법안 심사 경과) API 응답 row */
interface BillJudgeApiRow {
  BILL_ID: string;
  BILL_NO: string;
  BILL_NM: string;
  PPSR_KIND: string | null; // 발의자 유형 (의원/정부/위원장)
  PPSL_DT: string | null; // 발의일
  JRCMIT_NM: string | null; // 소관위원회
  BDG_CMMT_DT: string | null; // 위원회 회부일
  JRCMIT_PRSNT_DT: string | null; // 위원회 상정일
  JRCMIT_PROC_RSLT: string | null; // 위원회 처리결과
  JRCMIT_PROC_DT: string | null; // 위원회 처리일
  LINK_URL: string | null;
  [key: string]: string | null; // API 필드 추가 대비
}

const UPDATE_BATCH_SIZE = 50;

/**
 * BILLJUDGE API로 심사 경과가 없는 법안을 보완.
 * - DB에서 심사 경과 필드가 null인 법안 조회
 * - BILLJUDGE API 전체 수집 후 매칭하여 update
 * - 기존 summary, pdfBookId 등은 보존
 */
export class BillJudgeSyncService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly api: AssemblyApiService,
    private readonly syncLog: SyncLogService,
  ) {}

  async syncBillJudge(termId: number): Promise<void> {
    const log = await this.syncLog.start('bill-judge', termId);

    try {
      // 1. 심사 경과 없는 법안 ID 목록
      const billsWithoutProgress = await this.prisma.bill.findMany({
        where: {
          termId,
          committeeDate: null,
          committeePresentDate: null,
          committeeResultCode: null,
        },
        select: { id: true },
      });
      const targetIds = new Set(billsWithoutProgress.map((b) => b.id));
      console.log(
        `[BillJudgeSync] ${targetIds.size} bills without progress data for term ${termId}`,
      );

      if (targetIds.size === 0) {
        await this.syncLog.complete(log.id, 0);
        console.log(`[BillJudgeSync] No bills to update, skipping`);
        return;
      }

      // 2. BILLJUDGE API 전체 수집
      const rows = await this.api.fetchAll<BillJudgeApiRow>('BILLJUDGE', {
        AGE: String(termId),
      });
      console.log(`[BillJudgeSync] Fetched ${rows.length} judge records`);

      // 3. 타겟 법안만 필터 + 실제 데이터 있는 것만
      const matchedRows = rows.filter(
        (row) =>
          targetIds.has(row.BILL_ID) &&
          (row.BDG_CMMT_DT || row.JRCMIT_PRSNT_DT || row.JRCMIT_PROC_RSLT),
      );
      console.log(`[BillJudgeSync] ${matchedRows.length} matched rows with progress data`);

      // 4. 배치 업데이트
      let updated = 0;
      for (let i = 0; i < matchedRows.length; i += UPDATE_BATCH_SIZE) {
        const batch = matchedRows.slice(i, i + UPDATE_BATCH_SIZE);
        for (const row of batch) {
          await this.prisma.bill.update({
            where: { id: row.BILL_ID },
            data: this.mapProgressFields(row),
          });
          updated++;
        }
        if ((i + UPDATE_BATCH_SIZE) % 500 < UPDATE_BATCH_SIZE) {
          console.log(
            `[BillJudgeSync]   Updated: ${Math.min(i + UPDATE_BATCH_SIZE, matchedRows.length)}/${matchedRows.length}`,
          );
        }
      }

      await this.syncLog.complete(log.id, updated);
      console.log(`[BillJudgeSync] Completed: ${updated} bills updated with progress data`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      await this.syncLog.fail(log.id, msg);
      console.error(`[BillJudgeSync] Failed: ${msg}`);
      throw error;
    }
  }

  /** API row → 심사 경과 필드 매핑 (BILLJUDGE는 소관위 단계만 제공) */
  private mapProgressFields(row: BillJudgeApiRow) {
    return {
      committeeDate: row.BDG_CMMT_DT ? this.normalizeDate(row.BDG_CMMT_DT) : null,
      committeePresentDate: row.JRCMIT_PRSNT_DT ? this.normalizeDate(row.JRCMIT_PRSNT_DT) : null,
      committeeResultCode: row.JRCMIT_PROC_RSLT || null,
      committeeResultDate: row.JRCMIT_PROC_DT ? this.normalizeDate(row.JRCMIT_PROC_DT) : null,
    };
  }

  private normalizeDate(raw: string): string {
    if (!raw) return '';
    const cleaned = raw.replace(/[^0-9]/g, '');
    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`;
    }
    return raw;
  }
}
