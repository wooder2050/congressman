import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { RealIpThrottlerGuard } from './common/real-ip-throttler.guard';
import { PrismaModule } from './prisma/prisma.module';
import { TermsModule } from './terms/terms.module';
import { MembersModule } from './members/members.module';
import { AttendanceModule } from './attendance/attendance.module';
import { BillsModule } from './bills/bills.module';
import { VotesModule } from './votes/votes.module';
import { StatsModule } from './stats/stats.module';
import { SchedulesModule } from './schedules/schedules.module';
import { CommitteesModule } from './committees/committees.module';
import { ElectionsModule } from './elections/elections.module';
import { LocalElectionsModule } from './local-elections/local-elections.module';
import { PollsModule } from './polls/polls.module';
import { HealthModule } from './health/health.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { UserPreferencesModule } from './user-preferences/user-preferences.module';
import { WatchesModule } from './watches/watches.module';
import { DigestsModule } from './digests/digests.module';
import { BreakingNewsModule } from './breaking-news/breaking-news.module';
import { WeeklyModule } from './weekly/weekly.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // 공개 API 남용 방지: IP당 분당 200건(핸들러별). 조회 위주 정상 트래픽에는 여유를 두고
    // 봇/스크래핑만 제한. SSR/프록시 IP 집중 가능성을 고려해 보수적으로 넉넉히 설정하고,
    // 배포 후 429·X-RateLimit-Remaining을 관측해 핸들러별로 조정한다.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 200 }]),
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
    CommitteesModule,
    ElectionsModule,
    LocalElectionsModule,
    PollsModule,
    AuthModule,
    UserPreferencesModule,
    WatchesModule,
    DigestsModule,
    BreakingNewsModule,
    WeeklyModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: RealIpThrottlerGuard }],
})
export class AppModule {}
