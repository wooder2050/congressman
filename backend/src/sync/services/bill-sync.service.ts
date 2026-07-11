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
  // 심사 경과 필드
  COMMITTEE_DT: string | null;
  CMT_PRESENT_DT: string | null;
  CMT_PROC_RESULT_CD: string | null;
  CMT_PROC_DT: string | null;
  LAW_SUBMIT_DT: string | null;
  LAW_PRESENT_DT: string | null;
  LAW_PROC_RESULT_CD: string | null;
  LAW_PROC_DT: string | null;
  PROC_DT: string | null;
}

const BATCH_SIZE = 500;
const UPDATE_BATCH_SIZE = 50;

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

  /**
   * 법안 기본정보만 안전하게 싱크 (summary, BillProposer 보존)
   * - 신규 법안: create + proposer 연결
   * - 기존 법안: 변경된 기본정보만 update
   * - 삭제: 없음
   */
  async syncBillsSafe(termId: number): Promise<void> {
    const log = await this.syncLog.start('bills-safe', termId);

    try {
      const rows = await this.api.fetchAll<BillApiRow>('nzmimeepazxkubdpn', {
        AGE: String(termId),
      });

      console.log(`[BillSync:Safe] Fetched ${rows.length} bill records for term ${termId}`);

      // 기존 법안 데이터 조회
      const existingBills = await this.prisma.bill.findMany({
        where: { termId },
        select: {
          id: true,
          title: true,
          proposerName: true,
          coProposerCount: true,
          status: true,
          proposedDate: true,
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

      const newRows: BillApiRow[] = [];
      const updateRows: BillApiRow[] = [];

      for (const row of rows) {
        if (!existingIds.has(row.BILL_ID)) {
          newRows.push(row);
        } else {
          const existing = existingMap.get(row.BILL_ID)!;
          const progress = this.mapProgressFields(row);
          if (
            existing.title !== row.BILL_NAME ||
            existing.proposerName !==
              (row.RST_PROPOSER ?? this.extractProposerName(row.PROPOSER)) ||
            existing.coProposerCount !== this.extractCoProposerCount(row.PROPOSER) ||
            existing.status !== this.mapStatus(row.PROC_RESULT) ||
            existing.proposedDate !== this.normalizeDate(row.PROPOSE_DT) ||
            existing.committee !== (row.COMMITTEE || null) ||
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
        `[BillSync:Safe] New: ${newRows.length}, Changed: ${updateRows.length}, Unchanged: ${existingBills.length - updateRows.length}`,
      );

      // 신규 법안 추가
      if (newRows.length > 0) {
        for (let i = 0; i < newRows.length; i += BATCH_SIZE) {
          const batch = newRows.slice(i, i + BATCH_SIZE);
          await this.prisma.bill.createMany({
            data: batch.map((row) => ({
              id: row.BILL_ID,
              title: row.BILL_NAME,
              proposerName: row.RST_PROPOSER ?? this.extractProposerName(row.PROPOSER),
              coProposerCount: this.extractCoProposerCount(row.PROPOSER),
              status: this.mapStatus(row.PROC_RESULT),
              proposedDate: this.normalizeDate(row.PROPOSE_DT),
              termId,
              committee: row.COMMITTEE || null,
              ...this.mapProgressFields(row),
            })),
            skipDuplicates: true,
          });
        }

        // 신규 법안의 proposer만 연결
        await this.linkProposersForBills(newRows, termId);
      }

      // 변경된 기존 법안 업데이트 (summary/proposer 보존)
      if (updateRows.length > 0) {
        for (const row of updateRows) {
          await this.prisma.bill.update({
            where: { id: row.BILL_ID },
            data: {
              title: row.BILL_NAME,
              proposerName: row.RST_PROPOSER ?? this.extractProposerName(row.PROPOSER),
              coProposerCount: this.extractCoProposerCount(row.PROPOSER),
              status: this.mapStatus(row.PROC_RESULT),
              proposedDate: this.normalizeDate(row.PROPOSE_DT),
              committee: row.COMMITTEE || null,
              ...this.mapProgressFields(row),
            },
          });
        }
      }

      await this.syncLog.complete(log.id, rows.length);
      console.log(
        `[BillSync:Safe] Completed: +${newRows.length} new, ~${updateRows.length} updated`,
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      await this.syncLog.fail(log.id, msg);
      console.error(`[BillSync:Safe] Failed: ${msg}`);
      throw error;
    }
  }

  /** 특정 법안들에 대해서만 proposer 연결 (기존 proposer 삭제 없음) */
  private async linkProposersForBills(rows: BillApiRow[], termId: number): Promise<void> {
    const memberMap = await this.buildMemberNameMap(termId);
    const allProposers: { billId: string; memberId: string; role: string }[] = [];

    for (const row of rows) {
      const repName = row.RST_PROPOSER ?? this.extractProposerName(row.PROPOSER);
      const repNames = repName
        .split(',')
        .map((n) => n.replace(/의원.*$/, '').trim())
        .filter(Boolean);
      const repMemberIds = new Set<string>();
      for (const name of repNames) {
        const memberId = memberMap.get(name);
        if (memberId) {
          repMemberIds.add(memberId);
          allProposers.push({ billId: row.BILL_ID, memberId, role: 'representative' });
        }
      }

      if (row.PUBL_PROPOSER) {
        const names = row.PUBL_PROPOSER.split(',')
          .map((n) => n.trim())
          .filter(Boolean);
        for (const name of names) {
          const memberId = memberMap.get(name);
          if (memberId && !repMemberIds.has(memberId)) {
            allProposers.push({ billId: row.BILL_ID, memberId, role: 'co' });
          }
        }
      }
    }

    if (allProposers.length > 0) {
      console.log(
        `[BillSync:Safe] Linking ${allProposers.length} proposers for ${rows.length} new bills...`,
      );
      for (let i = 0; i < allProposers.length; i += BATCH_SIZE) {
        const batch = allProposers.slice(i, i + BATCH_SIZE);
        await this.prisma.billProposer.createMany({ data: batch, skipDuplicates: true });
      }
    }
  }

  private async batchUpsertBills(rows: BillApiRow[], termId: number): Promise<void> {
    // Upsert 패턴: 기존 summary, pdfBookId, detailLink를 보존하면서 기본 정보만 갱신
    console.log(`[BillSync] Upserting ${rows.length} bills in batches of ${BATCH_SIZE}...`);

    // 기존 법안 데이터 조회 (변경 감지용)
    const existingBills = await this.prisma.bill.findMany({
      where: { termId },
      select: {
        id: true,
        title: true,
        proposerName: true,
        coProposerCount: true,
        status: true,
        proposedDate: true,
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

    const newRows: BillApiRow[] = [];
    const updateRows: BillApiRow[] = [];
    for (const row of rows) {
      if (!existingIds.has(row.BILL_ID)) {
        newRows.push(row);
      } else {
        // 변경된 법안만 업데이트 대상에 포함
        const existing = existingMap.get(row.BILL_ID)!;
        const newTitle = row.BILL_NAME;
        const newProposerName = row.RST_PROPOSER ?? this.extractProposerName(row.PROPOSER);
        const newCoCount = this.extractCoProposerCount(row.PROPOSER);
        const newStatus = this.mapStatus(row.PROC_RESULT);
        const newDate = this.normalizeDate(row.PROPOSE_DT);
        const newCommittee = row.COMMITTEE || null;
        const progress = this.mapProgressFields(row);

        if (
          existing.title !== newTitle ||
          existing.proposerName !== newProposerName ||
          existing.coProposerCount !== newCoCount ||
          existing.status !== newStatus ||
          existing.proposedDate !== newDate ||
          existing.committee !== newCommittee ||
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

    // 신규 법안: createMany (빠름)
    if (newRows.length > 0) {
      console.log(`[BillSync]   Creating ${newRows.length} new bills...`);
      for (let i = 0; i < newRows.length; i += BATCH_SIZE) {
        const batch = newRows.slice(i, i + BATCH_SIZE);
        const data = batch.map((row) => ({
          id: row.BILL_ID,
          title: row.BILL_NAME,
          proposerName: row.RST_PROPOSER ?? this.extractProposerName(row.PROPOSER),
          coProposerCount: this.extractCoProposerCount(row.PROPOSER),
          status: this.mapStatus(row.PROC_RESULT),
          proposedDate: this.normalizeDate(row.PROPOSE_DT),
          termId,
          committee: row.COMMITTEE || null,
          ...this.mapProgressFields(row),
        }));
        await this.prisma.bill.createMany({ data, skipDuplicates: true });
      }
    }

    // 기존 법안: 변경된 것만 update (summary/pdfBookId/detailLink 보존)
    if (updateRows.length > 0) {
      console.log(
        `[BillSync]   Updating ${updateRows.length} changed bills (${existingBills.length - newRows.length - updateRows.length} unchanged, skipped)...`,
      );
      for (let i = 0; i < updateRows.length; i += UPDATE_BATCH_SIZE) {
        const batch = updateRows.slice(i, i + UPDATE_BATCH_SIZE);
        for (const row of batch) {
          await this.prisma.bill.update({
            where: { id: row.BILL_ID },
            data: {
              title: row.BILL_NAME,
              proposerName: row.RST_PROPOSER ?? this.extractProposerName(row.PROPOSER),
              coProposerCount: this.extractCoProposerCount(row.PROPOSER),
              status: this.mapStatus(row.PROC_RESULT),
              proposedDate: this.normalizeDate(row.PROPOSE_DT),
              committee: row.COMMITTEE || null,
              ...this.mapProgressFields(row),
            },
          });
        }
        if ((i + UPDATE_BATCH_SIZE) % 500 < UPDATE_BATCH_SIZE) {
          console.log(
            `[BillSync]   Bills: ${Math.min(i + UPDATE_BATCH_SIZE, updateRows.length)}/${updateRows.length}`,
          );
        }
      }
    }

    // P1: API 응답에 없는 stale bill 정리 (철회·삭제된 법안)
    const apiIds = new Set(rows.map((r) => r.BILL_ID));
    const staleIds = [...existingIds].filter((id) => !apiIds.has(id));
    if (staleIds.length > 0) {
      const staleRatio = staleIds.length / existingIds.size;
      if (staleRatio > 0.05) {
        // 5% 초과 삭제는 API 응답 이상으로 판단 → 삭제 스킵
        console.warn(
          `[BillSync]   ⚠ Skipping stale bill removal: ${staleIds.length}/${existingIds.size} (${(staleRatio * 100).toFixed(1)}%) exceeds 5% threshold`,
        );
      } else {
        console.log(`[BillSync]   Removing ${staleIds.length} stale bills...`);
        await this.prisma.billProposer.deleteMany({
          where: { billId: { in: staleIds } },
        });
        await this.prisma.bill.deleteMany({
          where: { id: { in: staleIds } },
        });
      }
    }

    // BillProposer 재구축(발의자 변경 반영)은 batchLinkProposers에서
    // delete+insert를 한 트랜잭션으로 원자적으로 수행한다(여기서 미리 삭제하지 않음).
  }

  private async batchLinkProposers(rows: BillApiRow[], termId: number): Promise<void> {
    const memberMap = await this.buildMemberNameMap(termId);
    console.log(`[BillSync] Linking proposers (${memberMap.size} members in lookup)...`);

    const allProposers: { billId: string; memberId: string; role: string }[] = [];

    for (const row of rows) {
      // 1) 대표발의자: RST_PROPOSER 또는 PROPOSER에서 추출한 이름
      const repName = row.RST_PROPOSER ?? this.extractProposerName(row.PROPOSER);
      const repNames = repName
        .split(',')
        .map((n) => n.replace(/의원.*$/, '').trim())
        .filter(Boolean);
      const repMemberIds = new Set<string>();
      for (const name of repNames) {
        const memberId = memberMap.get(name);
        if (memberId) {
          repMemberIds.add(memberId);
          allProposers.push({ billId: row.BILL_ID, memberId, role: 'representative' });
        }
      }

      // 2) 공동발의자: PUBL_PROPOSER (대표발의자는 제외)
      if (row.PUBL_PROPOSER) {
        const names = row.PUBL_PROPOSER.split(',')
          .map((n) => n.trim())
          .filter(Boolean);

        for (const name of names) {
          const memberId = memberMap.get(name);
          if (memberId && !repMemberIds.has(memberId)) {
            allProposers.push({ billId: row.BILL_ID, memberId, role: 'co' });
          }
        }
      }
    }

    // 안전 가드 1: 파싱된 발의자가 0이면 교체하지 않고 기존 데이터 보존.
    // rows가 0이든(빈 API 응답) 매칭 전량 실패든, 그대로 진행하면 delete만 되고 발의자 관계가 전멸한다.
    if (allProposers.length === 0) {
      throw new Error(
        `[BillSync] Aborting proposer rebuild: 0 proposers parsed from ${rows.length} bills (preserving existing links)`,
      );
    }

    // 안전 가드 2: 새로 구축할 발의자 수가 기존의 50% 미만으로 급감하면 API 이상으로 보고 중단.
    // (파싱 1건만 성공해도 79만 건을 통째로 교체하는 사고 방지)
    const existingCount = await this.prisma.billProposer.count({ where: { bill: { termId } } });
    if (existingCount > 0 && allProposers.length < existingCount * 0.5) {
      throw new Error(
        `[BillSync] Aborting proposer rebuild: parsed ${allProposers.length} < 50% of existing ${existingCount} (suspected API anomaly, preserving existing links)`,
      );
    }

    // delete + insert를 한 트랜잭션으로 원자화(중간 실패 시 기존 발의자 관계 보존).
    // API 호출·이름 매칭·파싱은 이미 트랜잭션 밖에서 끝났다.
    console.log(`[BillSync] Rebuilding ${allProposers.length} proposer links (atomic)...`);
    await this.prisma.$transaction(
      async (tx) => {
        await tx.billProposer.deleteMany({ where: { bill: { termId } } });
        for (let i = 0; i < allProposers.length; i += BATCH_SIZE) {
          const batch = allProposers.slice(i, i + BATCH_SIZE);
          await tx.billProposer.createMany({ data: batch, skipDuplicates: true });
        }
      },
      { timeout: 300_000 },
    );
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

  /** API row → 심사 경과 필드 매핑 */
  private mapProgressFields(row: BillApiRow) {
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
