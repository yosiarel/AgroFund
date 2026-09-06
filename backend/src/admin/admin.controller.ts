import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateKoperasiDto } from './dto/create-koperasi.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('cooperatives')
  @Roles('AGROFUND')
  async provisionCooperative(@Body() dto: CreateKoperasiDto) {
    const data = await this.adminService.provisionCooperative(dto);
    return {
      message: 'Berhasil membuat akun koperasi',
      data
    };
  }

  @Get('analytics')
  @Roles('AGROFUND')
  async getAnalyticsSummary() {
    const data = await this.adminService.getAnalyticsSummary();
    return {
      message: 'Berhasil mengambil data analitik admin',
      data
    };
  }
}
