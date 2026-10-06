import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  SHORTS_ISSUES,
  ShortsIssue,
  ShortsPlacement,
  YouTubeShortResponse,
  YouTubeShortsService,
} from './youtube-shorts.service';

const PLACEMENTS: ShortsPlacement[] = ['hub', 'committee', 'home'];

@ApiTags('YouTube Shorts')
@Controller('youtube-shorts')
export class YouTubeShortsController {
  constructor(private readonly service: YouTubeShortsService) {}

  @Get()
  @ApiOperation({ summary: '공개 유튜브 쇼츠 목록 (국감 허브·상임위·홈 노출용)' })
  @ApiQuery({ name: 'issueSlug', required: false, example: 'audit-2026' })
  @ApiQuery({ name: 'placement', required: false, enum: PLACEMENTS })
  @ApiQuery({
    name: 'committee',
    required: false,
    description: '정식 위원회명(placement=committee)',
  })
  @ApiQuery({ name: 'limit', required: false, example: 3 })
  find(
    @Query('issueSlug') issueSlug = 'audit-2026',
    @Query('placement') placement = 'hub',
    @Query('committee') committee?: string,
    @Query('limit') limit = '3',
  ): Promise<YouTubeShortResponse[]> {
    if (!(SHORTS_ISSUES as readonly string[]).includes(issueSlug)) {
      throw new BadRequestException('unknown issueSlug');
    }
    if (!PLACEMENTS.includes(placement as ShortsPlacement)) {
      throw new BadRequestException('unknown placement');
    }
    const name = committee?.trim().slice(0, 40);
    if (placement === 'committee' && !name) {
      throw new BadRequestException('committee required');
    }
    const n = Math.min(Math.max(parseInt(limit, 10) || 3, 1), 6);
    return this.service.find({
      issueSlug: issueSlug as ShortsIssue,
      placement: placement as ShortsPlacement,
      committee: name,
      limit: n,
    });
  }
}
