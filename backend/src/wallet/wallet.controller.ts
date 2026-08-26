import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TopUpDto } from './dto/topup.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) { }

  @UseGuards(JwtAuthGuard)
  @Post('topup')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Top-up wallet balance via Xendit' })
  topup(@Request() req: any, @Body() dto: TopUpDto) {
    return this.walletService.topup(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('transactions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get transaction history' })
  getTransactions(@Request() req: any) {
    return this.walletService.getTransactions(req.user.userId);
  }

  @SkipThrottle()
  @Post('webhook/xendit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xendit Webhook Callback' })
  xenditWebhook(@Body() payload: any, @Headers('x-callback-token') token: string) {
    if (token !== process.env.XENDIT_WEBHOOK_TOKEN) {
      throw new UnauthorizedException('Token Webhook Xendit tidak valid');
    }
    return this.walletService.handleXenditWebhook(payload);
  }
}

