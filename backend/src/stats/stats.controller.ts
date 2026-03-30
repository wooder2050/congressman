import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { MembersService } from '../members/members.service';

@ApiTags('Stats')
@Controller('stats')
export class StatsController {
  constructor(
    private readonly statsService: StatsService,
    private readonly membersService: MembersService,
  ) {}

  @Get('attendance-ranking')
  @ApiOperation({ summary: '출석 랭킹', description: '출석률 상위/하위 의원 랭킹을 반환합니다' })
  @ApiQuery({ name: 'termId', required: false, type: Number, description: '국회 대수 (기본: 22)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '조회 인원 수 (기본: 5)' })
  getAttendanceRanking(@Query('termId') termId?: string, @Query('limit') limit?: string) {
    const parsedTermId = Math.min(Math.max(parseInt(termId ?? '', 10) || 22, 1), 30);
    const parsedLimit = Math.min(Math.max(parseInt(limit ?? '', 10) || 5, 1), 20);
    return this.statsService.getAttendanceRanking(parsedTermId, parsedLimit);
  }

  @Get('property')
  @ApiOperation({
    summary: '부동산 보유 현황',
    description:
      '22대 국회의원의 부동산(건물/토지) 보유 현황 원시 데이터를 반환합니다 (2024년 재산신고 기준)',
  })
  getPropertyStats() {
    return this.statsService.getPropertyStats();
  }

  @Get('scorecard-ranking')
  @ApiOperation({
    summary: '성적표 랭킹',
    description: '전체 의원 성적표 랭킹을 반환합니다',
  })
  @ApiQuery({ name: 'termId', required: false, type: Number, description: '국회 대수 (기본: 22)' })
  getScorecardRanking(@Query('termId') termId?: string) {
    const parsedTermId = Math.min(Math.max(parseInt(termId ?? '', 10) || 22, 1), 30);
    return this.membersService.getScorecardRanking(parsedTermId);
  }

  @Get('home')
  @ApiOperation({ summary: '홈 통계', description: '홈페이지용 요약 통계를 반환합니다' })
  @ApiQuery({ name: 'termId', required: false, type: Number, description: '국회 대수 (기본: 22)' })
  getHomeStats(@Query('termId') termId?: string) {
    const parsedTermId = Math.min(Math.max(parseInt(termId ?? '', 10) || 22, 1), 30);
    return this.statsService.getHomeStats(parsedTermId);
  }
}
