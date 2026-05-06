import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  WeeklyService,
  WeeklyArticleDetail,
  WeeklyArticleSummary,
} from './weekly.service';

@ApiTags('Weekly')
@Controller('weekly')
export class WeeklyController {
  constructor(private readonly service: WeeklyService) {}

  @Get()
  @ApiOperation({ summary: '주간 뉴스 목록 (최신순)' })
  findAll(): Promise<WeeklyArticleSummary[]> {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '주간 뉴스 상세' })
  findOne(@Param('id') id: string): Promise<WeeklyArticleDetail> {
    return this.service.findOne(id);
  }
}
