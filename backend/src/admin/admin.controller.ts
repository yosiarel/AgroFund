import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateKoperasiDto } from './dto/create-koperasi.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('cooperatives')
  @Roles('AGROFUND')
  @ApiOperation({ summary: 'Mendaftarkan akun Koperasi baru oleh Admin' })
  @ApiResponse({ status: 201, description: 'Berhasil mendaftarkan akun koperasi' })
  async provisionCooperative(@Body() dto: CreateKoperasiDto) {
    const data = await this.adminService.provisionCooperative(dto);
    return {
      message: 'Berhasil membuat akun koperasi',
      data
    };
  }

  @Get('cooperatives')
  @Roles('AGROFUND')
  @ApiOperation({ summary: 'Melihat daftar seluruh Koperasi oleh Admin' })
  @ApiResponse({ status: 200, description: 'Berhasil mengambil daftar koperasi' })
  async getCooperatives() {
    const data = await this.adminService.getCooperatives();
    return {
      message: 'Berhasil mengambil daftar koperasi',
      data
    };
  }

  @Get('analytics')
  @Roles('AGROFUND')
  @ApiOperation({ summary: 'Melihat ringkasan data analitik sistem' })
  @ApiResponse({ status: 200, description: 'Berhasil mengambil data analitik' })
  async getAnalyticsSummary() {
    const data = await this.adminService.getAnalyticsSummary();
    return {
      message: 'Berhasil mengambil data analitik admin',
      data
    };
  }
}
