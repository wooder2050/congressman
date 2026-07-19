import { Module } from '@nestjs/common';
import { WatchesController } from './watches.controller';
import { WatchesService } from './watches.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [WatchesController],
  providers: [WatchesService],
})
export class WatchesModule {}
