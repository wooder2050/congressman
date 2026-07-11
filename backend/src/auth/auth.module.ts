import { Module } from '@nestjs/common';
import { SupabaseAuthGuard, AdminGuard } from './auth.guard';

@Module({
  providers: [SupabaseAuthGuard, AdminGuard],
  exports: [SupabaseAuthGuard, AdminGuard],
})
export class AuthModule {}
