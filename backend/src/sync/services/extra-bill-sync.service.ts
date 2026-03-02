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
  // 심사 경과 필드 (API 응답에 있으면 수집, 없으면 null)
  COMMITTEE_DT: string | null;
  CMT_PRESENT_DT: string | null;
  CMT_PROC_DT: string | null;
  LAW_SUBMIT_DT: string | null;
  LAW_PRESENT_DT: string | null;
  LAW_PROC_RESULT_CD: string | null;
  LAW_PROC_DT: string | null;
  PROC_DT: string | null;
}

const BATCH_SIZE = 500;
const UPDATE_BATCH_SIZE = 50;

/**
 * 정부 발의 + 위원장 대안 법안을 TVBPMBILL11 API에서 가져와 Bill 테이블에 추가/갱신.
 * - 신규 법안: create (skipDuplicates)
 * - 기존 법안: 변경된 기본정보 + 심사 경과 필드 update (summary/pdfBookId 보존)
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

      await this.batchUpsertBills(allRows, termId);

      await this.syncLog.complete(log.id, allRows.length);
      console.log(`[ExtraBillSync] Completed: ${allRows.length} records`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      await this.syncLog.fail(log.id, msg);
      console.error(`[ExtraBillSync] Failed: ${msg}`);
      throw error;
    }
  }

  private async batchUpsertBills(rows: ExtraBillApiRow[], termId: number): Promise<void> {
    console.log(`[ExtraBillSync] Upserting ${rows.length} extra bills...`);

    // 기존 법안 조회 (변경 감지용)
    const existingBills = await this.prisma.bill.findMany({
      where: { termId },
      select: {
        id: true,
        status: true,
        committee: true,
        committeeDate: true,
        committeePresentDate: true,
        committeeResultCode: true,
        committeeResultDate: true,
        lawSubmitDate: true,
        lawPresentDate: true,
        lawResultCode: true,
        lawResultDate: true,
        plenaryDate: true,
      },
    });
    const existingMap = new Map(existingBills.map((b) => [b.id, b]));
    const existingIds = new Set(existingBills.map((b) => b.id));

    const newRows: ExtraBillApiRow[] = [];
    const updateRows: ExtraBillApiRow[] = [];

    for (const row of rows) {
      if (!existingIds.has(row.BILL_ID)) {
        newRows.push(row);
      } else {
        const existing = existingMap.get(row.BILL_ID)!;
        const progress = this.mapProgressFields(row);
        const newStatus = this.mapStatus(
          row.PROC_RESULT_CD,
          row.CMT_PROC_RESULT_CD,
          row.PASS_GUBUN,
        );
        if (
          existing.status !== newStatus ||
          existing.committee !== (row.CURR_COMMITTEE || null) ||
          existing.committeeDate !== progress.committeeDate ||
          existing.committeePresentDate !== progress.committeePresentDate ||
          existing.committeeResultCode !== progress.committeeResultCode ||
          existing.committeeResultDate !== progress.committeeResultDate ||
          existing.lawSubmitDate !== progress.lawSubmitDate ||
          existing.lawPresentDate !== progress.lawPresentDate ||
          existing.lawResultCode !== progress.lawResultCode ||
          existing.lawResultDate !== progress.lawResultDate ||
          existing.plenaryDate !== progress.plenaryDate
        ) {
          updateRows.push(row);
        }
      }
    }

    console.log(
      `[ExtraBillSync]   New: ${newRows.length}, Changed: ${updateRows.length}, Unchanged: ${rows.length - newRows.length - updateRows.length}`,
    );

    // 신규 법안 추가
    if (newRows.length > 0) {
      for (let i = 0; i < newRows.length; i += BATCH_SIZE) {
        const batch = newRows.slice(i, i + BATCH_SIZE);
        await this.prisma.bill.createMany({
          data: batch.map((row) => ({
            id: row.BILL_ID,
            title: row.BILL_NAME,
            proposerName: row.PROPOSER ?? '',
            coProposerCount: 0,
            status: this.mapStatus(row.PROC_RESULT_CD, row.CMT_PROC_RESULT_CD, row.PASS_GUBUN),
            proposedDate: row.PROPOSE_DT ?? '',
            termId,
            committee: row.CURR_COMMITTEE || null,
            ...this.mapProgressFields(row),
          })),
          skipDuplicates: true,
        });
      }
    }

    // 변경된 기존 법안 업데이트 (summary/pdfBookId 보존)
    if (updateRows.length > 0) {
      for (let i = 0; i < updateRows.length; i += UPDATE_BATCH_SIZE) {
        const batch = updateRows.slice(i, i + UPDATE_BATCH_SIZE);
        for (const row of batch) {
          await this.prisma.bill.update({
            where: { id: row.BILL_ID },
            data: {
              status: this.mapStatus(row.PROC_RESULT_CD, row.CMT_PROC_RESULT_CD, row.PASS_GUBUN),
              committee: row.CURR_COMMITTEE || null,
              ...this.mapProgressFields(row),
            },
          });
        }
      }
    }
  }

  /** API row → 심사 경과 필드 매핑 */
  private mapProgressFields(row: ExtraBillApiRow) {
    return {
      committeeDate: row.COMMITTEE_DT ? this.normalizeDate(row.COMMITTEE_DT) : null,
      committeePresentDate: row.CMT_PRESENT_DT ? this.normalizeDate(row.CMT_PRESENT_DT) : null,
      committeeResultCode: row.CMT_PROC_RESULT_CD || null,
      committeeResultDate: row.CMT_PROC_DT ? this.normalizeDate(row.CMT_PROC_DT) : null,
      lawSubmitDate: row.LAW_SUBMIT_DT ? this.normalizeDate(row.LAW_SUBMIT_DT) : null,
      lawPresentDate: row.LAW_PRESENT_DT ? this.normalizeDate(row.LAW_PRESENT_DT) : null,
      lawResultCode: row.LAW_PROC_RESULT_CD || null,
      lawResultDate: row.LAW_PROC_DT ? this.normalizeDate(row.LAW_PROC_DT) : null,
      plenaryDate: row.PROC_DT ? this.normalizeDate(row.PROC_DT) : null,
    };
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

  private normalizeDate(raw: string): string {
    if (!raw) return '';
    const cleaned = raw.replace(/[^0-9]/g, '');
    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`;
    }
    return raw;
  }
}
