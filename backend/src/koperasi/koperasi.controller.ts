import { Controller, Get, UseGuards } from '@nestjs/common';
import { KoperasiService } from './koperasi.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Koperasi')
@ApiBearerAuth()
@Controller('Koperasi')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KoperasiController {
  constructor(private readonly koperasiService: KoperasiService) { }

  @Get()
  @Roles('UMKM')
  @ApiOperation({ summary: 'Melihat daftar koperasi yang tersedia untuk UMKM' })
  @ApiResponse({ status: 200, description: 'Berhasil mengambil daftar koperasi' })
  async findAll() {
    const data = await this.koperasiService.findAll();
    return {
      message: 'Berhasil mengambil daftar koperasi',
      data
    };
  }
}
