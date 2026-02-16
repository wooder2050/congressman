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

export class MemberVoteSyncService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly api: AssemblyApiService,
    private readonly syncLog: SyncLogService,
  ) {}

  async syncMemberVotes(termId: number): Promise<void> {
    const log = await this.syncLog.start('member-votes', termId);

    try {
      const votes = await this.prisma.vote.findMany({
        where: { termId },
        select: { id: true },
        orderBy: { procDate: 'desc' },
      });

      console.log(`[MemberVoteSync] Found ${votes.length} votes for term ${termId}`);

      // Build set of known member IDs for this term
      const memberTerms = await this.prisma.memberTerm.findMany({
        where: { termId },
        select: { memberId: true },
      });
      const memberIds = new Set(memberTerms.map((mt) => mt.memberId));

      // Delete existing member votes for this term
      console.log(`[MemberVoteSync] Deleting existing member votes...`);
      await this.prisma.memberVote.deleteMany({
        where: { vote: { termId } },
      });

      let totalInserted = 0;

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

          for (let j = 0; j < data.length; j += BATCH_SIZE) {
            const batch = data.slice(j, j + BATCH_SIZE);
            await this.prisma.memberVote.createMany({ data: batch, skipDuplicates: true });
          }

          totalInserted += data.length;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn(`[MemberVoteSync] Failed for vote ${vote.id}: ${msg}`);
        }

        if ((i + 1) % 50 === 0 || i === votes.length - 1) {
          console.log(
            `[MemberVoteSync]   Progress: ${i + 1}/${votes.length} votes (${totalInserted} records)`,
          );
        }

        await new Promise((r) => setTimeout(r, API_DELAY_MS));
      }

      await this.syncLog.complete(log.id, totalInserted);
      console.log(`[MemberVoteSync] Completed: ${totalInserted} records from ${votes.length} votes`);
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
