import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../auth/auth.guard';
import { UserPreferencesService } from './user-preferences.service';
import { UpdatePreferenceDto } from './dto/update-preference.dto';

const MAX_ID_LENGTH = 64;

function validateId(id: string, label: string): void {
  if (!id || id.length > MAX_ID_LENGTH || !/^[\w-]+$/.test(id)) {
    throw new BadRequestException(`유효하지 않은 ${label}입니다.`);
  }
}

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('user/preferences')
export class UserPreferencesController {
  constructor(private readonly service: UserPreferencesService) {}

  @Get()
  @ApiOperation({ summary: '내 환경설정 조회' })
  get(@Req() req: { user: { id: string } }) {
    return this.service.getOrCreate(req.user.id);
  }

  @Patch()
  @ApiOperation({ summary: '환경설정 업데이트 (부분)' })
  update(@Req() req: { user: { id: string } }, @Body() body: UpdatePreferenceDto) {
    return this.service.update(req.user.id, body);
  }

  @Post('bookmarks/bills/:billId')
  @ApiOperation({ summary: '법안 즐겨찾기 추가' })
  addBillBookmark(@Req() req: { user: { id: string } }, @Param('billId') billId: string) {
    validateId(billId, '법안 ID');
    return this.service.addBillBookmark(req.user.id, billId);
  }

  @Delete('bookmarks/bills/:billId')
  @ApiOperation({ summary: '법안 즐겨찾기 삭제' })
  removeBillBookmark(@Req() req: { user: { id: string } }, @Param('billId') billId: string) {
    validateId(billId, '법안 ID');
    return this.service.removeBillBookmark(req.user.id, billId);
  }

  @Post('bookmarks/members/:memberId')
  @ApiOperation({ summary: '의원 즐겨찾기 추가' })
  addMemberBookmark(@Req() req: { user: { id: string } }, @Param('memberId') memberId: string) {
    validateId(memberId, '의원 ID');
    return this.service.addMemberBookmark(req.user.id, memberId);
  }

  @Delete('bookmarks/members/:memberId')
  @ApiOperation({ summary: '의원 즐겨찾기 삭제' })
  removeMemberBookmark(@Req() req: { user: { id: string } }, @Param('memberId') memberId: string) {
    validateId(memberId, '의원 ID');
    return this.service.removeMemberBookmark(req.user.id, memberId);
  }
}
