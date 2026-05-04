import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { VotesService } from './votes.service';
import { parseOptionalIntFilter, parsePagination, parseTermId } from '../common/query-parsers';

@ApiTags('Votes')
@Controller('votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Get()
  @ApiOperation({
    summary: '표결 목록',
    description: '본회의 표결 목록을 반환합니다 (페이지네이션)',
  })
  @ApiQuery({ name: 'termId', required: false, type: Number, description: '국회 대수' })
  @ApiQuery({ name: 'resultCode', required: false, description: '표결 결과 코드' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호 (기본: 1)' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: '페이지당 건수 (기본: 20)',
  })
  @ApiQuery({ name: 'search', required: false, description: '법안명 검색어' })
  @ApiQuery({ name: 'month', required: false, description: '월 필터 (YYYY-MM)' })
  findAll(
    @Query('termId') termId?: string,
    @Query('resultCode') resultCode?: string,
    @Query('search') search?: string,
    @Query('month') month?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const { page: parsedPage, limit: parsedLimit } = parsePagination(page, limit);
    return this.votesService.findAll({
      termId: parseOptionalIntFilter(termId),
      resultCode,
      search: search || undefined,
      month: month || undefined,
      page: parsedPage,
      limit: parsedLimit,
    });
  }

  @Get('summary')
  @ApiOperation({ summary: '표결 요약 통계', description: '대수별 표결 요약 통계를 반환합니다' })
  @ApiQuery({ name: 'termId', type: Number, description: '국회 대수 (예: 22)' })
  getSummary(@Query('termId') termId: string) {
    return this.votesService.getSummary(parseTermId(termId));
  }

  @Get('ids')
  @ApiOperation({ summary: '표결 ID 목록', description: 'sitemap용 전체 표결 ID + 처리일 목록' })
  findAllIds() {
    return this.votesService.findAllIds();
  }

  @Get(':id/member-votes')
  @ApiOperation({
    summary: '표결별 의원 투표 내역',
    description: '특정 표결의 모든 의원별 투표 결과를 반환합니다',
  })
  @ApiParam({ name: 'id', description: '표결 ID' })
  findMemberVotesByVoteId(@Param('id') id: string) {
    return this.votesService.findMemberVotesByVoteId(id);
  }

  @Get(':billId')
  @ApiOperation({
    summary: '법안별 표결 상세',
    description: '특정 법안의 표결 상세 정보를 반환합니다',
  })
  @ApiParam({ name: 'billId', description: '법안 ID' })
  findByBillId(@Param('billId') billId: string) {
    return this.votesService.findByBillId(billId);
  }
}
