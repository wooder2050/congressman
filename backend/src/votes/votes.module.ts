import { Module } from '@nestjs/common';
import { VotesController } from './votes.controller';
import { VotesService } from './votes.service';

@Module({
  controllers: [VotesController],
  providers: [VotesService],
})
export class VotesModule {}
