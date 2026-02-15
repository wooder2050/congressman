import { PrismaClient } from '@prisma/client';
import { AssemblyApiService } from './assembly-api.service';
import { SyncLogService } from './sync-log.service';

/** 의원 발의 법안 API 응답 row */
interface BillApiRow {
  BILL_ID: string;
  BILL_NO: string;
  BILL_NAME: string;
  PROPOSER: string;
  RST_PROPOSER: string;
  PUBL_PROPOSER: string;
  PROPOSE_DT: string;
  COMMITTEE: string;
  PROC_RESULT: string;
  DETAIL_LINK: string;
  AGE: string;
}

const BATCH_SIZE = 500;

export class BillSyncService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly api: AssemblyApiService,
    private readonly syncLog: SyncLogService,
  ) {}

  async syncBills(termId: number): Promise<void> {
    const log = await this.syncLog.start('bills', termId);

    try {
      const rows = await this.api.fetchAll<BillApiRow>('nzmimeepazxkubdpn', {
        AGE: String(termId),
      });

      console.log(`[BillSync] Fetched ${rows.length} bill records for term ${termId}`);

      // Phase 1: Batch insert bills (fast)
      await this.batchUpsertBills(rows, termId);

      // Phase 2: Link proposers (optional, slower)
      await this.batchLinkProposers(rows, termId);

      await this.syncLog.complete(log.id, rows.length);
      console.log(`[BillSync] Completed: ${rows.length} records`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      await this.syncLog.fail(log.id, msg);
      console.error(`[BillSync] Failed: ${msg}`);
      throw error;
    }
  }

  private async batchUpsertBills(rows: BillApiRow[], termId: number): Promise<void> {
    // Delete existing bills for this term and re-insert in bulk
    // This is much faster than 15,000 individual upserts over network
    console.log(`[BillSync] Deleting existing BillProposers and Bills for term ${termId}...`);
    await this.prisma.billProposer.deleteMany({
      where: { bill: { termId } },
    });
    await this.prisma.bill.deleteMany({ where: { termId } });

    console.log(`[BillSync] Inserting ${rows.length} bills in batches of ${BATCH_SIZE}...`);
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const data = batch.map((row) => ({
        id: row.BILL_ID,
        title: row.BILL_NAME,
        proposerName: row.RST_PROPOSER ?? this.extractProposerName(row.PROPOSER),
        coProposerCount: this.extractCoProposerCount(row.PROPOSER),
        status: this.mapStatus(row.PROC_RESULT),
        proposedDate: this.normalizeDate(row.PROPOSE_DT),
        termId,
        committee: row.COMMITTEE || null,
      }));

      await this.prisma.bill.createMany({ data, skipDuplicates: true });
      console.log(`[BillSync]   Bills: ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length}`);
    }
  }

  private async batchLinkProposers(rows: BillApiRow[], termId: number): Promise<void> {
    const memberMap = await this.buildMemberNameMap(termId);
    console.log(`[BillSync] Linking proposers (${memberMap.size} members in lookup)...`);

    const allProposers: { billId: string; memberId: string }[] = [];

    for (const row of rows) {
      if (!row.PUBL_PROPOSER) continue;
      const names = row.PUBL_PROPOSER.split(',')
        .map((n) => n.trim())
        .filter(Boolean);

      for (const name of names) {
        const memberId = memberMap.get(name);
        if (memberId) {
          allProposers.push({ billId: row.BILL_ID, memberId });
        }
      }
    }

    console.log(`[BillSync] Inserting ${allProposers.length} proposer links in batches...`);
    for (let i = 0; i < allProposers.length; i += BATCH_SIZE) {
      const batch = allProposers.slice(i, i + BATCH_SIZE);
      await this.prisma.billProposer.createMany({ data: batch, skipDuplicates: true });
      if ((i + BATCH_SIZE) % 5000 < BATCH_SIZE) {
        console.log(
          `[BillSync]   Proposers: ${Math.min(i + BATCH_SIZE, allProposers.length)}/${allProposers.length}`,
        );
      }
    }
  }

  private async buildMemberNameMap(termId: number): Promise<Map<string, string>> {
    const memberTerms = await this.prisma.memberTerm.findMany({
      where: { termId },
      include: { member: true },
    });

    const map = new Map<string, string>();
    for (const mt of memberTerms) {
      map.set(mt.member.name, mt.member.id);
    }
    return map;
  }

  /** "김민수의원 등 12인" → "김민수" */
  private extractProposerName(proposer: string): string {
    if (!proposer) return '';
    const match = proposer.match(/^(.+?)(?:의원|議員)?\s*등/);
    return match ? match[1].trim() : proposer.trim();
  }

  /** "김민수의원 등 12인" → 12 */
  private extractCoProposerCount(proposer: string): number {
    if (!proposer) return 0;
    const match = proposer.match(/(\d+)\s*인/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /** 한글 처리 결과 → status 매핑 */
  private mapStatus(procResult: string | null): string {
    if (!procResult) return 'pending';
    const result = procResult.trim();

    if (result.includes('가결') || result.includes('공포')) return 'passed';
    if (result.includes('폐기') || result.includes('철회') || result.includes('부결'))
      return 'discarded';
    if (result.includes('회부') || result.includes('심사')) return 'committee';
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
