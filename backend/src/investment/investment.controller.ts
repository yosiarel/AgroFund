import { Controller, Post, Patch, Body, Param, UseGuards, Request, Get, HttpCode, HttpStatus, Headers, UnauthorizedException } from '@nestjs/common';
import { InvestmentService } from './investment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { FundDto } from './dto/fund.dto';
import { UpdateResiDto } from './dto/update-resi.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('investment')
@Controller('investment')
export class InvestmentController {
  constructor(private readonly investmentService: InvestmentService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INVESTOR)
  @Get('me')
  @ApiOperation({ summary: 'Get investments by current user' })
  findMyInvestments(@Request() req: any) {
    return this.investmentService.findMyInvestments(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INVESTOR)
  @Post('fund/:projectId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fund a project using Wallet (Investor only)' })
  fund(@Request() req: any, @Param('projectId') projectId: string, @Body() dto: FundDto) {
    return this.investmentService.fund(req.user.userId, projectId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INVESTOR)
  @Post('fund-direct/:projectId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fund a project via Direct Xendit Payment (Investor only)' })
  fundDirect(@Request() req: any, @Param('projectId') projectId: string, @Body() dto: FundDto) {
    return this.investmentService.fundDirect(req.user.userId, projectId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INVESTOR)
  @Post(':id/confirm-receipt')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm receipt of goods for a specific investment (Investor only)' })
  confirmReceipt(@Request() req: any, @Param('id') id: string) {
    return this.investmentService.confirmReceipt(req.user.userId, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.UMKM)
  @Patch(':id/resi')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update tracking resi for a specific investment (UMKM only)' })
  updateResi(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateResiDto) {
    return this.investmentService.updateResi(req.user.userId, id, dto);
  }

  @Post('webhook/xendit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xendit Webhook Callback for Direct Investment' })
  xenditWebhook(@Body() payload: any, @Headers('x-callback-token') token: string) {
    if (token !== process.env.XENDIT_WEBHOOK_TOKEN) {
      throw new UnauthorizedException('Token Webhook Xendit tidak valid');
    }
    return this.investmentService.handleDirectWebhook(payload);
  }
}
