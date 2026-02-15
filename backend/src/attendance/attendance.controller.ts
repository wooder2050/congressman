import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { AttendanceService } from './attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  findOne(@Query('memberId') memberId: string, @Query('termId', ParseIntPipe) termId: number) {
    return this.attendanceService.findOne(memberId, termId);
  }

  @Get('absence')
  getAbsenceDetails(
    @Query('memberId') memberId: string,
    @Query('termId', ParseIntPipe) termId: number,
  ) {
    return this.attendanceService.getAbsenceDetails(memberId, termId);
  }
}
