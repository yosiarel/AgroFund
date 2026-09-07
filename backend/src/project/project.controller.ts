import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateDraftDto } from './dto/create-draft.dto';
import { AssessProjectDto } from './dto/assess-project.dto';
import { ReviewProjectDto } from './dto/review-project.dto';
import {
  CreateMilestoneDto,
  ReportProgressDto,
  ReportMaterialIssueDto,
} from './dto/execution.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ProjectStatus } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('projects')
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('UMKM')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Membuat Draf Proyek oleh UMKM' })
  @ApiResponse({ status: 201, description: 'Berhasil membuat draf proyek' })
  createDraft(@Request() req: any, @Body() dto: CreateDraftDto) {
    return this.projectService.createDraft(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Melihat daftar proyek' })
  @ApiResponse({ status: 200, description: 'Berhasil mengambil daftar proyek' })
  @ApiQuery({ name: 'status', required: false, enum: ProjectStatus })
  getProjects(@Query('status') status?: ProjectStatus) {
    return this.projectService.getProjects(status);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('UMKM')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Melihat daftar proyek milik UMKM' })
  @ApiResponse({ status: 200, description: 'Berhasil mengambil daftar proyek' })
  getMyProjects(@Request() req: any) {
    return this.projectService.getMyProjects(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Melihat detail proyek' })
  @ApiResponse({ status: 200, description: 'Berhasil mengambil detail proyek' })
  getProjectById(@Param('id') id: string) {
    return this.projectService.getProjectById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('UMKM')
  @Post(':id/request-assessment')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mengajukan penilaian Koperasi oleh UMKM' })
  @ApiResponse({ status: 201, description: 'Berhasil mengajukan penilaian' })
  requestAssessment(@Param('id') id: string, @Request() req: any) {
    return this.projectService.requestAssessment(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('KOPERASI')
  @Post(':id/assess')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Menilai Proyek oleh Koperasi' })
  @ApiResponse({ status: 201, description: 'Berhasil mencatat penilaian' })
  assessProject(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: AssessProjectDto,
  ) {
    return this.projectService.assessProject(id, req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AGROFUND')
  @Post(':id/review')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Meninjau Proyek oleh Admin AgroFund' })
  @ApiResponse({ status: 201, description: 'Berhasil mencatat tinjauan' })
  reviewProject(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: ReviewProjectDto,
  ) {
    return this.projectService.reviewProject(id, req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AGROFUND')
  @Post(':id/publish')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Mempublikasikan Proyek ke tahap Penggalangan Dana oleh Admin',
  })
  @ApiResponse({ status: 201, description: 'Berhasil mempublikasikan proyek' })
  publishProject(@Param('id') id: string) {
    return this.projectService.publishProject(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('UMKM')
  @Post(':id/milestones')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Membuat Milestone baru oleh UMKM (PB-089)' })
  @ApiResponse({ status: 201, description: 'Berhasil membuat milestone' })
  createMilestone(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: CreateMilestoneDto,
  ) {
    return this.projectService.createMilestone(id, req.user.userId, dto);
  }

  @Get(':id/milestones')
  @ApiOperation({ summary: 'Melihat daftar Milestone proyek' })
  @ApiResponse({
    status: 200,
    description: 'Berhasil mengambil daftar milestone',
  })
  getMilestones(@Param('id') id: string) {
    return this.projectService.getMilestones(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('UMKM')
  @Post(':id/milestones/:milestoneId/reports')
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Mengirim Laporan Progres & Bukti Lapangan oleh UMKM (PB-090, PB-092, PB-147)',
  })
  @ApiResponse({
    status: 201,
    description: 'Berhasil mengirim laporan progres',
  })
  reportProgress(
    @Param('id') id: string,
    @Param('milestoneId') milestoneId: string,
    @Request() req: any,
    @Body() dto: ReportProgressDto,
  ) {
    return this.projectService.reportProgress(
      id,
      milestoneId,
      req.user.userId,
      dto,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('UMKM')
  @Post(':id/incidents')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Melaporkan Kendala/Issue Material oleh UMKM (PB-094)',
  })
  @ApiResponse({
    status: 201,
    description: 'Berhasil mencatat laporan kendala',
  })
  reportMaterialIssue(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: ReportMaterialIssueDto,
  ) {
    return this.projectService.reportMaterialIssue(id, req.user.userId, dto);
  }

  @Get(':id/financials')
  @ApiOperation({ summary: 'Melihat Visibilitas Keuangan Proyek (PB-095)' })
  @ApiResponse({
    status: 200,
    description: 'Berhasil mengambil data visibilitas keuangan',
  })
  getProjectFinancials(@Param('id') id: string) {
    return this.projectService.getProjectFinancials(id);
  }

  @Get(':id/monitoring')
  @ApiOperation({
    summary: 'Melihat Ringkasan Monitoring Proyek berbasis Role (PB-093)',
  })
  @ApiResponse({
    status: 200,
    description: 'Berhasil mengambil data monitoring',
  })
  getProjectMonitoring(@Param('id') id: string, @Request() req: any) {
    const role = req.user?.role || 'PUBLIC';
    return this.projectService.getProjectMonitoring(id, role);
  }

  @Get(':id/schedule')
  @ApiOperation({ summary: 'Melihat Jadwal Pelaporan Proyek (PB-091)' })
  @ApiResponse({
    status: 200,
    description: 'Berhasil mengambil jadwal pelaporan',
  })
  getProjectSchedule(@Param('id') id: string) {
    return this.projectService.getProjectSchedule(id);
  }
}
