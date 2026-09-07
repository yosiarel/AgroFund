import { Controller, Post, Body } from '@nestjs/common';
import { CronService } from './cron.service';
import { TriggerCronDto } from './dto/cron.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('cron')
@Controller('cron')
export class CronController {
  constructor(private readonly cronService: CronService) {}

  @Post('check-expired-funds')
  @ApiOperation({
    summary: 'Menjalankan Cron Job manual untuk mengecek proyek kadaluarsa',
  })
  @ApiResponse({ status: 201, description: 'Berhasil menjalankan pengecekan' })
  checkExpiredFunds(@Body() dto: TriggerCronDto) {
    return this.cronService.checkExpiredFunds(dto);
  }
}
