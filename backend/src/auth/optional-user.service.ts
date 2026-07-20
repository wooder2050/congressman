/**
 * 선택적 인증: Authorization 헤더가 유효하면 userId를 반환하고, 없거나 무효면 null.
 * 예외를 던지지 않아 비로그인 요청도 통과시킨다(공개+로그인 겸용 엔드포인트용).
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class OptionalUserService {
  private readonly supabase: SupabaseClient;

  constructor(config: ConfigService) {
    this.supabase = createClient(
      config.get('SUPABASE_URL')!,
      config.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
  }

  /** Authorization 헤더(Bearer ...)에서 userId 추출. 실패 시 null. */
  async tryGetUserId(authorization: string | undefined): Promise<string | null> {
    const token = authorization?.replace('Bearer ', '').trim();
    if (!token) return null;
    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser(token);
      if (error || !user) return null;
      return user.id;
    } catch {
      return null;
    }
  }
}
