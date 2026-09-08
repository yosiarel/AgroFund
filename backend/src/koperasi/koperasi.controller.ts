import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { KoperasiService } from './koperasi.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ReviewEvidenceDto } from '../project/dto/execution.dto';

@ApiTags('Koperasi')
@ApiBearerAuth()
@Controller('koperasi')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KoperasiController {
  constructor(private readonly koperasiService: KoperasiService) {}

  @Get()
  @Roles('UMKM', 'AGROFUND')
  @ApiOperation({ summary: 'Melihat daftar koperasi yang tersedia untuk UMKM' })
  @ApiResponse({
    status: 200,
    description: 'Berhasil mengambil daftar koperasi',
  })
  async findAll() {
    const data = await this.koperasiService.findAll();
    return {
      message: 'Berhasil mengambil daftar koperasi',
      data,
    };
  }

  @Get('projects')
  @Roles('KOPERASI')
  @ApiOperation({
    summary: 'Melihat daftar proyek yang ditugaskan ke Koperasi',
  })
  @ApiResponse({
    status: 200,
    description: 'Berhasil mengambil proyek koperasi',
  })
  async getAssignedProjects(@Request() req: any) {
    const data = await this.koperasiService.findAssignedProjects(
      req.user.userId,
    );
    return {
      message: 'Berhasil mengambil daftar proyek koperasi',
      data,
    };
  }

  @Get('evidence-reports')
  @Roles('KOPERASI', 'AGROFUND')
  @ApiOperation({
    summary:
      'Melihat daftar bukti progres dari proyek binaan untuk diverifikasi (PB-147, PB-148)',
  })
  @ApiResponse({
    status: 200,
    description: 'Berhasil mengambil daftar bukti progres',
  })
  async getEvidenceReports(@Request() req: any) {
    return this.koperasiService.getEvidenceReports(req.user.userId);
  }

  @Post('evidence-reports/:reportId/review')
  @Roles('KOPERASI', 'AGROFUND')
  @ApiOperation({
    summary:
      'Melakukan verifikasi faktual bukti progres (VALIDATED / REJECTED)',
  })
  @ApiResponse({
    status: 200,
    description: 'Berhasil memverifikasi bukti progres',
  })
  async reviewEvidenceReport(
    @Param('reportId') reportId: string,
    @Request() req: any,
    @Body() dto: ReviewEvidenceDto,
  ) {
    return this.koperasiService.reviewEvidenceReport(
      req.user.userId,
      reportId,
      dto.status,
    );
  }

  @Get('analytics')
  @Roles('KOPERASI')
  @ApiOperation({
    summary: 'Melihat ringkasan dasbor Koperasi',
  })
  @ApiResponse({
    status: 200,
    description: 'Berhasil mengambil data analitik koperasi',
  })
  async getAnalyticsSummary(@Request() req: any) {
    const data = await this.koperasiService.getAnalyticsSummary(
      req.user.userId,
    );
    return {
      message: 'Berhasil mengambil data analitik koperasi',
      data,
    };
  }
}
