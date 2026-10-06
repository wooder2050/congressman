import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** 공개 DTO — 편집 메모·노출 플래그는 내보내지 않는다 */
export interface YouTubeShortResponse {
  videoId: string;
  title: string;
  description: string;
  publishedAt: string;
  durationSeconds: number | null;
  committee: string | null;
  sourceUrl: string | null;
}

interface ShortRow extends YouTubeShortResponse {
  showOnHome: boolean;
}

export type ShortsPlacement = 'hub' | 'committee' | 'home';

/** 허용 이슈만 받는다 — 임의 문자열로 캐시 키가 무한히 늘지 않게 */
export const SHORTS_ISSUES = ['audit-2026'] as const;
export type ShortsIssue = (typeof SHORTS_ISSUES)[number];

@Injectable()
export class YouTubeShortsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 이슈의 공개 영상 목록을 읽고 위원회·홈 필터와 limit은 메모리에서 적용한다.
   * Redis 캐시는 두지 않는다 — 프론트 ISR(1시간)이 이미 캐시해 조회가 시간당 몇 번이고,
   * 캐시를 두면 등록 CLI의 키 삭제와 동시 조회가 겹칠 때 숨긴 영상이 다시 캐시될 수 있다
   * (2026-10-06 codex 리뷰).
   */
  async find(params: {
    issueSlug: ShortsIssue;
    placement: ShortsPlacement;
    committee?: string;
    limit: number;
  }): Promise<YouTubeShortResponse[]> {
    const all = await this.listActive(params.issueSlug);
    const filtered = all.filter((s) => {
      if (params.placement === 'home') return s.showOnHome;
      if (params.placement === 'committee') return s.committee === params.committee;
      return true;
    });
    return filtered.slice(0, params.limit).map(({ showOnHome: _home, ...rest }) => rest);
  }

  private async listActive(issueSlug: string): Promise<ShortRow[]> {
    const now = new Date();
    const rows = await this.prisma.youTubeShort.findMany({
      where: { issueSlug, active: true, publishedAt: { lte: now } },
      // sortOrder 오름차순(음수 = 고정) → 최신순 → videoId(동률 안정화)
      orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }, { videoId: 'asc' }],
    });
    return rows.map((r) => ({
      videoId: r.videoId,
      title: r.title,
      description: r.description,
      publishedAt: r.publishedAt.toISOString(),
      durationSeconds: r.durationSeconds,
      committee: r.committee,
      sourceUrl: r.sourceUrl,
      showOnHome: r.showOnHome,
    }));
  }
}
