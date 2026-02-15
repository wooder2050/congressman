import { Controller, Get, Query } from '@nestjs/common';
import { BillsService } from './bills.service';

@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Get()
  findAll(
    @Query('termId') termId?: string,
    @Query('memberId') memberId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.billsService.findAll({
      termId: termId ? parseInt(termId, 10) : undefined,
      memberId,
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }
}
