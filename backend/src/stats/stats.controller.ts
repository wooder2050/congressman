import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { StatsService } from './stats.service';

@ApiTags('Stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('home')
  @ApiOperation({ summary: '홈 통계', description: '홈페이지용 요약 통계를 반환합니다' })
  @ApiQuery({ name: 'termId', required: false, type: Number, description: '국회 대수 (기본: 22)' })
  getHomeStats(@Query('termId') termId?: string) {
    return this.statsService.getHomeStats(parseInt(termId ?? '', 10) || 22);
  }
}
