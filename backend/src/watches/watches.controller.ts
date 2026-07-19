import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../auth/auth.guard';
import { WatchesService } from './watches.service';

const MAX_ID_LENGTH = 64;

function validateBillId(id: string): void {
  if (!id || id.length > MAX_ID_LENGTH || !/^[\w-]+$/.test(id)) {
    throw new BadRequestException('유효하지 않은 법안 ID입니다.');
  }
}

@ApiTags('Radar')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('user/watches')
export class WatchesController {
  constructor(private readonly service: WatchesService) {}

  @Get()
  @ApiOperation({ summary: '내 법안 변경 알림 목록' })
  list(@Req() req: { user: { id: string } }) {
    return this.service.list(req.user.id);
  }

  @Post('bills/:billId')
  @ApiOperation({ summary: '법안 변경 알림 생성(멱등)' })
  create(@Req() req: { user: { id: string } }, @Param('billId') billId: string) {
    validateBillId(billId);
    return this.service.create(req.user.id, billId);
  }

  @Delete(':watchId')
  @ApiOperation({ summary: '법안 변경 알림 해제(소유권 확인)' })
  disable(@Req() req: { user: { id: string } }, @Param('watchId') watchId: string) {
    validateBillId(watchId); // cuid도 [\w-] 범위라 동일 검증
    return this.service.disable(req.user.id, watchId);
  }
}
