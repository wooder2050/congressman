import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PollsService } from './polls.service';

const ALLOWED_CATEGORIES = new Set(['제9회 전국동시지방선거', '2026년 재·보궐선거']);

function clampInt(value: string | undefined, def: number, min: number, max: number): number {
  if (!value) return def;
  const n = parseInt(value, 10);
  if (!Number.isFinite(n)) return def;
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

function normalizeDate(s: string | undefined): string | undefined {
  if (!s) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    throw new BadRequestException(`Invalid date format: ${s} (expect YYYY-MM-DD)`);
  }
  return s;
}

@ApiTags('Polls')
@Controller('polls')
export class PollsController {
  constructor(private readonly service: PollsService) {}

  @Get()
  @ApiOperation({ summary: '여론조사 목록 (필터 + 페이지네이션)' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'sido', required: false })
  @ApiQuery({ name: 'agency', required: false })
  @ApiQuery({ name: 'from', required: false, description: 'YYYY-MM-DD (등록일 기준)' })
  @ApiQuery({ name: 'to', required: false, description: 'YYYY-MM-DD (등록일 기준)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  list(
    @Query('category') category?: string,
    @Query('sido') sido?: string,
    @Query('agency') agency?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') pageRaw?: string,
    @Query('limit') limitRaw?: string,
  ) {
    if (category && !ALLOWED_CATEGORIES.has(category)) {
      throw new BadRequestException('Invalid category');
    }
    const page = clampInt(pageRaw, 1, 1, 1000);
    const limit = clampInt(limitRaw, 20, 1, 100);
    return this.service.list({
      electionCategory: category,
      sido: sido || undefined,
      agency: agency || undefined,
      from: normalizeDate(from),
      to: normalizeDate(to),
      page,
      limit,
    });
  }

  @Get('recent')
  @ApiOperation({ summary: '메인 위젯용: 최근 여론조사' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  recent(@Query('category') category?: string, @Query('limit') limitRaw?: string) {
    if (category && !ALLOWED_CATEGORIES.has(category)) {
      throw new BadRequestException('Invalid category');
    }
    const limit = clampInt(limitRaw, 5, 1, 20);
    return this.service.recent(limit, category);
  }

  @Get('filters')
  @ApiOperation({ summary: '필터 드롭다운용: 시·도 + 조사기관 목록 + 카테고리' })
  filters() {
    return this.service.filters();
  }

  @Get('by-race/:raceId')
  @ApiOperation({ summary: 'Race 상세에서: 해당 race 관련 여론조사' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async byRace(@Param('raceId', ParseIntPipe) raceId: number, @Query('limit') limitRaw?: string) {
    const limit = clampInt(limitRaw, 20, 1, 50);
    const polls = await this.service.byRace(raceId, limit);
    if (polls === null) throw new NotFoundException(`Race not found: ${raceId}`);
    return polls;
  }

  @Get(':id')
  @ApiOperation({ summary: '여론조사 상세' })
  async detail(@Param('id', ParseIntPipe) id: number) {
    const poll = await this.service.findById(id);
    if (!poll) throw new NotFoundException(`Poll not found: ${id}`);
    return poll;
  }
}
