import { Controller, Post, Body, Param, UseGuards, Request, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { ContributeDto, WebhookDto } from './dto/finance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('finance')
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('UMKM')
  @ApiBearerAuth()
  @Post('projects/:id/guarantee/pay')
  @ApiOperation({ summary: 'Membuat tagihan jaminan (Oleh UMKM) via Xendit' })
  @ApiResponse({ status: 201, description: 'Berhasil membuat link pembayaran jaminan' })
  generateGuaranteePayment(@Param('id') id: string, @Request() req: any) {
    return this.financeService.generateGuaranteePayment(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PENDANA')
  @ApiBearerAuth()
  @Post('projects/:id/contribute')
  @ApiOperation({ summary: 'Memberikan pendanaan ke Proyek (Oleh Pendana) via Xendit' })
  @ApiResponse({ status: 201, description: 'Berhasil membuat tagihan investasi' })
  contribute(@Param('id') id: string, @Request() req: any, @Body() dto: ContributeDto) {
    return this.financeService.contribute(id, req.user.userId, dto);
  }

  @Post('webhook/xendit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook URL untuk dipanggil oleh Xendit Invoices (Jangan dipanggil manual jika tidak tahu Webhook Token)' })
  @ApiResponse({ status: 200, description: 'Berhasil memproses Webhook' })
  handleWebhook(
    @Headers('x-callback-token') callbackToken: string,
    @Body() dto: any
  ) {
    return this.financeService.handleWebhook(callbackToken, dto as WebhookDto);
  }
}
