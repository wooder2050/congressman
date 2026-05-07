import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { LocalElectionsService } from './local-elections.service';

@ApiTags('Local Elections')
@Controller('local-elections')
export class LocalElectionsController {
  constructor(private readonly service: LocalElectionsService) {}

  @Get()
  @ApiOperation({ summary: '지방선거 목록' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '지방선거 개요' })
  @ApiParam({ name: 'id', description: '선거 ID (예: local-2026)' })
  async findById(@Param('id') id: string) {
    const election = await this.service.findById(id);
    if (!election) throw new NotFoundException();
    return election;
  }

  @Get(':id/indexable-races')
  @ApiOperation({
    summary: '인덱싱 가능 race 목록',
    description: '후보 1명 이상인 race의 최소 필드 (sitemap thin-content 제외용)',
  })
  @ApiParam({ name: 'id' })
  getIndexableRaces(@Param('id') id: string) {
    return this.service.getIndexableRaces(id);
  }

  @Get(':id/races')
  @ApiOperation({ summary: '선거 race 목록 (필터 + 페이지네이션)' })
  @ApiParam({ name: 'id' })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'sido', required: false })
  @ApiQuery({ name: 'sigungu', required: false })
  @ApiQuery({ name: 'q', required: false, description: '선거구명·후보자명 검색' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getRaces(
    @Param('id') id: string,
    @Query('type') type?: string,
    @Query('sido') sido?: string,
    @Query('sigungu') sigungu?: string,
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getRaces(id, {
      type,
      sido,
      sigungu,
      q,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 30,
    });
  }

  @Get(':id/races/:raceId')
  @ApiOperation({ summary: 'race 상세 + 후보자 전체' })
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'raceId' })
  async getRaceDetail(@Param('id') id: string, @Param('raceId') raceId: string) {
    const race = await this.service.getRaceDetail(id, parseInt(raceId, 10));
    if (!race) throw new NotFoundException();
    return race;
  }

  @Get(':id/regions')
  @ApiOperation({ summary: '17개 시도 요약' })
  @ApiParam({ name: 'id' })
  getRegions(@Param('id') id: string) {
    return this.service.getRegions(id);
  }

  @Get(':id/regions/:sido')
  @ApiOperation({ summary: '시도별 전체 race' })
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'sido' })
  getRegionDetail(@Param('id') id: string, @Param('sido') sido: string) {
    return this.service.getRegionDetail(id, sido);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: '통계 (정당별, 유형별)' })
  @ApiParam({ name: 'id' })
  getStats(@Param('id') id: string) {
    return this.service.getStats(id);
  }
}
