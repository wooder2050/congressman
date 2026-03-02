import { type Prisma, PrismaClient } from '@prisma/client';
import { AssemblyApiService } from './assembly-api.service';
import { SyncLogService } from './sync-log.service';

/** ncwgseseafwbuheph (위원회 회의록) API 응답 row */
interface MinutesApiRow {
  CONF_ID: string;
  CONFER_NUM: string;
  TITLE: string;
  CLASS_NAME: string;
  DAE_NUM: string;
  COMM_NAME: string;
  CONF_DATE: string;
  SUB_NAME: string;
  VOD_LINK_URL: string;
  CONF_LINK_URL: string;
  PDF_LINK_URL: string;
}

interface AgendaItem {
  subName: string;
  vodLinkUrl: string;
  confLinkUrl: string;
  pdfLinkUrl: string;
}

const BATCH_SIZE = 500;

export class MeetingMinutesSyncService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly api: AssemblyApiService,
    private readonly syncLog: SyncLogService,
  ) {}

  async syncMeetingMinutes(termId: number): Promise<void> {
    const log = await this.syncLog.start('meeting-minutes', termId);

    try {
      const rows = await this.api.fetchAll<MinutesApiRow>(
        'ncwgseseafwbuheph',
        { DAE_NUM: String(termId), CONF_DATE: '20' },
        1000,
      );

      console.log(`[MeetingMinutesSync] Fetched ${rows.length} rows for term ${termId}`);

      // CONF_ID 기준 그룹핑 (하나의 회의에 여러 안건)
      const grouped = new Map<string, { row: MinutesApiRow; agendas: AgendaItem[] }>();

      for (const row of rows) {
        const key = row.CONF_ID;
        if (!key) continue;

        const agenda: AgendaItem = {
          subName: row.SUB_NAME || '',
          vodLinkUrl: row.VOD_LINK_URL || '',
          confLinkUrl: row.CONF_LINK_URL || '',
          pdfLinkUrl: row.PDF_LINK_URL || '',
        };

        const existing = grouped.get(key);
        if (existing) {
          existing.agendas.push(agenda);
        } else {
          grouped.set(key, { row, agendas: [agenda] });
        }
      }

      console.log(`[MeetingMinutesSync] Grouped into ${grouped.size} meetings`);

      await this.batchUpsert(grouped, termId);

      await this.syncLog.complete(log.id, grouped.size);
      console.log(`[MeetingMinutesSync] Completed: ${grouped.size} meetings`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      await this.syncLog.fail(log.id, msg);
      console.error(`[MeetingMinutesSync] Failed: ${msg}`);
      throw error;
    }
  }

  private async batchUpsert(
    grouped: Map<string, { row: MinutesApiRow; agendas: AgendaItem[] }>,
    termId: number,
  ): Promise<void> {
    // 기존 데이터 조회
    const existingRecords = await this.prisma.meetingMinutes.findMany({
      where: { termId },
      select: {
        id: true,
        conferNum: true,
        title: true,
        className: true,
        committeeName: true,
        confDate: true,
        agendas: true,
      },
    });
    const existingMap = new Map(existingRecords.map((r) => [r.id, r]));

    const newEntries: { row: MinutesApiRow; agendas: AgendaItem[] }[] = [];
    const updateEntries: { row: MinutesApiRow; agendas: AgendaItem[] }[] = [];

    for (const [confId, entry] of grouped) {
      const existing = existingMap.get(confId);
      if (!existing) {
        newEntries.push(entry);
      } else {
        // 안건 내용까지 비교 (길이가 같아도 텍스트/링크가 변경될 수 있음)
        const newConfDate = this.normalizeDate(entry.row.CONF_DATE);
        if (
          existing.conferNum !== (entry.row.CONFER_NUM || '') ||
          existing.title !== entry.row.TITLE ||
          existing.className !== (entry.row.CLASS_NAME || '') ||
          existing.committeeName !== (entry.row.COMM_NAME || '') ||
          existing.confDate !== newConfDate ||
          JSON.stringify(existing.agendas) !== JSON.stringify(entry.agendas)
        ) {
          updateEntries.push(entry);
        }
      }
    }

    console.log(
      `[MeetingMinutesSync]   New: ${newEntries.length}, Changed: ${updateEntries.length}, Unchanged: ${grouped.size - newEntries.length - updateEntries.length}`,
    );

    // 신규 회의록 추가
    if (newEntries.length > 0) {
      for (let i = 0; i < newEntries.length; i += BATCH_SIZE) {
        const batch = newEntries.slice(i, i + BATCH_SIZE);
        await this.prisma.meetingMinutes.createMany({
          data: batch.map(({ row, agendas }) => ({
            id: row.CONF_ID,
            conferNum: row.CONFER_NUM || '',
            title: row.TITLE || '',
            className: row.CLASS_NAME || '',
            committeeName: row.COMM_NAME || '',
            confDate: this.normalizeDate(row.CONF_DATE),
            agendas: agendas as unknown as Prisma.InputJsonValue,
            termId,
          })),
          skipDuplicates: true,
        });
      }
    }

    // 변경된 회의록 업데이트
    for (const { row, agendas } of updateEntries) {
      await this.prisma.meetingMinutes.update({
        where: { id: row.CONF_ID },
        data: {
          conferNum: row.CONFER_NUM || '',
          title: row.TITLE || '',
          className: row.CLASS_NAME || '',
          committeeName: row.COMM_NAME || '',
          confDate: this.normalizeDate(row.CONF_DATE),
          agendas: agendas as unknown as Prisma.InputJsonValue,
        },
      });
    }
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
