import { Module } from '@nestjs/common';
import { SupabaseAuthGuard } from './auth.guard';

@Module({
  providers: [SupabaseAuthGuard],
  exports: [SupabaseAuthGuard],
})
export class AuthModule {}
