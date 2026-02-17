import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { TermsModule } from './terms/terms.module';
import { MembersModule } from './members/members.module';
import { AttendanceModule } from './attendance/attendance.module';
import { BillsModule } from './bills/bills.module';
import { VotesModule } from './votes/votes.module';
import { StatsModule } from './stats/stats.module';
import { SchedulesModule } from './schedules/schedules.module';
import { HealthModule } from './health/health.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,
    HealthModule,
    TermsModule,
    MembersModule,
    AttendanceModule,
    BillsModule,
    VotesModule,
    StatsModule,
    SchedulesModule,
  ],
})
export class AppModule {}
