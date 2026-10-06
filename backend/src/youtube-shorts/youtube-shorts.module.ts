import { Module } from '@nestjs/common';
import { YouTubeShortsController } from './youtube-shorts.controller';
import { YouTubeShortsService } from './youtube-shorts.service';

@Module({
  controllers: [YouTubeShortsController],
  providers: [YouTubeShortsService],
})
export class YouTubeShortsModule {}
