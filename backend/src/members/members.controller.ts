import { Controller, Get, Param, Query, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MembersService } from './members.service';

@ApiTags('Members')
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @ApiOperation({ summary: '의원 목록', description: '대수별 국회의원 목록을 반환합니다' })
  @ApiQuery({ name: 'termId', type: Number, description: '국회 대수 (예: 22)' })
  findByTerm(@Query('termId', ParseIntPipe) termId: number) {
    return this.membersService.findByTerm(termId);
  }

  @Get(':id')
  @ApiOperation({ summary: '의원 상세', description: '의원 기본 정보를 반환합니다' })
  @ApiParam({ name: 'id', description: '의원 ID' })
  async findOne(@Param('id') id: string) {
    const member = await this.membersService.findById(id);
    if (!member) throw new NotFoundException();
    return member;
  }

  @Get(':id/terms')
  @ApiOperation({
    summary: '의원 대수별 정보',
    description: '의원의 역대 대수별 활동 정보를 반환합니다',
  })
  @ApiParam({ name: 'id', description: '의원 ID' })
  findTerms(@Param('id') id: string) {
    return this.membersService.findTermsByMemberId(id);
  }

  @Get(':id/history')
  @ApiOperation({
    summary: '의원 이력',
    description: '의원의 역대 출석률, 법안 발의 집계를 반환합니다',
  })
  @ApiParam({ name: 'id', description: '의원 ID' })
  getHistory(@Param('id') id: string) {
    return this.membersService.getHistory(id);
  }

  @Get(':id/assets')
  @ApiOperation({ summary: '의원 재산', description: '의원의 연도별 재산 신고 내역을 반환합니다' })
  @ApiParam({ name: 'id', description: '의원 ID' })
  getAssets(@Param('id') id: string) {
    return this.membersService.getAssets(id);
  }

  @Get(':id/monthly-attendance')
  @ApiOperation({
    summary: '월별 출석 통계',
    description: '의원의 월별 본회의 출석/결석 통계를 반환합니다',
  })
  @ApiParam({ name: 'id', description: '의원 ID' })
  @ApiQuery({ name: 'termId', type: Number, description: '국회 대수' })
  getMonthlyAttendance(@Param('id') id: string, @Query('termId', ParseIntPipe) termId: number) {
    return this.membersService.getMonthlyAttendance(id, termId);
  }

  @Get(':id/activity-heatmap')
  @ApiOperation({
    summary: '활동 히트맵',
    description: '의원의 일별 의정활동(법안 발의, 표결 참여)을 반환합니다',
  })
  @ApiParam({ name: 'id', description: '의원 ID' })
  @ApiQuery({ name: 'termId', type: Number, description: '국회 대수' })
  @ApiQuery({ name: 'startDate', type: String, description: '시작일 (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', type: String, description: '종료일 (YYYY-MM-DD)' })
  getActivityHeatmap(
    @Param('id') id: string,
    @Query('termId', ParseIntPipe) termId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.membersService.getActivityHeatmap(id, termId, startDate, endDate);
  }

  @Get(':id/committee-bills')
  @ApiOperation({
    summary: '위원회별 발의 법안',
    description: '의원이 발의한 법안을 위원회별로 집계하여 반환합니다',
  })
  @ApiParam({ name: 'id', description: '의원 ID' })
  @ApiQuery({ name: 'termId', type: Number, description: '국회 대수' })
  getCommitteeBills(@Param('id') id: string, @Query('termId', ParseIntPipe) termId: number) {
    return this.membersService.getCommitteeBills(id, termId);
  }

  @Get(':id/committee-activity')
  @ApiOperation({
    summary: '소속 위원회별 활동 통계',
    description: '의원의 소속 위원회별 표결 참여 현황과 발의 법안 수를 반환합니다',
  })
  @ApiParam({ name: 'id', description: '의원 ID' })
  @ApiQuery({ name: 'termId', type: Number, description: '국회 대수' })
  getCommitteeActivity(@Param('id') id: string, @Query('termId', ParseIntPipe) termId: number) {
    return this.membersService.getCommitteeActivity(id, termId);
  }

  @Get(':id/district-report')
  @ApiOperation({
    summary: '지역구 의원 활동 리포트',
    description: '성적표 + 최근 법안 5건 + 최근 표결 5건을 통합 반환합니다',
  })
  @ApiParam({ name: 'id', description: '의원 ID' })
  @ApiQuery({ name: 'termId', required: false, type: Number, description: '국회 대수 (기본: 22)' })
  async getDistrictReport(@Param('id') id: string, @Query('termId') termId?: string) {
    const parsedTermId = Math.min(Math.max(parseInt(termId ?? '', 10) || 22, 1), 30);
    const result = await this.membersService.getDistrictReport(id, parsedTermId);
    if (!result) throw new NotFoundException();
    return result;
  }

  @Get(':id/scorecard')
  @ApiOperation({
    summary: '의원 성적표',
    description: '의원의 종합 성적표(출석, 표결, 법안발의, 법안통과율)를 반환합니다',
  })
  @ApiParam({ name: 'id', description: '의원 ID' })
  @ApiQuery({ name: 'termId', required: false, type: Number, description: '국회 대수 (기본: 22)' })
  async getScorecard(@Param('id') id: string, @Query('termId') termId?: string) {
    const parsedTermId = Math.min(Math.max(parseInt(termId ?? '', 10) || 22, 1), 30);
    const result = await this.membersService.getScorecard(id, parsedTermId);
    if (!result) throw new NotFoundException();
    return result;
  }

  @Get(':id/votes')
  @ApiOperation({ summary: '의원 표결 이력', description: '의원의 본회의 표결 이력을 반환합니다' })
  @ApiParam({ name: 'id', description: '의원 ID' })
  @ApiQuery({ name: 'termId', type: Number, description: '국회 대수' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호 (기본: 1)' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: '페이지당 건수 (기본: 20)',
  })
  @ApiQuery({
    name: 'result',
    required: false,
    description: '표결 결과 필터 (yes, no, abstain, absent)',
  })
  @ApiQuery({
    name: 'month',
    required: false,
    description: '월 필터 (YYYY-MM 형식, 예: 2024-06)',
  })
  findMemberVotes(
    @Param('id') id: string,
    @Query('termId', ParseIntPipe) termId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('result') result?: string,
    @Query('month') month?: string,
  ) {
    return this.membersService.findMemberVotes(id, {
      termId,
      page: Math.max(parseInt(page ?? '', 10) || 1, 1),
      limit: Math.min(Math.max(parseInt(limit ?? '', 10) || 20, 1), 100),
      result: result || undefined,
      month: month || undefined,
    });
  }
}
