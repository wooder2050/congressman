import { PrismaClient } from '@prisma/client';
import { AssemblyApiService } from './assembly-api.service';

const BASE_URL = 'https://www.assembly.go.kr';

interface MemberApiRow {
  MONA_CD: string;
  HG_NM: string;
  ENG_NM: string;
}

export class PhotoSyncService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly api: AssemblyApiService,
  ) {}

  async syncPhotos(termId: number): Promise<void> {
    const rows = await this.api.fetchAll<MemberApiRow>('nwvrqwxyaytdsfvhu', {
      AGE: String(termId),
    });

    console.log(`[PhotoSync] Fetched ${rows.length} members for term ${termId}`);

    let updated = 0;
    let failed = 0;

    for (const row of rows) {
      const engName = row.ENG_NM?.replace(/\s+/g, '');
      if (!engName) {
        console.warn(`[PhotoSync] No ENG_NM for ${row.HG_NM} (${row.MONA_CD}), skipping`);
        failed++;
        continue;
      }

      try {
        const photoUrl = await this.fetchPhotoUrl(termId, engName);
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
          console.warn(`[PhotoSync] No photo found for ${row.HG_NM} (${engName})`);
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

  private async fetchPhotoUrl(termId: number, engName: string): Promise<string | null> {
    const ordinal = this.getOrdinal(termId);
    const url = `${BASE_URL}/members/${ordinal}/${engName}`;

    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)',
        Accept: 'text/html',
      },
    });

    if (!res.ok) return null;

    const html = await res.text();
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
