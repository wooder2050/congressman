import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CommitteesService } from './committees.service';

@ApiTags('Committees')
@Controller('committees')
export class CommitteesController {
  constructor(private readonly committeesService: CommitteesService) {}

  @Get()
  @ApiOperation({
    summary: '위원회 목록 + 통계',
    description: '상임위원회별 법안 처리 현황, 위원장, 위원 수, 다음 일정을 반환합니다',
  })
  @ApiQuery({ name: 'termId', required: false, type: Number, description: '국회 대수' })
  getCommitteeStats(@Query('termId') termId?: string) {
    return this.committeesService.getCommitteeStats(parseInt(termId ?? '', 10) || 22);
  }
}
