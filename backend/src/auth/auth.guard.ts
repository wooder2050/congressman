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

    request.user = { id: user.id, email: user.email };
    return true;
  }
}

/**
 * 인증에 더해 이메일이 서버 환경변수 ADMIN_EMAILS(콤마 구분) allowlist에 포함되는지 검증한다.
 * 공개 회원가입이 열려 있으므로 로그인 여부만으로는 관리자 API를 보호할 수 없어,
 * 서버 측에서 관리자 이메일을 확인하고 그렇지 않으면 403을 반환한다.
 */
@Injectable()
export class AdminGuard extends SupabaseAuthGuard {
  private readonly adminEmails: string[];

  constructor(config: ConfigService) {
    super(config);
    this.adminEmails = (config.get<string>('ADMIN_EMAILS') ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const request = context.switchToHttp().getRequest();
    const email: string | undefined = request.user?.email?.toLowerCase();

    if (this.adminEmails.length === 0 || !email || !this.adminEmails.includes(email)) {
      throw new ForbiddenException('관리자 권한이 필요합니다.');
    }
    return true;
  }
}
