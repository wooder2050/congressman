import { Controller, Get, Param, Query, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { MembersService } from './members.service';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  findByTerm(@Query('termId', ParseIntPipe) termId: number) {
    return this.membersService.findByTerm(termId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const member = await this.membersService.findById(id);
    if (!member) throw new NotFoundException();
    return member;
  }

  @Get(':id/terms')
  findTerms(@Param('id') id: string) {
    return this.membersService.findTermsByMemberId(id);
  }

  @Get(':id/history')
  getHistory(@Param('id') id: string) {
    return this.membersService.getHistory(id);
  }
}
