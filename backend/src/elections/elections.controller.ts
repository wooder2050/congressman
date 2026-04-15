import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ElectionsService } from './elections.service';

@ApiTags('Elections')
@Controller('elections')
export class ElectionsController {
  constructor(private readonly electionsService: ElectionsService) {}

  @Get()
  @ApiOperation({ summary: '선거 목록', description: '재보궐선거 목록을 반환합니다' })
  findAll() {
    return this.electionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: '선거 상세',
    description: '선거 상세 정보(선거구 + 후보자)를 반환합니다',
  })
  @ApiParam({ name: 'id', description: '선거 ID (예: 2026-06-03)' })
  async findById(@Param('id') id: string) {
    const election = await this.electionsService.findById(id);
    if (!election) throw new NotFoundException();
    return election;
  }
}
