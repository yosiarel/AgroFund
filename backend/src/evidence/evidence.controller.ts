import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EvidenceService } from './evidence.service';

@ApiTags('evidence')
@Controller('evidence')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Get(':id/access')
  @ApiOperation({
    summary:
      'Mendapatkan akses URL terotentikasi sementara untuk bukti/evidence (PB-151)',
  })
  @ApiResponse({
    status: 200,
    description: 'Berhasil menghasilkan URL akses bertanda tangan',
  })
  @ApiResponse({
    status: 403,
    description: 'Akses ditolak — pengguna tidak berhak mengakses proyek ini',
  })
  @ApiResponse({
    status: 404,
    description: 'Evidence atau proyek tidak ditemukan',
  })
  async getSecureAccess(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.userId;
    const role = req.user.role;
    return this.evidenceService.getSecureEvidenceAccess(id, userId, role);
  }
}
