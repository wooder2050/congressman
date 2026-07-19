import { Prisma, PrismaClient } from '@prisma/client';
import { AssemblyApiService } from './assembly-api.service';
import { SyncLogService } from './sync-log.service';
import {
  isRadarEventCollectionEnabled,
  makeRunId,
  resolveBillTransition,
  type BillSnapshot,
  type PolicyEventDraft,
} from './policy-event-builder';

/** PolicyEvent createMany 입력(배치 트랜잭션에서 재사용). */
type PolicyEventInput = Prisma.PolicyEventCreateManyInput;

/**
 * 변경된 법안 1건의 Bill patch + (해당 시) PolicyEvent. 배치 트랜잭션 단위.
 * eventDetected: 이벤트가 감지됐는지(PREVIEW라 event가 undefined여도 true) — 요약 카운트용.
 */
type BillUpdatePlan = {
  id: string;
  data: Prisma.BillUpdateInput;
  event?: PolicyEventInput;
  eventDetected: boolean;
};

/** 상태·결과 필드만 담은 부분 레코드 → 감지용 BillSnapshot. */
function billSnapshot(b: {
  status: string;
  committeeResultCode: string | null;
  committeeResultDate: string | null;
  lawResultCode: string | null;
  lawResultDate: string | null;
  plenaryDate: string | null;
}): BillSnapshot {
  return {
    status: b.status,
    committeeResultCode: b.committeeResultCode,
    committeeResultDate: b.committeeResultDate,
    lawResultCode: b.lawResultCode,
    lawResultDate: b.lawResultDate,
    plenaryDate: b.plenaryDate,
  };
}

/** PolicyEventDraft → createMany 입력 변환(billId·runId 부여). */
function toPolicyEventInput(
  billId: string,
  runId: string,
  draft: PolicyEventDraft,
): PolicyEventInput {
  return {
    billId,
    runId,
    eventType: draft.eventType,
    changes: draft.changes as unknown as Prisma.InputJsonValue,
    sourceChangedAt: draft.sourceChangedAt,
  };
}

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
  /**
   * Radar: 이번 sync '실행'을 식별하는 runId. PolicyEvent @@unique([runId, billId]) key.
   * ISO 시각+UUID로, 실행마다 달라지고 동시/재시도 실행이 충돌하지 않는다(이벤트 유실 방지).
   * 한 프로세스 실행 내에서는 불변(재시도 시 같은 값).
   */
  private syncRunId = '';

  constructor(
    private readonly prisma: PrismaClient,
    private readonly api: AssemblyApiService,
    private readonly syncLog: SyncLogService,
  ) {}

  async syncBills(termId: number): Promise<void> {
    const log = await this.syncLog.start('bills', termId);
    this.syncRunId = makeRunId();

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
    this.syncRunId = makeRunId();

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

      // Radar: safe 경로도 상태·결과 변경을 PolicyEvent로 감지(감지 없이 Bill만 갱신하면
      // 다음 sync에서 old==new가 되어 이벤트가 영구 유실됨). daily 경로와 동일 로직 공유.
      const radarOn = isRadarEventCollectionEnabled();
      const radarPreview = radarOn && process.env.RADAR_DRY_RUN === 'true';
      const ctx = { runId: this.syncRunId, radarOn, radarPreview, logTag: '[BillSync:Safe]' };

      const newRows: BillApiRow[] = [];
      const updatePlans: BillUpdatePlan[] = [];
      const seen = new Set<string>(); // 응답 내 중복 BILL_ID 방어(배치 내 중복 update/event 방지)

      for (const row of rows) {
        if (seen.has(row.BILL_ID)) continue;
        seen.add(row.BILL_ID);
        if (!existingIds.has(row.BILL_ID)) {
          newRows.push(row);
          continue;
        }
        const plan = this.buildUpdatePlan(row, existingMap.get(row.BILL_ID)!, ctx);
        if (plan) updatePlans.push(plan);
      }

      console.log(
        `[BillSync:Safe] New: ${newRows.length}, Changed: ${updatePlans.length}, Unchanged: ${existingBills.length - updatePlans.length}`,
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

      // 변경된 기존 법안 업데이트 (summary/proposer 보존) + PolicyEvent(원자적 배치 트랜잭션)
      const unchanged = existingBills.length - updatePlans.length;
      await this.flushBillUpdates(updatePlans, '[BillSync:Safe]', {
        radarOn,
        radarPreview,
        unchanged,
      });

      await this.syncLog.complete(log.id, rows.length);
      console.log(
        `[BillSync:Safe] Completed: +${newRows.length} new, ~${updatePlans.length} updated`,
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      await this.syncLog.fail(log.id, msg);
      console.error(`[BillSync:Safe] Failed: ${msg}`);
      throw error;
    }
  }

  /**
   * 변경된 법안들을 배치 트랜잭션으로 update + PolicyEvent createMany(원자적).
   * bill만 갱신되고 event가 유실되는 것을 막는다(배치 실패 시 그 배치 전체 롤백 → 재실행 복구).
   * PREVIEW(radarPreview)면 event가 이미 걸러져 있어 Bill 갱신만 수행되고 이벤트는 미저장.
   * syncBills / syncBillsSafe가 공유.
   */
  private async flushBillUpdates(
    plans: BillUpdatePlan[],
    logTag: string,
    opts: { radarOn: boolean; radarPreview: boolean; unchanged: number },
  ): Promise<void> {
    if (plans.length === 0) return;
    // 감지된 이벤트 수(PREVIEW면 event가 미저장되므로 eventDetected로 카운트해야 정확).
    const eventCount = plans.filter((p) => p.eventDetected).length;
    console.log(
      `${logTag}   Updating ${plans.length} changed bills (${opts.unchanged} unchanged, skipped)... ` +
        `${opts.radarOn ? `+ ${opts.radarPreview ? `${eventCount} events PREVIEW(미저장)` : `${eventCount} policy events`}` : ''}`,
    );
    for (let i = 0; i < plans.length; i += UPDATE_BATCH_SIZE) {
      const batch = plans.slice(i, i + UPDATE_BATCH_SIZE);
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
      if ((i + UPDATE_BATCH_SIZE) % 500 < UPDATE_BATCH_SIZE) {
        console.log(
          `${logTag}   Bills: ${Math.min(i + UPDATE_BATCH_SIZE, plans.length)}/${plans.length}`,
        );
      }
    }
    if (opts.radarOn && !opts.radarPreview) {
      console.log(`${logTag}   Radar: recorded up to ${eventCount} policy events`);
    }
  }

  /**
   * 변경된 법안 1건을 감지해 update plan(effectiveNext 반영 patch + 이벤트)으로 만든다.
   * 변경이 없으면 null. syncBills / syncBillsSafe가 공유(감지·effective 계산 단일화).
   */
  private buildUpdatePlan(
    row: BillApiRow,
    existing: {
      title: string;
      proposerName: string;
      coProposerCount: number;
      status: string;
      proposedDate: string | null;
      committee: string | null;
      committeeDate: string | null;
      committeePresentDate: string | null;
      committeeResultCode: string | null;
      committeeResultDate: string | null;
      lawSubmitDate: string | null;
      lawPresentDate: string | null;
      lawResultCode: string | null;
      lawResultDate: string | null;
      plenaryDate: string | null;
    },
    ctx: { runId: string; radarOn: boolean; radarPreview: boolean; logTag: string },
  ): BillUpdatePlan | null {
    const progress = this.mapProgressFields(row);
    const { effective: eff, event: draft } = resolveBillTransition(billSnapshot(existing), {
      status: this.mapStatus(row.PROC_RESULT),
      committeeResultCode: progress.committeeResultCode,
      committeeResultDate: progress.committeeResultDate,
      lawResultCode: progress.lawResultCode,
      lawResultDate: progress.lawResultDate,
      plenaryDate: progress.plenaryDate,
    });

    const newTitle = row.BILL_NAME;
    const newProposerName = row.RST_PROPOSER ?? this.extractProposerName(row.PROPOSER);
    const newCoCount = this.extractCoProposerCount(row.PROPOSER);
    const newDate = this.normalizeDate(row.PROPOSE_DT);
    const newCommittee = row.COMMITTEE || null;

    const changed =
      existing.title !== newTitle ||
      existing.proposerName !== newProposerName ||
      existing.coProposerCount !== newCoCount ||
      existing.status !== eff.status ||
      existing.proposedDate !== newDate ||
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

    if (!changed) return null;

    const data: Prisma.BillUpdateInput = {
      title: newTitle,
      proposerName: newProposerName,
      coProposerCount: newCoCount,
      status: eff.status,
      proposedDate: newDate,
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
      draft && ctx.radarOn && !ctx.radarPreview
        ? toPolicyEventInput(row.BILL_ID, ctx.runId, draft)
        : undefined;
    if (draft && ctx.radarPreview) {
      console.log(
        `${ctx.logTag}   Radar[EVENT PREVIEW] bill=${row.BILL_ID} ${draft.eventType} ` +
          `(Bill sync는 정상 반영, PolicyEvent 미저장): ${JSON.stringify(draft.changes)}`,
      );
    }

    return { id: row.BILL_ID, data, event, eventDetected: Boolean(draft && ctx.radarOn) };
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

    // Radar: 의미 있는 변경(상태·처리결과)을 PolicyEvent로 기록(서버 flag ON일 때만).
    // dryRun(PREVIEW)은 'Radar 이벤트만' 미리보기 → Bill 동기화는 정상 반영, PolicyEvent만 미저장.
    const radarOn = isRadarEventCollectionEnabled();
    const radarPreview = radarOn && process.env.RADAR_DRY_RUN === 'true';
    const runId = this.syncRunId;

    const ctx = { runId, radarOn, radarPreview, logTag: '[BillSync]' };
    const newRows: BillApiRow[] = [];
    // 변경된 법안: update 데이터 + (해당 시) PolicyEvent를 함께 준비해 배치 트랜잭션으로 원자 처리
    const updatePlans: BillUpdatePlan[] = [];
    const seen = new Set<string>(); // 응답 내 중복 BILL_ID 방어(배치 내 중복 update/event 방지)

    for (const row of rows) {
      if (seen.has(row.BILL_ID)) continue;
      seen.add(row.BILL_ID);
      if (!existingIds.has(row.BILL_ID)) {
        newRows.push(row);
        continue;
      }
      const plan = this.buildUpdatePlan(row, existingMap.get(row.BILL_ID)!, ctx);
      if (plan) updatePlans.push(plan);
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
    const unchanged = existingBills.length - newRows.length - updatePlans.length;
    await this.flushBillUpdates(updatePlans, '[BillSync]', { radarOn, radarPreview, unchanged });

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
    // 응답 내 중복 BILL_ID 방어: 첫 등장 row만 처리(순서 의존적 role 선택·건수 부풀림 방지).
    const seenBills = new Set<string>();

    for (const row of rows) {
      if (seenBills.has(row.BILL_ID)) continue;
      seenBills.add(row.BILL_ID);
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
