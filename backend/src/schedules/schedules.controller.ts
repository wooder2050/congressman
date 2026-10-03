import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';
import { parseClampedInt, parsePagination, parseTermId } from '../common/query-parsers';

@ApiTags('Schedules')
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  @ApiOperation({ summary: '일정 목록', description: '국회 일정 목록을 반환합니다' })
  @ApiQuery({ name: 'termId', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'plenary | committee' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getSchedules(
    @Query('termId') termId?: string,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const { page: parsedPage, limit: parsedLimit } = parsePagination(page, limit, {
      defaultLimit: 30,
    });
    return this.schedulesService.getSchedules(
      parseTermId(termId),
      type || undefined,
      parsedPage,
      parsedLimit,
    );
  }

  @Get('upcoming')
  @ApiOperation({ summary: '다가오는 일정', description: '오늘 이후 예정된 일정을 반환합니다' })
  @ApiQuery({ name: 'termId', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'keyword',
    required: false,
    type: String,
    description: '제목·안건에 포함된 단어(예: 국정감사)',
  })
  getUpcomingSchedules(
    @Query('termId') termId?: string,
    @Query('limit') limit?: string,
    @Query('keyword') keyword?: string,
  ) {
    // 키워드는 짧은 단어 하나만 받는다(캐시 키·쿼리 남용 방지)
    const kw = keyword?.trim().slice(0, 20) || undefined;
    return this.schedulesService.getUpcomingSchedules(
      parseTermId(termId),
      // 국감 기간엔 하루 회의만 수십 건 — 국감 허브가 기간 전체를 받을 수 있게 상한 100
      parseClampedInt(limit, { defaultValue: 5, min: 1, max: 100 }),
      kw,
    );
  }
}
