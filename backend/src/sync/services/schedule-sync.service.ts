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

      // 기존 데이터 삭제 후 재삽입 (일정은 변경/삭제될 수 있으므로)
      await this.prisma.schedule.deleteMany({ where: { termId } });

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

      for (let i = 0; i < allData.length; i += BATCH_SIZE) {
        const batch = allData.slice(i, i + BATCH_SIZE);
        await this.prisma.schedule.createMany({ data: batch, skipDuplicates: true });
        console.log(
          `[ScheduleSync]   ${Math.min(i + BATCH_SIZE, allData.length)}/${allData.length}`,
        );
      }

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
