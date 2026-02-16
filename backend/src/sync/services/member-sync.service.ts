import { PrismaClient } from '@prisma/client';
import { AssemblyApiService } from './assembly-api.service';
import { SyncLogService } from './sync-log.service';
import { getPartyId, getPartyColor } from '../constants/party-map';
import { parseElectedCount } from '../constants/elected-count-map';

/** 국회의원 인적사항 API 응답 row */
interface MemberApiRow {
  MONA_CD: string;
  HG_NM: string;
  HJ_NM: string;
  ENG_NM: string;
  BTH_DATE: string;
  POLY_NM: string;
  ORIG_NM: string;
  ELECT_GBN_NM: string;
  CMITS: string;
  REELE_GBN_NM: string;
  UNITS: string;
  SEX_GBN_NM: string;
  E_MAIL: string;
  TEL_NO: string;
  ASSEM_ADDR: string;
  MEM_TITLE: string;
  JOB_RES_NM: string;
}

export class MemberSyncService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly api: AssemblyApiService,
    private readonly syncLog: SyncLogService,
  ) {}

  async syncMembers(termId: number): Promise<void> {
    const log = await this.syncLog.start('members', termId);

    try {
      const rows = await this.api.fetchAll<MemberApiRow>('nwvrqwxyaytdsfvhu', {
        AGE: String(termId),
      });

      console.log(`[MemberSync] Fetched ${rows.length} member records for term ${termId}`);

      await this.ensurePartiesExist(rows);

      let count = 0;
      for (const row of rows) {
        await this.upsertMember(row, termId);
        count++;
        if (count % 50 === 0) {
          console.log(`[MemberSync]   Processed ${count}/${rows.length} members`);
        }
      }

      await this.syncLog.complete(log.id, count);
      console.log(`[MemberSync] Completed: ${count} records`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      await this.syncLog.fail(log.id, msg);
      console.error(`[MemberSync] Failed: ${msg}`);
      throw error;
    }
  }

  private async ensurePartiesExist(rows: MemberApiRow[]): Promise<void> {
    const uniquePartyNames = [...new Set(rows.map((r) => r.POLY_NM))];

    for (const partyName of uniquePartyNames) {
      const partyId = getPartyId(partyName);
      const existing = await this.prisma.party.findUnique({ where: { id: partyId } });

      if (!existing) {
        const color = getPartyColor(partyId);
        console.warn(
          `[MemberSync] Unknown party "${partyName}" → auto-creating "${partyId}" (${color})`,
        );
        await this.prisma.party.create({
          data: { id: partyId, name: partyName, shortName: partyName, color },
        });
      }
    }
  }

  private async upsertMember(row: MemberApiRow, termId: number): Promise<void> {
    const memberId = row.MONA_CD;
    const birthDate = this.parseBirthDate(row.BTH_DATE);
    const electedCount = parseElectedCount(row.REELE_GBN_NM);
    const partyId = getPartyId(row.POLY_NM);
    const proportional = row.ELECT_GBN_NM === '비례대표';
    const district = proportional ? '' : (row.ORIG_NM ?? '');
    const committees = row.CMITS
      ? row.CMITS.split(',')
          .map((c) => c.trim())
          .filter(Boolean)
      : [];
    const photoUrl = `https://www.assembly.go.kr/photo/9771/${memberId}.jpg`;

    await this.prisma.member.upsert({
      where: { id: memberId },
      update: { name: row.HG_NM, photoUrl, birthDate, electedCount },
      create: { id: memberId, name: row.HG_NM, photoUrl, birthDate, electedCount },
    });

    await this.prisma.memberTerm.upsert({
      where: { memberId_termId: { memberId, termId } },
      update: { partyId, district, proportional, committees },
      create: { memberId, termId, partyId, district, proportional, committees },
    });
  }

  private parseBirthDate(raw: string | null): string | null {
    if (!raw) return null;
    const cleaned = raw.replace(/[^0-9]/g, '');
    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`;
    }
    return raw;
  }
}
