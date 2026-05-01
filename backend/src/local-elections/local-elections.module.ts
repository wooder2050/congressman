import { Module } from '@nestjs/common';
import { LocalElectionsController } from './local-elections.controller';
import { LocalElectionsService } from './local-elections.service';

@Module({
  controllers: [LocalElectionsController],
  providers: [LocalElectionsService],
})
export class LocalElectionsModule {}
