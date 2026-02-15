import { PrismaClient } from '@prisma/client';
import { AssemblyApiService } from './assembly-api.service';
import { SyncLogService } from './sync-log.service';

/** 본회의 표결 API 응답 row */
interface VoteApiRow {
  BILL_ID: string;
  PROC_DT: string;
  BILL_NO: string;
  BILL_NAME: string;
  CURR_COMMITTEE: string;
  PROC_RESULT_CD: string;
  BILL_KIND_CD: string;
  AGE: string;
  MEMBER_TCNT: string;
  VOTE_TCNT: string;
  YES_TCNT: string;
  NO_TCNT: string;
  BLANK_TCNT: string;
  LINK_URL: string;
}

const BATCH_SIZE = 500;

export class VoteSyncService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly api: AssemblyApiService,
    private readonly syncLog: SyncLogService,
  ) {}

  async syncVotes(termId: number): Promise<void> {
    const log = await this.syncLog.start('votes', termId);

    try {
      const rows = await this.api.fetchAll<VoteApiRow>('ncocpgfiaoituanbr', {
        AGE: String(termId),
      });

      console.log(`[VoteSync] Fetched ${rows.length} vote records for term ${termId}`);

      await this.batchUpsertVotes(rows, termId);

      await this.syncLog.complete(log.id, rows.length);
      console.log(`[VoteSync] Completed: ${rows.length} records`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      await this.syncLog.fail(log.id, msg);
      console.error(`[VoteSync] Failed: ${msg}`);
      throw error;
    }
  }

  private async batchUpsertVotes(rows: VoteApiRow[], termId: number): Promise<void> {
    console.log(`[VoteSync] Deleting existing votes for term ${termId}...`);
    await this.prisma.vote.deleteMany({ where: { termId } });

    console.log(`[VoteSync] Inserting ${rows.length} votes in batches of ${BATCH_SIZE}...`);
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const data = batch.map((row) => ({
        id: row.BILL_ID,
        billNo: row.BILL_NO ?? '',
        billName: row.BILL_NAME,
        committee: row.CURR_COMMITTEE || null,
        procDate: this.normalizeDate(row.PROC_DT),
        procResult: row.PROC_RESULT_CD ?? '',
        resultCode: this.mapResultCode(row.PROC_RESULT_CD),
        billKind: row.BILL_KIND_CD ?? '',
        memberTotal: parseInt(row.MEMBER_TCNT, 10) || 0,
        voteTotal: parseInt(row.VOTE_TCNT, 10) || 0,
        yesCount: parseInt(row.YES_TCNT, 10) || 0,
        noCount: parseInt(row.NO_TCNT, 10) || 0,
        abstainCount: parseInt(row.BLANK_TCNT, 10) || 0,
        linkUrl: row.LINK_URL ?? '',
        termId,
      }));

      await this.prisma.vote.createMany({ data, skipDuplicates: true });
      console.log(`[VoteSync]   Votes: ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length}`);
    }
  }

  private mapResultCode(procResult: string | null): string {
    if (!procResult) return 'other';
    const result = procResult.trim();
    if (result.includes('원안가결')) return 'passed';
    if (result.includes('수정가결')) return 'amended';
    if (result.includes('부결')) return 'rejected';
    if (result.includes('폐기')) return 'discarded';
    return 'other';
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
