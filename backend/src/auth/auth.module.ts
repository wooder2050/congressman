import { Module } from '@nestjs/common';
import { SupabaseAuthGuard, AdminGuard } from './auth.guard';
import { OptionalUserService } from './optional-user.service';

@Module({
  providers: [SupabaseAuthGuard, AdminGuard, OptionalUserService],
  exports: [SupabaseAuthGuard, AdminGuard, OptionalUserService],
})
export class AuthModule {}
