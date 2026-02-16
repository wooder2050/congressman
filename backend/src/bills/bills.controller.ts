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
  @ApiQuery({ name: 'status', required: false, description: '법안 상태 필터' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호 (기본: 1)' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: '페이지당 건수 (기본: 20)',
  })
  @ApiQuery({ name: 'search', required: false, description: '법안 제목 검색어' })
  findAll(
    @Query('termId') termId?: string,
    @Query('memberId') memberId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.billsService.findAll({
      termId: termId ? parseInt(termId, 10) || undefined : undefined,
      memberId,
      status,
      search: search || undefined,
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

  @Get(':id')
  @ApiOperation({ summary: '법안 상세', description: '법안 상세 정보와 발의자 목록을 반환합니다' })
  @ApiParam({ name: 'id', description: '법안 ID' })
  async findOne(@Param('id') id: string) {
    const bill = await this.billsService.findById(id);
    if (!bill) throw new NotFoundException();
    return bill;
  }
}
