import { Module } from '@nestjs/common';
import { MembersModule } from '../members/members.module';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [MembersModule],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
