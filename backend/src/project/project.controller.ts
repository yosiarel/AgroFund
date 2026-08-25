import { Controller, Get, Post, Body, Param, UseGuards, Request, Delete, Patch } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CompleteProjectDto } from './dto/complete-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('project')
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  findAll() {
    return this.projectService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.UMKM)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get projects created by current UMKM' })
  findMyProjects(@Request() req: any) {
    return this.projectService.findMyProjects(req.user.userId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.projectService.findOne(id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.UMKM)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new project (UMKM only)' })
  create(@Request() req: any, @Body() dto: CreateProjectDto) {
    return this.projectService.create(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.UMKM)
  @Post(':id/complete')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Complete a project (SUCCESS or FAILED) (UMKM only)' })
  complete(@Request() req: any, @Param('id') id: string, @Body() dto: CompleteProjectDto) {
    return this.projectService.completeProject(req.user.userId, id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.UMKM)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a project (UMKM only)' })
  delete(@Request() req: any, @Param('id') id: string) {
    return this.projectService.deleteProject(req.user.userId, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.UMKM)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a project (UMKM only)' })
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectService.updateProject(req.user.userId, id, dto);
  }
}
