import { PrismaClient } from '@prisma/client';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { NecApiService } from './nec-api.service';
import { SyncLogService } from './sync-log.service';

const NEC_ELECTION_ID = '0020260603';
const NEC_SG_ID = '20260603';
const NEC_BY_ELECTION_TYPE = '2';
const BUCKET = 'local-election-photos';
const CANDIDATE_DETAIL_URL = (huboid: string) =>
  `http://info.nec.go.kr/electioninfo/candidate_detail_info.xhtml?electionId=${NEC_ELECTION_ID}&huboId=${huboid}`;

const HTTP_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

interface NecByElectionCandidate {
  huboid: string;
  name: string;
  sdName: string;
  wiwName: string;
  sggName: string;
  giho: string; // 기호 번호
}

function extractThumbnailPath(html: string, huboid: string): string | null {
  const re = new RegExp(
    `/photo_20260603/Gsg\\d+/Hb${huboid}/gicho/thumbnail\\.${huboid}\\.(?:JPG|JPEG|PNG|GIF|jpg|jpeg|png|gif)`,
  );
  const m = html.match(re);
  return m ? m[0] : null;
}

const SIDO_SHORT: Record<string, string> = {
  서울특별시: '서울',
  부산광역시: '부산',
  대구광역시: '대구',
  인천광역시: '인천',
  광주광역시: '광주',
  대전광역시: '대전',
  울산광역시: '울산',
  세종특별자치시: '세종',
  경기도: '경기',
  강원특별자치도: '강원',
  강원도: '강원',
  충청북도: '충북',
  충청남도: '충남',
  전북특별자치도: '전북',
  전라북도: '전북',
  전라남도: '전남',
  경상북도: '경북',
  경상남도: '경남',
  제주특별자치도: '제주',
};

function normalizeDistrict(sdName: string, _wiwName: string, sggName: string): string {
  const sdShort = SIDO_SHORT[sdName] ?? sdName;
  return `${sdShort} ${sggName}`.trim();
}

export class ByElectionPhotoSyncService {
  private readonly supabase: SupabaseClient;

  constructor(
    private readonly prisma: PrismaClient,
    private readonly necApi: NecApiService,
    private readonly syncLog: SyncLogService,
  ) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing');
    }
    this.supabase = createClient(url, key);
  }

  async syncPhotos(): Promise<void> {
    const logRow = await this.syncLog.start('by-election-photos');

    try {
      // 1. NEC API로 재보궐 후보 전체 조회
      const necRows = await this.necApi.fetchAll<NecByElectionCandidate>(
        'PofelcddInfoInqireService',
        'getPofelcddRegistSttusInfoInqire',
        { sgId: NEC_SG_ID, sgTypecode: NEC_BY_ELECTION_TYPE },
      );
      console.log(`[ByElectionPhotoSync] NEC API: ${necRows.length} candidates fetched`);

      // 2. DB 후보 전체 조회 (district 이름과 함께)
      const dbCandidates = await this.prisma.candidate.findMany({
        select: {
          id: true,
          name: true,
          huboid: true,
          photoUrl: true,
          candidateNumber: true,
          district: { select: { district: true } },
        },
      });
      console.log(`[ByElectionPhotoSync] DB: ${dbCandidates.length} candidates`);

      // 3. (선거구명, 이름) → NEC row 매핑
      const necByKey = new Map<string, NecByElectionCandidate>();
      for (const row of necRows) {
        const dist = normalizeDistrict(row.sdName, row.wiwName, row.sggName);
        necByKey.set(`${dist}|${row.name}`, row);
      }

      let huboidUpdated = 0;
      let candidateNumberUpdated = 0;
      let photoUpdated = 0;
      let skipped = 0;
      let failed = 0;
      const unmatchedDb: string[] = [];

      for (const c of dbCandidates) {
        const districtName = c.district.district;
        const key = `${districtName}|${c.name}`;
        const necRow = necByKey.get(key);

        if (!necRow) {
          unmatchedDb.push(`${districtName} / ${c.name}`);
          continue;
        }

        // huboid + candidateNumber 채우기 (둘 다 비어있을 때만)
        const updates: { huboid?: string; candidateNumber?: number } = {};
        if (!c.huboid && necRow.huboid) updates.huboid = necRow.huboid;
        const giho = necRow.giho ? parseInt(necRow.giho, 10) : null;
        if (c.candidateNumber === null && giho !== null && Number.isFinite(giho)) {
          updates.candidateNumber = giho;
        }
        if (Object.keys(updates).length > 0) {
          await this.prisma.candidate.update({
            where: { id: c.id },
            data: updates,
          });
          if (updates.huboid) huboidUpdated++;
          if (updates.candidateNumber !== undefined) candidateNumberUpdated++;
        }

        // 사진 이미 있으면 skip
        if (c.photoUrl) {
          skipped++;
          continue;
        }

        // 사진 다운로드 + 업로드
        try {
          const result = await this.fetchAndUploadPhoto(c.id, necRow.huboid);
          if (result === 'updated') photoUpdated++;
          else if (result === 'skipped') skipped++;
          else failed++;
        } catch (e) {
          failed++;
          console.error(
            `[ByElectionPhotoSync] ${c.name}(${necRow.huboid}) failed:`,
            (e as Error).message,
          );
        }
      }

      console.log(
        `[ByElectionPhotoSync] Completed: huboid=+${huboidUpdated} candidateNumber=+${candidateNumberUpdated} photo=+${photoUpdated} skipped=${skipped} failed=${failed}`,
      );
      if (unmatchedDb.length > 0) {
        console.log(
          `[ByElectionPhotoSync] DB ↔ NEC 미매칭 ${unmatchedDb.length}건:\n  - ${unmatchedDb.join('\n  - ')}`,
        );
      }

      await this.syncLog.complete(logRow.id, huboidUpdated + candidateNumberUpdated + photoUpdated);
    } catch (err) {
      await this.syncLog.fail(logRow.id, (err as Error).message);
      throw err;
    }
  }

  private async fetchAndUploadPhoto(
    candidateId: number,
    huboid: string,
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
      console.error(`[ByElectionPhotoSync] upload ${huboid} failed:`, uploadErr.message);
      return 'failed';
    }

    const { data: publicUrlData } = this.supabase.storage.from(BUCKET).getPublicUrl(objectPath);
    await this.prisma.candidate.update({
      where: { id: candidateId },
      data: { photoUrl: publicUrlData.publicUrl },
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
