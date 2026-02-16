import { PrismaClient } from '@prisma/client';
import { AssemblyApiService } from './assembly-api.service';
import { SyncLogService } from './sync-log.service';

/** TVBPMBILL11 (의안검색) API 응답 row */
interface ExtraBillApiRow {
  BILL_ID: string;
  BILL_NO: string;
  BILL_NAME: string;
  PROPOSER: string;
  PROPOSER_KIND: string;
  PROPOSE_DT: string;
  CURR_COMMITTEE: string;
  LINK_URL: string;
  CMT_PROC_RESULT_CD: string | null;
  PROC_RESULT_CD: string | null;
  PASS_GUBUN: string | null;
  AGE: string;
}

const BATCH_SIZE = 500;

/**
 * 정부 발의 + 위원장 대안 법안을 TVBPMBILL11 API에서 가져와 Bill 테이블에 추가.
 * 기존 의원 발의 법안(BillSyncService)과 겹치지 않도록 skipDuplicates 사용.
 */
export class ExtraBillSyncService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly api: AssemblyApiService,
    private readonly syncLog: SyncLogService,
  ) {}

  async syncExtraBills(termId: number): Promise<void> {
    const log = await this.syncLog.start('extra-bills', termId);

    try {
      // 정부 발의 + 위원장 대안 법안을 각각 가져오기
      const [govRows, chairRows] = await Promise.all([
        this.api.fetchAll<ExtraBillApiRow>('TVBPMBILL11', {
          AGE: String(termId),
          PROPOSER_KIND: '정부',
        }),
        this.api.fetchAll<ExtraBillApiRow>('TVBPMBILL11', {
          AGE: String(termId),
          PROPOSER_KIND: '위원장',
        }),
      ]);

      const allRows = [...govRows, ...chairRows];
      console.log(
        `[ExtraBillSync] Fetched ${govRows.length} gov + ${chairRows.length} chair = ${allRows.length} extra bills for term ${termId}`,
      );

      await this.batchInsertBills(allRows, termId);

      await this.syncLog.complete(log.id, allRows.length);
      console.log(`[ExtraBillSync] Completed: ${allRows.length} records`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      await this.syncLog.fail(log.id, msg);
      console.error(`[ExtraBillSync] Failed: ${msg}`);
      throw error;
    }
  }

  private async batchInsertBills(rows: ExtraBillApiRow[], termId: number): Promise<void> {
    console.log(`[ExtraBillSync] Inserting ${rows.length} extra bills (skipDuplicates)...`);

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const data = batch.map((row) => ({
        id: row.BILL_ID,
        title: row.BILL_NAME,
        proposerName: row.PROPOSER ?? '',
        coProposerCount: 0,
        status: this.mapStatus(row.PROC_RESULT_CD, row.CMT_PROC_RESULT_CD, row.PASS_GUBUN),
        proposedDate: row.PROPOSE_DT ?? '',
        termId,
        committee: row.CURR_COMMITTEE || null,
      }));

      await this.prisma.bill.createMany({ data, skipDuplicates: true });
      console.log(
        `[ExtraBillSync]   Bills: ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length}`,
      );
    }
  }

  private mapStatus(
    procResult: string | null,
    cmtResult: string | null,
    passGubun: string | null,
  ): string {
    // 본회의 처리결과 우선
    if (procResult) {
      const r = procResult.trim();
      if (r.includes('가결') || r.includes('공포')) return 'passed';
      if (r.includes('폐기') || r.includes('철회') || r.includes('부결')) return 'discarded';
    }
    // 위원회 처리결과
    if (cmtResult) {
      const r = cmtResult.trim();
      if (r.includes('가결')) return 'committee';
      if (r.includes('폐기') || r.includes('부결')) return 'discarded';
    }
    // 계류 여부
    if (passGubun?.includes('계류')) return 'pending';
    return 'pending';
  }
}
