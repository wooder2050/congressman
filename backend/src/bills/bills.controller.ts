import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
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
  findAll(
    @Query('termId') termId?: string,
    @Query('memberId') memberId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.billsService.findAll({
      termId: termId ? parseInt(termId, 10) || undefined : undefined,
      memberId,
      status,
      page: Math.max(parseInt(page ?? '', 10) || 1, 1),
      limit: Math.min(Math.max(parseInt(limit ?? '', 10) || 20, 1), 100),
    });
  }
}
