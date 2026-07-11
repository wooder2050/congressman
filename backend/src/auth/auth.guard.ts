import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly supabase;

  constructor(private readonly config: ConfigService) {
    this.supabase = createClient(
      this.config.get('SUPABASE_URL')!,
      this.config.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace('Bearer ', '');

    if (!token) throw new UnauthorizedException();

    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser(token);

    if (error || !user) throw new UnauthorizedException();

    request.user = {
      id: user.id,
      email: user.email,
      emailConfirmed: !!user.email_confirmed_at,
    };
    return true;
  }
}

/**
 * 인증에 더해 서버 환경변수 기반 allowlist로 관리자 권한을 검증한다.
 * 공개 회원가입이 열려 있으므로 로그인 여부만으로는 관리자 API를 보호할 수 없다.
 *
 * - 1순위: ADMIN_USER_IDS(콤마 구분 Supabase user UUID) — 이메일과 무관하게 변경 불가능한 계정 식별자라 가장 안전.
 * - 2순위: ADMIN_EMAILS(콤마 구분 이메일) — 단, 이메일 확인(email_confirmed)된 계정만 허용해
 *   이메일 확인이 꺼진 경우의 스푸핑 가입으로 권한을 탈취하지 못하게 한다.
 *
 * 두 allowlist가 모두 비어 있으면 전건 403(fail-closed).
 */
@Injectable()
export class AdminGuard extends SupabaseAuthGuard {
  private readonly adminUserIds: string[];
  private readonly adminEmails: string[];

  constructor(config: ConfigService) {
    super(config);
    this.adminUserIds = (config.get<string>('ADMIN_USER_IDS') ?? '')
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
    this.adminEmails = (config.get<string>('ADMIN_EMAILS') ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const request = context.switchToHttp().getRequest();
    const user: { id?: string; email?: string; emailConfirmed?: boolean } | undefined =
      request.user;

    // 1순위: UUID allowlist (변경 불가능한 식별자)
    if (this.adminUserIds.length > 0 && user?.id && this.adminUserIds.includes(user.id)) {
      return true;
    }

    // 2순위: 이메일 allowlist — 반드시 이메일 확인된 계정만 허용
    const email = user?.email?.toLowerCase();
    if (
      this.adminEmails.length > 0 &&
      email &&
      user?.emailConfirmed === true &&
      this.adminEmails.includes(email)
    ) {
      return true;
    }

    throw new ForbiddenException('관리자 권한이 필요합니다.');
  }
}
