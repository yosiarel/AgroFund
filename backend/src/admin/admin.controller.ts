import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('analytics')
  @Roles('ADMIN')
  async getAnalyticsSummary() {
    const data = await this.adminService.getAnalyticsSummary();
    return {
      message: 'Berhasil mengambil data analitik admin',
      data
    };
  }
}
