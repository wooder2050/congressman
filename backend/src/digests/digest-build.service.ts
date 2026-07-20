/**
 * Lawmake Radar 주간 다이제스트 '빌드' 배치.
 *
 * 역할: 이번 기간의 PolicyEvent를 활성 Watch와 매칭해 사용자별 Digest/DigestItem을 DB에 만든다.
 * 발송은 하지 않는다(별도 발송기). 여기서 만든 Digest는 status=PENDING(또는 dry-run은 PREVIEW).
 *
 * 멱등성:
 * - DigestRun.periodKey unique로 같은 기간 중복 실행 방지(재개 시 기존 BUILDING run 이어감).
 * - Digest @@unique([digestRunId, userId]) / DigestItem @@unique([userId, policyEventId])로
 *   재실행·중단복구 시 중복 생성 방지(skipDuplicates·upsert).
 * - 빌드가 끝나면 DigestRun.status=READY로 커서 전진(이벤트 없어도 READY).
 */

import { Prisma, type PrismaClient } from '@prisma/client';
import {
  matchEventsToUsers,
  periodKeyOf,
  resolvePeriod,
  type EventInput,
  type UserDigest,
  type WatchInput,
} from './digest-builder';
import { renderSubject } from './digest-email';

interface DigestBuildResult {
  periodKey: string;
  digestRunId: string;
  usersWithChanges: number;
  digestsCreated: number;
  status: 'READY';
}

export class DigestBuildService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * @param cutoff 이번 실행 기준 시각(주간 배치 시점). periodEnd로 쓰임.
   * @param dryRun true면 Digest.status=PREVIEW(발송 대상 아님), false면 PENDING.
   */
  async build(cutoff: Date, dryRun: boolean): Promise<DigestBuildResult> {
    // 1) 기간 경계: 마지막 READY run의 periodEnd부터 이번 cutoff까지.
    const lastReady = await this.prisma.digestRun.findFirst({
      where: { status: 'READY' },
      orderBy: { periodEnd: 'desc' },
      select: { periodEnd: true },
    });
    const { periodStart, periodEnd } = resolvePeriod(cutoff, lastReady?.periodEnd ?? null);
    const periodKey = periodKeyOf(periodEnd);

    // 2) DigestRun 확보(같은 기간 재실행이면 기존 BUILDING run 재개, READY면 그대로 반환).
    const existing = await this.prisma.digestRun.findUnique({ where: { periodKey } });
    if (existing?.status === 'READY') {
      return {
        periodKey,
        digestRunId: existing.id,
        usersWithChanges: 0,
        digestsCreated: 0,
        status: 'READY',
      };
    }
    const run =
      existing ??
      (await this.prisma.digestRun.create({
        data: { periodKey, periodStart, periodEnd, status: 'BUILDING' },
      }));

    // 3) 기간 내 이벤트 + 그 법안들의 활성 Watch 조회.
    const events = await this.prisma.policyEvent.findMany({
      where: { detectedAt: { gte: periodStart, lt: periodEnd } },
      include: { bill: { select: { id: true, title: true, status: true } } },
      orderBy: [{ detectedAt: 'asc' }, { id: 'asc' }],
    });

    let digestsCreated = 0;
    let usersWithChanges = 0;

    if (events.length > 0) {
      const billIds = [...new Set(events.map((e) => e.billId))];
      const watches = await this.prisma.watch.findMany({
        where: { enabled: true, billId: { in: billIds } },
        select: { id: true, userId: true, billId: true, createdAt: true },
      });

      const eventInputs: EventInput[] = events.map((e) => ({
        id: e.id,
        billId: e.billId,
        eventType: e.eventType,
        changes: e.changes,
        detectedAt: e.detectedAt,
        sourceChangedAt: e.sourceChangedAt,
        billTitle: e.bill.title,
        billStatus: e.bill.status,
      }));
      const watchInputs: WatchInput[] = watches.map((w) => ({
        id: w.id,
        userId: w.userId,
        billId: w.billId,
        createdAt: w.createdAt,
      }));

      const userDigests = matchEventsToUsers(watchInputs, eventInputs, periodStart, periodEnd);
      usersWithChanges = userDigests.length;

      // 4) 사용자별 Digest/DigestItem 생성. 커서(cursorUserId)로 중단 복구.
      for (const ud of userDigests) {
        const created = await this.upsertUserDigest(run.id, ud, dryRun);
        if (created) digestsCreated += 1;
        await this.prisma.digestRun.update({
          where: { id: run.id },
          data: { cursorUserId: ud.userId },
        });
      }
    }

    // 5) 빌드 완료 → READY로 커서 전진(이벤트 없어도).
    await this.prisma.digestRun.update({
      where: { id: run.id },
      data: { status: 'READY', readyAt: new Date() },
    });

    return {
      periodKey,
      digestRunId: run.id,
      usersWithChanges,
      digestsCreated,
      status: 'READY',
    };
  }

  /**
   * 한 사용자의 Digest + DigestItem을 트랜잭션으로 생성.
   * - Digest @@unique([digestRunId, userId])로 재실행 시 중복 방지(이미 있으면 skip).
   * - DigestItem @@unique([userId, policyEventId])로 실행 간 재포함 방지(skipDuplicates).
   * - subjectSnapshot은 저장, htmlSnapshot은 발송 직전 렌더(클릭 토큰이 DigestItem.id 필요)라
   *   빌드 시엔 빈 문자열로 두고 발송기가 채운다.
   * @returns 새로 만들었으면 true(이미 있으면 false).
   */
  private async upsertUserDigest(
    digestRunId: string,
    ud: UserDigest,
    dryRun: boolean,
  ): Promise<boolean> {
    const existing = await this.prisma.digest.findUnique({
      where: { digestRunId_userId: { digestRunId, userId: ud.userId } },
      select: { id: true },
    });
    if (existing) return false;

    // 실행 간 재발송 방지: 이 사용자에게 이미 DigestItem으로 포함된 policyEventId를 제외.
    // (skipDuplicates에만 의존하면 모든 item이 skip돼 '빈 Digest'가 생겨 빈 이메일이 나갈 수 있음)
    const alreadySent = await this.prisma.digestItem.findMany({
      where: {
        userId: ud.userId,
        policyEventId: { in: ud.items.map((it) => it.policyEventId) },
      },
      select: { policyEventId: true },
    });
    const sentIds = new Set(alreadySent.map((r) => r.policyEventId));
    const freshItems = ud.items.filter((it) => !sentIds.has(it.policyEventId));
    if (freshItems.length === 0) return false; // 새 변경이 없으면 Digest 미생성(빈 이메일 방지)

    const idempotencyKey = `${digestRunId}:${ud.userId}`;
    const subject = renderSubject(freshItems.length);

    await this.prisma.$transaction(async (tx) => {
      const digest = await tx.digest.create({
        data: {
          digestRunId,
          userId: ud.userId,
          status: dryRun ? 'PREVIEW' : 'PENDING',
          subjectSnapshot: subject,
          htmlSnapshot: '', // 발송기가 DigestItem.id로 클릭 링크를 만들어 렌더 후 채움
          idempotencyKey,
        },
      });
      await tx.digestItem.createMany({
        data: freshItems.map((it, idx) => ({
          digestId: digest.id,
          userId: ud.userId,
          policyEventId: it.policyEventId,
          watchId: it.watchId,
          payloadSnapshot: {
            billId: it.billId,
            billTitle: it.billTitle,
            billStatus: it.billStatus,
            eventType: it.eventType,
            changes: it.changes as Prisma.InputJsonValue,
            detectedAt: it.detectedAt.toISOString(),
            sourceChangedAt: it.sourceChangedAt,
          } as Prisma.InputJsonObject,
          position: idx,
        })),
        skipDuplicates: true, // @@unique([userId, policyEventId]) 최종 방어(동시 실행 등)
      });
    });
    return true;
  }
}
