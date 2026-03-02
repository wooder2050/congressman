import { Module } from '@nestjs/common';
import { CommitteesController } from './committees.controller';
import { CommitteesService } from './committees.service';

@Module({
  controllers: [CommitteesController],
  providers: [CommitteesService],
})
export class CommitteesModule {}
