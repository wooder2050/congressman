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

  @Get(':id/lawmaker-candidates')
  @ApiOperation({
    summary: '국회의원 출신 후보',
    description: '선거에 출마한 전·현직 국회의원의 의정활동 성적표를 반환합니다',
  })
  @ApiParam({ name: 'id', description: '선거 ID' })
  async getLawmakerCandidates(@Param('id') id: string) {
    return this.electionsService.getLawmakerCandidates(id);
  }

  @Get(':id/candidates/:candidateId')
  @ApiOperation({
    summary: '후보자 상세',
    description: '재보궐 후보자 1명의 상세 정보를 반환합니다',
  })
  @ApiParam({ name: 'id', description: '선거 ID' })
  @ApiParam({ name: 'candidateId', description: '후보자 ID' })
  async getCandidateDetail(
    @Param('id') id: string,
    @Param('candidateId') candidateId: string,
  ) {
    const numericId = Number(candidateId);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      throw new NotFoundException('Invalid candidate id');
    }
    return this.electionsService.getCandidateDetail(id, numericId);
  }
}
