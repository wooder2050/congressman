import { PrismaClient } from '@prisma/client';
import { AssemblyApiService } from './assembly-api.service';
import { SyncLogService } from './sync-log.service';

/** 본회의 일정 API 응답 row */
interface PlenaryScheduleRow {
  MEETINGSESSION: string;
  CHA: string;
  TITLE: string;
  MEETTING_DATE: string;
  MEETTING_TIME: string;
  LINK_URL: string;
  UNIT_CD: string;
  UNIT_NM: string;
  CONTS: string;
}

/** 위원회별 일정 API 응답 row */
interface CommitteeScheduleRow {
  MEETING_DATE: string;
  MEETING_TIME: string;
  SESS: string;
  DEGREE: string;
  TITLE: string;
  COMMITTEE_NAME: string;
  LINK_URL2: string;
  UNIT_CD: string;
  UNIT_NM: string;
  HR_DEPT_CD: string;
  ANGUN: string;
}

const BATCH_SIZE = 500;

export class ScheduleSyncService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly api: AssemblyApiService,
    private readonly syncLog: SyncLogService,
  ) {}

  async syncSchedules(termId: number): Promise<void> {
    const log = await this.syncLog.start('schedules', termId);

    try {
      const unitCd = `1000${termId}`;

      const [plenaryRows, committeeRows] = await Promise.all([
        this.api.fetchAll<PlenaryScheduleRow>('nekcaiymatialqlxr', { UNIT_CD: unitCd }),
        this.api.fetchAll<CommitteeScheduleRow>('nrsldhjpaemrmolla', { UNIT_CD: unitCd }),
      ]);

      console.log(
        `[ScheduleSync] Fetched ${plenaryRows.length} plenary + ${committeeRows.length} committee schedules`,
      );

      // fetchAll은 strict라 API 장애·부분 응답이면 이미 throw된다. 여기 도달한 빈 배열은 "정상 0건"이지만,
      // 본회의·위원회 일정이 한쪽이라도 0이면 term 전체 스냅샷이 불완전할 수 있으므로 삭제하지 않고 보존한다.
      // (전체 교체는 양쪽 모두 데이터가 있을 때만 수행). throw해 sync를 실패로 기록 → 이상을 드러낸다.
      if (plenaryRows.length === 0 || committeeRows.length === 0) {
        throw new Error(
          `Incomplete schedule snapshot (plenary=${plenaryRows.length}, committee=${committeeRows.length}) — skipping replacement to preserve existing data`,
        );
      }

      const plenaryData = plenaryRows.map((row) => ({
        type: 'plenary' as const,
        title: row.TITLE ?? '',
        meetingDate: row.MEETTING_DATE ?? '',
        meetingTime: row.MEETTING_TIME ?? '',
        session: row.MEETINGSESSION ?? '',
        degree: row.CHA ?? '',
        committeeName: '',
        agenda: this.cleanHtml(row.CONTS ?? ''),
        linkUrl: row.LINK_URL ?? '',
        termId,
      }));

      const committeeData = committeeRows.map((row) => ({
        type: 'committee' as const,
        title: row.TITLE ?? '',
        meetingDate: row.MEETING_DATE ?? '',
        meetingTime: row.MEETING_TIME ?? '',
        session: row.SESS ?? '',
        degree: String(row.DEGREE ?? ''),
        committeeName: row.COMMITTEE_NAME ?? '',
        agenda: this.cleanHtml(row.ANGUN ?? ''),
        linkUrl: row.LINK_URL2 ?? '',
        termId,
      }));

      const allData = [...plenaryData, ...committeeData];

      // 트랜잭션으로 삭제 + 재삽입 (API 데이터 확보 후에만 실행)
      // 1,700건 이상 batch insert가 기본 5초 interactive transaction 한도를 넘기므로 timeout 상향
      await this.prisma.$transaction(
        async (tx) => {
          await tx.schedule.deleteMany({ where: { termId } });
          for (let i = 0; i < allData.length; i += BATCH_SIZE) {
            const batch = allData.slice(i, i + BATCH_SIZE);
            await tx.schedule.createMany({ data: batch, skipDuplicates: true });
          }
        },
        { timeout: 60000 },
      );
      console.log(`[ScheduleSync]   Inserted ${allData.length} records`);

      await this.syncLog.complete(log.id, allData.length);
      console.log(`[ScheduleSync] Completed: ${allData.length} records`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      await this.syncLog.fail(log.id, msg);
      console.error(`[ScheduleSync] Failed: ${msg}`);
      throw error;
    }
  }

  private cleanHtml(text: string): string {
    return text
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .trim();
  }
}
