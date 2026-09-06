import { Controller, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ProcurementService } from './procurement.service';
import { CreateProcurementDto, ApproveProcurementDto } from './dto/procurement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('procurement')
@ApiBearerAuth()
@Controller('procurement')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProcurementController {
  constructor(private readonly procurementService: ProcurementService) {}

  @Roles('UMKM')
  @Post('projects/:id/request')
  @ApiOperation({ summary: 'Mengajukan Daftar Pengadaan (PO) oleh UMKM' })
  @ApiResponse({ status: 201, description: 'Berhasil mengajukan pengadaan' })
  requestProcurement(@Param('id') id: string, @Request() req: any, @Body() dto: CreateProcurementDto) {
    return this.procurementService.requestProcurement(id, req.user.userId, dto);
  }

  @Roles('KOPERASI', 'AGROFUND')
  @Post('requests/:requestId/approve')
  @ApiOperation({ summary: 'Menyetujui/Menolak Pengadaan (Oleh Koperasi/Admin)' })
  @ApiResponse({ status: 201, description: 'Berhasil memproses pengajuan pengadaan' })
  approveProcurement(@Param('requestId') requestId: string, @Request() req: any, @Body() dto: ApproveProcurementDto) {
    return this.procurementService.approveProcurement(requestId, req.user.userId, dto);
  }
}
