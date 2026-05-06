import { Module } from '@nestjs/common';
import { WeeklyController } from './weekly.controller';
import { WeeklyService } from './weekly.service';

@Module({
  controllers: [WeeklyController],
  providers: [WeeklyService],
})
export class WeeklyModule {}
