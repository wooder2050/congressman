import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { TermsModule } from './terms/terms.module';
import { MembersModule } from './members/members.module';
import { AttendanceModule } from './attendance/attendance.module';
import { BillsModule } from './bills/bills.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    TermsModule,
    MembersModule,
    AttendanceModule,
    BillsModule,
  ],
})
export class AppModule {}
