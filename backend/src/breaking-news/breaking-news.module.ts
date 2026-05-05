import { Module } from '@nestjs/common';
import { BreakingNewsController } from './breaking-news.controller';
import { BreakingNewsService } from './breaking-news.service';

@Module({
  controllers: [BreakingNewsController],
  providers: [BreakingNewsService],
})
export class BreakingNewsModule {}
