import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TermsService } from './terms.service';

@ApiTags('Terms')
@Controller('terms')
export class TermsController {
  constructor(private readonly termsService: TermsService) {}

  @Get()
  @ApiOperation({ summary: '국회 대수 목록', description: '전체 국회 대수 목록을 반환합니다' })
  findAll() {
    return this.termsService.findAll();
  }
}
