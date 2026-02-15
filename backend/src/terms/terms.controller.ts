import { Controller, Get } from '@nestjs/common';
import { TermsService } from './terms.service';

@Controller('terms')
export class TermsController {
  constructor(private readonly termsService: TermsService) {}

  @Get()
  findAll() {
    return this.termsService.findAll();
  }
}
