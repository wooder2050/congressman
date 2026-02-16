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

  @Get(':id/assets')
  getAssets(@Param('id') id: string) {
    return this.membersService.getAssets(id);
  }

  @Get(':id/votes')
  findMemberVotes(
    @Param('id') id: string,
    @Query('termId', ParseIntPipe) termId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('result') result?: string,
  ) {
    return this.membersService.findMemberVotes(id, {
      termId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      result: result || undefined,
    });
  }
}
