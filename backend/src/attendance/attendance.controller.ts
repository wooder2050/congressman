import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';

@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  @ApiOperation({ summary: '출석 정보', description: '의원의 출석 통계를 반환합니다' })
  @ApiQuery({ name: 'memberId', description: '의원 ID' })
  @ApiQuery({ name: 'termId', type: Number, description: '국회 대수' })
  findOne(@Query('memberId') memberId: string, @Query('termId', ParseIntPipe) termId: number) {
    return this.attendanceService.findOne(memberId, termId);
  }

  @Get('absence')
  @ApiOperation({ summary: '결석 상세', description: '의원의 결석 상세 내역을 반환합니다' })
  @ApiQuery({ name: 'memberId', description: '의원 ID' })
  @ApiQuery({ name: 'termId', type: Number, description: '국회 대수' })
  getAbsenceDetails(
    @Query('memberId') memberId: string,
    @Query('termId', ParseIntPipe) termId: number,
  ) {
    return this.attendanceService.getAbsenceDetails(memberId, termId);
  }
}
