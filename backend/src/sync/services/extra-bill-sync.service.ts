import { Prisma, PrismaClient } from '@prisma/client';
import { AssemblyApiService } from './assembly-api.service';
import { SyncLogService } from './sync-log.service';
import {
  isRadarEventCollectionEnabled,
  makeRunId,
  resolveBillTransition,
  type BillSnapshot,
} from './policy-event-builder';

type PolicyEventInput = Prisma.PolicyEventCreateManyInput;

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

    // Radar: extra 경로(정부·위원장 대안 법안)도 상태·결과 변경을 PolicyEvent로 감지.
    // daily 경로이므로 감지 없이 Bill만 갱신하면 다음 sync에서 old==new → 이벤트 영구 유실.
    const radarOn = isRadarEventCollectionEnabled();
    const radarPreview = radarOn && process.env.RADAR_DRY_RUN === 'true';
    const runId = makeRunId();

    const newRows: ExtraBillApiRow[] = [];
    // 변경된 법안: Bill patch(status·committee·progress) + (해당 시) PolicyEvent
    const updatePlans: { id: string; data: Prisma.BillUpdateInput; event?: PolicyEventInput }[] =
      [];
    const seen = new Set<string>(); // 응답 내 중복 BILL_ID 방어

    for (const row of rows) {
      if (seen.has(row.BILL_ID)) continue;
      seen.add(row.BILL_ID);
      if (!existingIds.has(row.BILL_ID)) {
        newRows.push(row);
        continue;
      }
      const existing = existingMap.get(row.BILL_ID)!;
      const progress = this.mapProgressFields(row);
      const oldSnap: BillSnapshot = {
        status: existing.status,
        committeeResultCode: existing.committeeResultCode,
        committeeResultDate: existing.committeeResultDate,
        lawResultCode: existing.lawResultCode,
        lawResultDate: existing.lawResultDate,
        plenaryDate: existing.plenaryDate,
      };
      const { effective: eff, event: draft } = resolveBillTransition(oldSnap, {
        status: this.mapStatus(row.PROC_RESULT_CD, row.CMT_PROC_RESULT_CD, row.PASS_GUBUN),
        committeeResultCode: progress.committeeResultCode,
        committeeResultDate: progress.committeeResultDate,
        lawResultCode: progress.lawResultCode,
        lawResultDate: progress.lawResultDate,
        plenaryDate: progress.plenaryDate,
      });

      const newCommittee = row.CURR_COMMITTEE || null;
      const changed =
        existing.status !== eff.status ||
        existing.committee !== newCommittee ||
        existing.committeeDate !== progress.committeeDate ||
        existing.committeePresentDate !== progress.committeePresentDate ||
        existing.committeeResultCode !== eff.committeeResultCode ||
        existing.committeeResultDate !== eff.committeeResultDate ||
        existing.lawSubmitDate !== progress.lawSubmitDate ||
        existing.lawPresentDate !== progress.lawPresentDate ||
        existing.lawResultCode !== eff.lawResultCode ||
        existing.lawResultDate !== eff.lawResultDate ||
        existing.plenaryDate !== eff.plenaryDate;
      if (!changed) continue;

      // effectiveNext 반영 patch(역행/누락 필드는 기존 값 유지). title/proposer는 보존(미갱신).
      const data: Prisma.BillUpdateInput = {
        status: eff.status,
        committee: newCommittee,
        committeeDate: progress.committeeDate,
        committeePresentDate: progress.committeePresentDate,
        committeeResultCode: eff.committeeResultCode,
        committeeResultDate: eff.committeeResultDate,
        lawSubmitDate: progress.lawSubmitDate,
        lawPresentDate: progress.lawPresentDate,
        lawResultCode: eff.lawResultCode,
        lawResultDate: eff.lawResultDate,
        plenaryDate: eff.plenaryDate,
      };

      const event =
        draft && radarOn && !radarPreview
          ? {
              billId: row.BILL_ID,
              runId,
              eventType: draft.eventType,
              changes: draft.changes as unknown as Prisma.InputJsonValue,
              sourceChangedAt: draft.sourceChangedAt,
            }
          : undefined;
      if (draft && radarPreview) {
        console.log(
          `[ExtraBillSync]   Radar[EVENT PREVIEW] bill=${row.BILL_ID} ${draft.eventType} ` +
            `(Bill sync는 정상 반영, PolicyEvent 미저장): ${JSON.stringify(draft.changes)}`,
        );
      }

      updatePlans.push({ id: row.BILL_ID, data, event });
    }

    console.log(
      `[ExtraBillSync]   New: ${newRows.length}, Changed: ${updatePlans.length}, Unchanged: ${rows.length - newRows.length - updatePlans.length}`,
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

    // 변경된 기존 법안 업데이트 + PolicyEvent(원자적 배치 트랜잭션).
    // bill만 갱신되고 event가 유실되는 것을 막는다(배치 실패 시 그 배치 전체 롤백).
    if (updatePlans.length > 0) {
      for (let i = 0; i < updatePlans.length; i += UPDATE_BATCH_SIZE) {
        const batch = updatePlans.slice(i, i + UPDATE_BATCH_SIZE);
        const events = batch
          .map((p) => p.event)
          .filter((e): e is PolicyEventInput => e !== undefined);
        await this.prisma.$transaction(
          async (tx) => {
            for (const plan of batch) {
              await tx.bill.update({ where: { id: plan.id }, data: plan.data });
            }
            if (events.length > 0) {
              await tx.policyEvent.createMany({ data: events, skipDuplicates: true });
            }
          },
          { timeout: 60000 },
        );
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
