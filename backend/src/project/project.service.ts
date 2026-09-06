import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDraftDto } from './dto/create-draft.dto';
import { AssessProjectDto } from './dto/assess-project.dto';
import { ReviewProjectDto } from './dto/review-project.dto';
import { ProjectStatus, Role, AssessmentStatus } from '@prisma/client';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) { }

  private calculateFinancials(basic: number, reserve: number, natura: number) {
    const cooperativeFee = Math.round(0.025 * (basic + reserve));
    const agrofundFee = Math.round(0.025 * basic);
    const targetAmount = basic + reserve + cooperativeFee + agrofundFee + natura;
    const guaranteeAmount = Math.round(0.05 * basic);

    return { cooperativeFee, agrofundFee, targetAmount, guaranteeAmount };
  }

  async createDraft(userId: string, dto: CreateDraftDto) {
    // Check if UMKM already has an active project
    const activeProject = await this.prisma.project.findFirst({
      where: {
        userId,
        status: {
          notIn: [ProjectStatus.SUKSES_DITUTUP, ProjectStatus.GAGAL_DITUTUP]
        }
      }
    });

    if (activeProject) {
      throw new BadRequestException('Satu UMKM hanya boleh memiliki satu project aktif');
    }

    const basic = dto.basicProcurementCapital;
    const reserve = dto.priceReserve || 0;
    const natura = dto.naturaCost || 0;

    const { cooperativeFee, agrofundFee, targetAmount, guaranteeAmount } = this.calculateFinancials(basic, reserve, natura);

    const project = await this.prisma.project.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        koperasiId: dto.koperasiId,
        basicProcurementCapital: basic,
        priceReserve: reserve,
        naturaCost: natura,
        cooperativeFeeProvision: cooperativeFee,
        agrofundServiceFee: agrofundFee,
        targetAmount: targetAmount,
        guaranteeAmount: guaranteeAmount,
        status: ProjectStatus.DRAFT,
        naturaPackages: dto.naturaPackages ? {
          create: dto.naturaPackages.map(pkg => ({
            name: pkg.name,
            description: pkg.description,
            amount: pkg.amount,
          }))
        } : undefined
      }
    });

    return project;
  }

  async getProjects(status?: ProjectStatus) {
    const where = status ? { status } : {};
    return this.prisma.project.findMany({
      where,
      include: {
        user: { select: { name: true } },
        koperasi: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getProjectById(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, phone: true } },
        koperasi: { select: { name: true } },
        naturaPackages: true,
        assessments: true,
      }
    });
    if (!project) throw new NotFoundException('Project tidak ditemukan');
    return project;
  }

  async requestAssessment(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project tidak ditemukan');
    if (project.userId !== userId) throw new ForbiddenException('Akses ditolak');

    if (project.status !== ProjectStatus.DRAFT && project.status !== ProjectStatus.COOPERATIVE_ASSESSMENT) {
      throw new BadRequestException('Status project tidak valid untuk request assessment');
    }

    return this.prisma.project.update({
      where: { id: projectId },
      data: { status: ProjectStatus.COOPERATIVE_ASSESSMENT }
    });
  }

  async assessProject(projectId: string, koperasiId: string, dto: AssessProjectDto) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project tidak ditemukan');
    if (project.koperasiId !== koperasiId) throw new ForbiddenException('Bukan koperasi yang ditugaskan');
    if (project.status !== ProjectStatus.COOPERATIVE_ASSESSMENT) throw new BadRequestException('Project belum siap di-assess');

    await this.prisma.assessment.create({
      data: {
        projectId,
        type: 'COOPERATIVE',
        assessorId: koperasiId,
        status: dto.status,
        notes: dto.notes
      }
    });

    if (dto.status === AssessmentStatus.APPROVED) {
      await this.prisma.project.update({
        where: { id: projectId },
        data: { status: ProjectStatus.PUBLICATION_REVIEW }
      });
    }

    return { message: 'Assessment berhasil dicatat' };
  }

  async reviewProject(projectId: string, adminId: string, dto: ReviewProjectDto) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project tidak ditemukan');
    if (project.status !== ProjectStatus.PUBLICATION_REVIEW) throw new BadRequestException('Project belum siap di-review admin');

    await this.prisma.assessment.create({
      data: {
        projectId,
        type: 'AGROFUND',
        assessorId: adminId,
        status: dto.status,
        notes: dto.notes
      }
    });

    if (dto.status === AssessmentStatus.APPROVED) {
      await this.prisma.project.update({
        where: { id: projectId },
        data: { status: ProjectStatus.GUARANTEE_PLACEMENT }
      });
    }

    return { message: 'Review berhasil dicatat' };
  }

  async publishProject(projectId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project tidak ditemukan');

    if (project.status !== ProjectStatus.GUARANTEE_PLACEMENT) {
      throw new BadRequestException('Project harus berada pada status GUARANTEE_PLACEMENT');
    }
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 60);

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        status: ProjectStatus.FUNDRAISING,
        publishedAt: new Date(),
        fundraisingDeadline: deadline
      }
    });
  }
}
