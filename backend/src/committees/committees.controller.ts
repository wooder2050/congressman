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

  @Get('detail')
  @ApiOperation({
    summary: '위원회 상세 정보',
    description: '위원회 소속 위원, 법안 통계, 최근 회의록을 반환합니다',
  })
  @ApiQuery({ name: 'name', required: true, type: String, description: '위원회 이름' })
  @ApiQuery({ name: 'termId', required: false, type: Number, description: '국회 대수' })
  getCommitteeDetail(@Query('name') name: string, @Query('termId') termId?: string) {
    return this.committeesService.getCommitteeDetail(name, parseInt(termId ?? '', 10) || 22);
  }

  @Get('minutes')
  @ApiOperation({
    summary: '위원회 회의록 목록',
    description: '위원회별 회의록을 페이지네이션으로 반환합니다',
  })
  @ApiQuery({ name: 'name', required: true, type: String, description: '위원회 이름' })
  @ApiQuery({ name: 'termId', required: false, type: Number, description: '국회 대수' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호' })
  getCommitteeMinutes(
    @Query('name') name: string,
    @Query('termId') termId?: string,
    @Query('page') page?: string,
  ) {
    return this.committeesService.getCommitteeMinutes(
      name,
      parseInt(termId ?? '', 10) || 22,
      Math.max(1, parseInt(page ?? '', 10) || 1),
    );
  }
}
