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
  getUpcomingSchedules(@Query('termId') termId?: string, @Query('limit') limit?: string) {
    return this.schedulesService.getUpcomingSchedules(
      parseTermId(termId),
      parseClampedInt(limit, { defaultValue: 5, min: 1, max: 20 }),
    );
  }
}
