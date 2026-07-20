import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DigestLinksController } from './digest-links.controller';
import { DigestLinksService } from './digest-links.service';
import { UpgradeInterestController } from './upgrade-interest.controller';
import { UpgradeInterestService } from './upgrade-interest.service';

/**
 * Lawmake Radar 다이제스트 HTTP 계층: 이메일 링크(클릭·수신거부) + Pro 신청.
 * 빌드·발송 배치(digest-build/send.service, alerts-runner)는 NestJS DI 밖의 tsx 스크립트라
 * 이 모듈에 포함되지 않는다.
 */
@Module({
  imports: [AuthModule],
  controllers: [DigestLinksController, UpgradeInterestController],
  providers: [DigestLinksService, UpgradeInterestService],
})
export class DigestsModule {}
