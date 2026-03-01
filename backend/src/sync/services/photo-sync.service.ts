import { PrismaClient } from '@prisma/client';
import { AssemblyApiService } from './assembly-api.service';

const BASE_URL = 'https://www.assembly.go.kr';

const FETCH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html',
  Cookie: 'NAHOME_SUCCESS=true',
};

interface MemberApiRow {
  MONA_CD: string;
  HG_NM: string;
  ENG_NM: string;
}

/** 현재 국회 대수 — 현직 API는 이 대수에만 사용 */
const CURRENT_TERM = 22;

export class PhotoSyncService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly api: AssemblyApiService,
  ) {}

  async syncPhotos(termId: number): Promise<void> {
    let rows: MemberApiRow[];
    if (termId === CURRENT_TERM) {
      rows = await this.api.fetchAll<MemberApiRow>('nwvrqwxyaytdsfvhu', {});
    } else {
      rows = await this.api.fetchAll<MemberApiRow>('npffdutiapkzbfyvr', {
        UNIT_CD: String(100000 + termId),
      });
    }

    console.log(`[PhotoSync] Fetched ${rows.length} members for term ${termId}`);

    let updated = 0;
    let failed = 0;

    for (const row of rows) {
      const engName = row.ENG_NM?.replace(/\s+/g, '');

      try {
        // Primary: /members/{ordinal}/{ENG_NM} page
        let photoUrl = engName ? await this.fetchPhotoFromMemberPage(termId, engName) : null;

        // Fallback: /portal/assm/assmMemb/member.do?monaCd={MONA_CD} page
        if (!photoUrl) {
          console.log(
            `[PhotoSync] Primary failed for ${row.HG_NM}, trying fallback (monaCd=${row.MONA_CD})`,
          );
          photoUrl = await this.fetchPhotoFromPortal(row.MONA_CD, termId);
        }

        if (photoUrl) {
          await this.prisma.member.update({
            where: { id: row.MONA_CD },
            data: { photoUrl },
          });
          updated++;
          if (updated % 20 === 0) {
            console.log(`[PhotoSync]   Updated ${updated}/${rows.length} photos`);
          }
        } else {
          console.warn(`[PhotoSync] No photo found for ${row.HG_NM} (${row.MONA_CD})`);
          failed++;
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.warn(`[PhotoSync] Failed for ${row.HG_NM}: ${msg}`);
        failed++;
      }

      // rate limiting: 200ms between requests
      await new Promise((r) => setTimeout(r, 200));
    }

    console.log(`[PhotoSync] Completed: ${updated} updated, ${failed} failed`);
  }

  /**
   * Primary method: fetch from /members/{ordinal}/{ENG_NM} page
   */
  private async fetchPhotoFromMemberPage(termId: number, engName: string): Promise<string | null> {
    const ordinal = this.getOrdinal(termId);
    const url = `${BASE_URL}/members/${ordinal}/${engName}`;

    const res = await fetch(url, { headers: FETCH_HEADERS });
    if (!res.ok) return null;

    return this.extractPhotoUrl(await res.text());
  }

  /**
   * Fallback method: fetch from /portal/assm/assmMemb/member.do?monaCd={MONA_CD}
   * This works even when the /members/{ordinal}/{ENG_NM} page doesn't exist.
   */
  private async fetchPhotoFromPortal(monaCd: string, termId: number): Promise<string | null> {
    const url = `${BASE_URL}/portal/assm/assmMemb/member.do?monaCd=${monaCd}&st=${termId}&viewType=CONTBODY`;

    const res = await fetch(url, { headers: FETCH_HEADERS });
    if (!res.ok) return null;

    return this.extractPhotoUrl(await res.text());
  }

  /**
   * Extract photo URL from HTML background-image pattern
   */
  private extractPhotoUrl(html: string): string | null {
    // Pattern: background-image: url('/static/portal/img/openassm/new/{hash}.jpg')
    const match = html.match(
      /background-image:\s*url\(['"]?(\/static\/portal\/img\/openassm\/[^'")\s]+)['"]?\)/,
    );
    if (!match) return null;

    return `${BASE_URL}${match[1]}`;
  }

  private getOrdinal(termId: number): string {
    const ordinals: Record<number, string> = {
      22: '22nd',
      21: '21st',
      20: '20th',
      19: '19th',
      18: '18th',
    };
    return ordinals[termId] ?? `${termId}th`;
  }
}
