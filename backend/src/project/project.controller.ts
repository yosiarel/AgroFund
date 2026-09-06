import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateDraftDto } from './dto/create-draft.dto';
import { AssessProjectDto } from './dto/assess-project.dto';
import { ReviewProjectDto } from './dto/review-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ProjectStatus } from '@prisma/client';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

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
  assessProject(@Param('id') id: string, @Request() req: any, @Body() dto: AssessProjectDto) {
    return this.projectService.assessProject(id, req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AGROFUND')
  @Post(':id/review')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Meninjau Proyek oleh Admin AgroFund' })
  @ApiResponse({ status: 201, description: 'Berhasil mencatat tinjauan' })
  reviewProject(@Param('id') id: string, @Request() req: any, @Body() dto: ReviewProjectDto) {
    return this.projectService.reviewProject(id, req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AGROFUND')
  @Post(':id/publish')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mempublikasikan Proyek ke tahap Penggalangan Dana oleh Admin' })
  @ApiResponse({ status: 201, description: 'Berhasil mempublikasikan proyek' })
  publishProject(@Param('id') id: string) {
    return this.projectService.publishProject(id);
  }
}
