import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BreakingNewsService } from './breaking-news.service';

@ApiTags('Breaking News')
@Controller('breaking-news')
export class BreakingNewsController {
  constructor(private readonly service: BreakingNewsService) {}

  @Get()
  @ApiOperation({ summary: '활성 속보 목록 (홈 화면 노출용)' })
  findActive() {
    return this.service.findActive();
  }
}
