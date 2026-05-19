import { PrismaClient } from '@prisma/client';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { SyncLogService } from './sync-log.service';

const NEC_ELECTION_ID = '0020260603';
const BUCKET = 'local-election-photos';
const CANDIDATE_DETAIL_URL = (huboid: string) =>
  `http://info.nec.go.kr/electioninfo/candidate_detail_info.xhtml?electionId=${NEC_ELECTION_ID}&huboId=${huboid}`;

const HTTP_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

/** 후보자 상세 HTML에서 사진 경로(/photo_20260603/Gsg.../thumbnail.{huboid}.{ext}) 추출 */
function extractThumbnailPath(html: string, huboid: string): string | null {
  const re = new RegExp(
    `/photo_20260603/Gsg\\d+/Hb${huboid}/gicho/thumbnail\\.${huboid}\\.(?:JPG|JPEG|PNG|GIF|jpg|jpeg|png|gif)`,
  );
  const m = html.match(re);
  return m ? m[0] : null;
}

export class LocalElectionPhotoSyncService {
  private readonly supabase: SupabaseClient;

  constructor(
    private readonly prisma: PrismaClient,
    private readonly syncLog: SyncLogService,
  ) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing');
    }
    this.supabase = createClient(url, key);
  }

  async syncPhotos(options: { limit?: number; concurrency?: number } = {}): Promise<void> {
    const { limit, concurrency = 8 } = options;
    const logRow = await this.syncLog.start('local-election-photos');

    try {
      const candidates = await this.prisma.localElectionCandidate.findMany({
        where: {
          huboid: { not: '' },
          photoUrl: null,
        },
        select: { id: true, huboid: true, name: true },
        take: limit,
      });

      console.log(`[LocalPhotoSync] ${candidates.length} candidates pending`);

      let updated = 0;
      let skipped = 0;
      let failed = 0;
      let processed = 0;

      const queue = [...candidates];
      const workers = Array.from({ length: concurrency }, async () => {
        while (queue.length > 0) {
          const c = queue.shift();
          if (!c) break;
          processed++;
          try {
            const result = await this.processOne(c.id, c.huboid, c.name);
            if (result === 'updated') updated++;
            else if (result === 'skipped') skipped++;
            else failed++;
          } catch (e) {
            failed++;
            console.error(`[LocalPhotoSync] ${c.name}(${c.huboid}) failed:`, (e as Error).message);
          }
          if (processed % 100 === 0) {
            console.log(
              `[LocalPhotoSync] progress ${processed}/${candidates.length} (updated=${updated} skipped=${skipped} failed=${failed})`,
            );
          }
        }
      });

      await Promise.all(workers);

      console.log(
        `[LocalPhotoSync] Completed: updated=${updated} skipped=${skipped} failed=${failed} total=${candidates.length}`,
      );

      await this.syncLog.complete(logRow.id, updated);
    } catch (err) {
      await this.syncLog.fail(logRow.id, (err as Error).message);
      throw err;
    }
  }

  private async processOne(
    candidateId: number,
    huboid: string,
    _name: string,
  ): Promise<'updated' | 'skipped' | 'failed'> {
    const detailHtml = await this.fetchText(CANDIDATE_DETAIL_URL(huboid));
    if (!detailHtml) return 'failed';

    const thumbPath = extractThumbnailPath(detailHtml, huboid);
    if (!thumbPath) return 'skipped';

    const imageUrl = `https://info.nec.go.kr${thumbPath}`;
    const buf = await this.fetchBinary(imageUrl);
    if (!buf || buf.byteLength < 1000) return 'failed';

    const lower = thumbPath.toLowerCase();
    const ext = lower.endsWith('.png') ? 'png' : lower.endsWith('.gif') ? 'gif' : 'jpg';
    const contentType = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : 'image/jpeg';
    const objectPath = `${huboid}.${ext}`;
    const { error: uploadErr } = await this.supabase.storage.from(BUCKET).upload(objectPath, buf, {
      contentType,
      upsert: true,
    });
    if (uploadErr) {
      console.error(`[LocalPhotoSync] upload ${huboid} failed:`, uploadErr.message);
      return 'failed';
    }

    const { data: publicUrlData } = this.supabase.storage.from(BUCKET).getPublicUrl(objectPath);
    const publicUrl = publicUrlData.publicUrl;

    await this.prisma.localElectionCandidate.update({
      where: { id: candidateId },
      data: { photoUrl: publicUrl },
    });

    return 'updated';
  }

  private async fetchText(url: string): Promise<string | null> {
    try {
      const res = await fetch(url, { headers: HTTP_HEADERS, redirect: 'follow' });
      if (!res.ok) return null;
      return await res.text();
    } catch {
      return null;
    }
  }

  private async fetchBinary(url: string): Promise<ArrayBuffer | null> {
    try {
      const res = await fetch(url, { headers: HTTP_HEADERS, redirect: 'follow' });
      if (!res.ok) return null;
      const ct = res.headers.get('content-type') ?? '';
      if (!ct.startsWith('image/')) return null;
      return await res.arrayBuffer();
    } catch {
      return null;
    }
  }
}
