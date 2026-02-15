import { Controller, Get, Param, Query } from '@nestjs/common';
import { VotesService } from './votes.service';

@Controller('votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Get()
  findAll(
    @Query('termId') termId?: string,
    @Query('resultCode') resultCode?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.votesService.findAll({
      termId: termId ? parseInt(termId, 10) : undefined,
      resultCode,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('summary')
  getSummary(@Query('termId') termId: string) {
    return this.votesService.getSummary(parseInt(termId, 10) || 22);
  }

  @Get(':billId')
  findByBillId(@Param('billId') billId: string) {
    return this.votesService.findByBillId(billId);
  }
}
