import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';

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
    return this.schedulesService.getSchedules(
      parseInt(termId ?? '', 10) || 22,
      type || undefined,
      Math.max(parseInt(page ?? '', 10) || 1, 1),
      Math.min(Math.max(parseInt(limit ?? '', 10) || 30, 1), 100),
    );
  }

  @Get('upcoming')
  @ApiOperation({ summary: '다가오는 일정', description: '오늘 이후 예정된 일정을 반환합니다' })
  @ApiQuery({ name: 'termId', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getUpcomingSchedules(@Query('termId') termId?: string, @Query('limit') limit?: string) {
    return this.schedulesService.getUpcomingSchedules(
      parseInt(termId ?? '', 10) || 22,
      Math.min(Math.max(parseInt(limit ?? '', 10) || 5, 1), 20),
    );
  }
}
