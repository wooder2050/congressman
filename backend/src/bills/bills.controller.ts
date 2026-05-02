import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { BillsService } from './bills.service';

@ApiTags('Bills')
@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Get()
  @ApiOperation({ summary: '법안 목록', description: '법안 목록을 반환합니다 (페이지네이션)' })
  @ApiQuery({ name: 'termId', required: false, type: Number, description: '국회 대수' })
  @ApiQuery({ name: 'memberId', required: false, description: '발의 의원 ID' })
  @ApiQuery({ name: 'role', required: false, description: '발의 역할 (representative, co)' })
  @ApiQuery({ name: 'status', required: false, description: '법안 상태 필터' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호 (기본: 1)' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: '페이지당 건수 (기본: 20)',
  })
  @ApiQuery({ name: 'search', required: false, description: '법안 제목 검색어' })
  @ApiQuery({ name: 'month', required: false, description: '월 필터 (YYYY-MM)' })
  @ApiQuery({ name: 'committee', required: false, description: '위원회 필터' })
  @ApiQuery({ name: 'topic', required: false, description: '주제 필터 (정규화된 카테고리명)' })
  findAll(
    @Query('termId') termId?: string,
    @Query('memberId') memberId?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('month') month?: string,
    @Query('committee') committee?: string,
    @Query('topic') topic?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.billsService.findAll({
      termId: termId ? parseInt(termId, 10) || undefined : undefined,
      memberId,
      role: role || undefined,
      status,
      search: search || undefined,
      month: month || undefined,
      committee: committee || undefined,
      topic: topic || undefined,
      page: Math.max(parseInt(page ?? '', 10) || 1, 1),
      limit: Math.min(Math.max(parseInt(limit ?? '', 10) || 20, 1), 100),
    });
  }

  @Get('summary')
  @ApiOperation({ summary: '법안 통계', description: '법안 상태별 통계를 반환합니다' })
  @ApiQuery({ name: 'termId', required: true, type: Number, description: '국회 대수' })
  getSummary(@Query('termId') termId: string) {
    return this.billsService.getSummary(parseInt(termId, 10) || 22);
  }

  @Get('ids')
  @ApiOperation({ summary: '법안 ID 목록', description: 'sitemap용 전체 법안 ID + 발의일 목록' })
  findAllIds() {
    return this.billsService.findAllIds();
  }

  @Get('committees')
  @ApiOperation({
    summary: '위원회 목록',
    description: '법안이 존재하는 상임위원회 목록을 반환합니다',
  })
  @ApiQuery({ name: 'termId', required: true, type: Number, description: '국회 대수' })
  getCommittees(@Query('termId') termId: string) {
    return this.billsService.getCommittees(parseInt(termId, 10) || 22);
  }

  @Get('topics')
  @ApiOperation({
    summary: '주제별 법안 수',
    description: '정규화된 주제 카테고리별 법안 수를 반환합니다',
  })
  @ApiQuery({ name: 'termId', required: true, type: Number, description: '국회 대수' })
  getTopics(@Query('termId') termId: string) {
    return this.billsService.getTopicCounts(parseInt(termId, 10) || 22);
  }

  @Get('batch')
  @ApiOperation({
    summary: '법안 일괄 조회',
    description: 'ID 목록으로 법안을 일괄 조회합니다 (최대 50건)',
  })
  @ApiQuery({ name: 'ids', required: true, description: '법안 ID (쉼표 구분, 최대 50건)' })
  findByIds(@Query('ids') ids: string) {
    const idList = (ids ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
      .slice(0, 50);
    return this.billsService.findByIds(idList);
  }

  @Get(':id')
  @ApiOperation({ summary: '법안 상세', description: '법안 상세 정보와 발의자 목록을 반환합니다' })
  @ApiParam({ name: 'id', description: '법안 ID' })
  async findOne(@Param('id') id: string) {
    const bill = await this.billsService.findById(id);
    if (!bill) throw new NotFoundException();
    return bill;
  }
}
