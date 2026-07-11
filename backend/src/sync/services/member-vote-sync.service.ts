import { PrismaClient } from '@prisma/client';
import { AssemblyApiService } from './assembly-api.service';
import { SyncLogService } from './sync-log.service';

/** 의원별 표결 API 응답 row */
interface MemberVoteApiRow {
  MONA_CD: string;
  HG_NM: string;
  RESULT_VOTE_MOD: string; // "찬성", "반대", "기권", "불참"
  BILL_ID: string;
}

const BATCH_SIZE = 500;
const API_DELAY_MS = 200;
/** 연속 실패가 이 횟수에 도달하면 API 전체 장애로 보고 중단(circuit breaker) */
const CONSECUTIVE_FAILURE_LIMIT = 3;

export class MemberVoteSyncService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly api: AssemblyApiService,
    private readonly syncLog: SyncLogService,
  ) {}

  async syncMemberVotes(termId: number, incrementalDays = 7): Promise<void> {
    const log = await this.syncLog.start('member-votes', termId);

    try {
      // Incremental: only sync votes from recent days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - incrementalDays);

      const votes = await this.prisma.vote.findMany({
        where: {
          termId,
          procDate: { gte: cutoffDate.toISOString().slice(0, 10) },
        },
        select: { id: true },
        orderBy: { procDate: 'desc' },
      });

      console.log(
        `[MemberVoteSync] Found ${votes.length} votes (last ${incrementalDays} days) for term ${termId}`,
      );

      // Build set of known member IDs for this term
      const memberTerms = await this.prisma.memberTerm.findMany({
        where: { termId },
        select: { memberId: true },
      });
      const memberIds = new Set(memberTerms.map((mt) => mt.memberId));

      let totalInserted = 0;
      const failedVoteIds: string[] = [];
      const skippedEmptyVoteIds: string[] = [];
      let consecutiveFailures = 0;

      for (let i = 0; i < votes.length; i++) {
        const vote = votes[i];

        try {
          const rows = await this.api.fetchAll<MemberVoteApiRow>(
            'nojepdqqaweusdfbi',
            { AGE: String(termId), BILL_ID: vote.id },
            300,
          );

          const data = rows
            .filter((row) => memberIds.has(row.MONA_CD))
            .map((row) => ({
              memberId: row.MONA_CD,
              voteId: vote.id,
              result: this.mapResult(row.RESULT_VOTE_MOD),
            }));

          // 빈 응답(원본 0건 또는 필터 후 0건)은 기존 데이터를 삭제하지 않고 스킵.
          // 표결에는 항상 참여 기록이 있어야 하므로 0건은 삭제하지 말고 보존한다.
          if (rows.length === 0 || data.length === 0) {
            skippedEmptyVoteIds.push(vote.id);
            consecutiveFailures = 0;
          } else {
            // Per-vote atomic delete + re-insert to prevent partial data
            await this.prisma.$transaction(async (tx) => {
              await tx.memberVote.deleteMany({ where: { voteId: vote.id } });
              for (let j = 0; j < data.length; j += BATCH_SIZE) {
                const batch = data.slice(j, j + BATCH_SIZE);
                await tx.memberVote.createMany({ data: batch });
              }
            });
            totalInserted += data.length;
            consecutiveFailures = 0;
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn(`[MemberVoteSync] Failed for vote ${vote.id}: ${msg}`);
          failedVoteIds.push(vote.id);
          consecutiveFailures++;
          // 연속 실패가 임계치에 도달하면 API 전체 장애로 보고 즉시 중단
          if (consecutiveFailures >= CONSECUTIVE_FAILURE_LIMIT) {
            throw new Error(
              `Aborting: ${consecutiveFailures} consecutive failures (last vote ${vote.id}: ${msg})`,
            );
          }
        }

        if ((i + 1) % 50 === 0 || i === votes.length - 1) {
          console.log(
            `[MemberVoteSync]   Progress: ${i + 1}/${votes.length} votes (${totalInserted} records)`,
          );
        }

        await new Promise((r) => setTimeout(r, API_DELAY_MS));
      }

      // 실패한 표결이 하나라도 있으면 sync를 성공(completed)으로 기록하지 않는다(거짓 성공 방지).
      // 성공한 표결의 데이터는 이미 개별 트랜잭션으로 반영됐고, 실패/스킵분은 기존 데이터가 보존된다.
      if (failedVoteIds.length > 0) {
        throw new Error(
          `${failedVoteIds.length}/${votes.length} votes failed (e.g. ${failedVoteIds.slice(0, 5).join(', ')})`,
        );
      }

      await this.syncLog.complete(log.id, totalInserted);
      console.log(
        `[MemberVoteSync] Completed: ${totalInserted} records from ${votes.length} votes` +
          (skippedEmptyVoteIds.length > 0
            ? ` (${skippedEmptyVoteIds.length} empty responses preserved)`
            : ''),
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      await this.syncLog.fail(log.id, msg);
      console.error(`[MemberVoteSync] Failed: ${msg}`);
      throw error;
    }
  }

  private mapResult(resultVoteMod: string): string {
    if (!resultVoteMod) return 'absent';
    const r = resultVoteMod.trim();
    if (r === '찬성') return 'yes';
    if (r === '반대') return 'no';
    if (r === '기권') return 'abstain';
    return 'absent';
  }
}
