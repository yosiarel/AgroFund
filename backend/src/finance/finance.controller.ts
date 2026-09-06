import { Controller, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { ContributeDto, WebhookDto } from './dto/finance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('finance')
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('UMKM')
  @Post('projects/:id/guarantee/pay')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mendapatkan link pembayaran Uang Jaminan oleh UMKM' })
  @ApiResponse({ status: 201, description: 'Berhasil membuat tagihan jaminan' })
  generateGuaranteePayment(@Param('id') id: string, @Request() req: any) {
    return this.financeService.generateGuaranteePayment(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PENDANA')
  @Post('projects/:id/contribute')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Memberikan pendanaan ke Proyek oleh Pendana (Investor)' })
  @ApiResponse({ status: 201, description: 'Berhasil membuat tagihan pendanaan' })
  contribute(@Param('id') id: string, @Request() req: any, @Body() dto: ContributeDto) {
    return this.financeService.contribute(id, req.user.userId, dto);
  }

  // Webhook is public (in real life it should validate signature from Xendit)
  @Post('webhook/xendit')
  @ApiOperation({ summary: 'Endpoint simulasi Webhook dari Payment Gateway' })
  @ApiResponse({ status: 201, description: 'Berhasil memproses pembayaran' })
  handleWebhook(@Body() dto: WebhookDto) {
    return this.financeService.handleWebhook(dto);
  }
}
