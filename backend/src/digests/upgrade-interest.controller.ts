/**
 * Lawmake Radar Pro 출시 알림 신청 API. 로그인/비로그인 모두 허용(공개).
 * POST /api/user/upgrade-interest  { email, source, consent }
 * 로그인 사용자 연결은 선택적 Authorization 헤더로(있으면 userId 추출, 없으면 null).
 */

import { Body, Controller, Post, Req } from '@nestjs/common';
import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UpgradeInterestService } from './upgrade-interest.service';
import { OptionalUserService } from '../auth/optional-user.service';

class UpgradeInterestDto {
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MaxLength(64)
  @IsOptional()
  source?: string;

  @IsBoolean()
  consent!: boolean;
}

@ApiTags('Radar')
@Controller('user/upgrade-interest')
export class UpgradeInterestController {
  constructor(
    private readonly service: UpgradeInterestService,
    private readonly optionalUser: OptionalUserService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Pro 출시 알림 신청(로그인 선택)' })
  async register(
    @Body() dto: UpgradeInterestDto,
    @Req() req: { headers: Record<string, string | undefined> },
  ) {
    if (!dto.consent) {
      return { ok: false, error: '연락 동의가 필요합니다.' };
    }
    // Authorization 헤더가 유효하면 userId 연결, 아니면 null(비로그인 허용).
    const userId = await this.optionalUser.tryGetUserId(req.headers.authorization);
    return this.service.register(userId, dto.email, dto.source ?? 'unknown');
  }
}
