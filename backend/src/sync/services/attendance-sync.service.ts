import { PrismaClient } from '@prisma/client';
import { SyncLogService } from './sync-log.service';

/**
 * MemberVote 데이터에서 출석 통계를 계산하여 Attendance 테이블에 저장.
 * 국회 출석 전용 API가 없으므로, 본회의 표결 참여 데이터를 기반으로 계산:
 *   - totalSessions = 해당 대수의 전체 표결 수
 *   - attended = yes + no + abstain (투표에 참여한 횟수)
 *   - absent = absent (불참)
 *   - leave / travel = 0 (API에서 구분 불가)
 *   - rate = attended / totalSessions * 100
 */
export class AttendanceSyncService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly syncLog: SyncLogService,
  ) {}

  async syncAttendance(termId: number): Promise<void> {
    const log = await this.syncLog.start('attendance', termId);

    try {
      // 해당 대수의 전체 표결 수
      const totalVotes = await this.prisma.vote.count({ where: { termId } });
      if (totalVotes === 0) {
        console.log(`[AttendanceSync] No votes found for term ${termId}, skipping`);
        await this.syncLog.complete(log.id, 0);
        return;
      }

      console.log(`[AttendanceSync] Total votes for term ${termId}: ${totalVotes}`);

      // 의원별 표결 결과 집계
      const stats = await this.prisma.$queryRaw<
        { memberId: string; yes: bigint; no: bigint; abstain: bigint; absent: bigint }[]
      >`
        SELECT
          "memberId",
          COUNT(*) FILTER (WHERE result = 'yes') AS yes,
          COUNT(*) FILTER (WHERE result = 'no') AS no,
          COUNT(*) FILTER (WHERE result = 'abstain') AS abstain,
          COUNT(*) FILTER (WHERE result = 'absent') AS absent
        FROM "MemberVote" mv
        JOIN "Vote" v ON mv."voteId" = v.id
        WHERE v."termId" = ${termId}
        GROUP BY "memberId"
      `;

      console.log(`[AttendanceSync] Found stats for ${stats.length} members`);

      // 표결 기록이 있는 의원 집계를 Map으로 변환
      const statsMap = new Map<
        string,
        { yes: bigint; no: bigint; abstain: bigint; absent: bigint }
      >();
      for (const row of stats) {
        statsMap.set(row.memberId, row);
      }

      // 해당 대수의 모든 의원 조회 (표결 이력이 없는 의원 포함)
      const allMembers = await this.prisma.memberTerm.findMany({
        where: { termId },
        select: { memberId: true },
      });

      console.log(`[AttendanceSync] Total members for term ${termId}: ${allMembers.length}`);

      let count = 0;
      for (const { memberId } of allMembers) {
        const row = statsMap.get(memberId);
        const attended = row ? Number(row.yes) + Number(row.no) + Number(row.abstain) : 0;
        const absent = row ? Number(row.absent) : 0;
        const rate = totalVotes > 0 ? Math.round((attended / totalVotes) * 10000) / 100 : 0;

        await this.prisma.attendance.upsert({
          where: { memberId_termId: { memberId, termId } },
          update: {
            totalSessions: totalVotes,
            attended,
            absent,
            leave: 0,
            travel: 0,
            rate,
          },
          create: {
            memberId,
            termId,
            totalSessions: totalVotes,
            attended,
            absent,
            leave: 0,
            travel: 0,
            rate,
          },
        });

        count++;
        if (count % 50 === 0) {
          console.log(`[AttendanceSync]   Processed ${count}/${allMembers.length} members`);
        }
      }

      await this.syncLog.complete(log.id, count);
      console.log(`[AttendanceSync] Completed: ${count} records (${totalVotes} votes)`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      await this.syncLog.fail(log.id, msg);
      console.error(`[AttendanceSync] Failed: ${msg}`);
      throw error;
    }
  }
}
