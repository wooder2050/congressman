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
  findMemberVotes(
    @Param('id') id: string,
    @Query('termId', ParseIntPipe) termId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('result') result?: string,
  ) {
    return this.membersService.findMemberVotes(id, {
      termId,
      page: Math.max(parseInt(page ?? '', 10) || 1, 1),
      limit: Math.min(Math.max(parseInt(limit ?? '', 10) || 20, 1), 100),
      result: result || undefined,
    });
  }
}
