import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDraftDto } from './dto/create-draft.dto';
import { AssessProjectDto } from './dto/assess-project.dto';
import { ReviewProjectDto } from './dto/review-project.dto';
import {
  CreateMilestoneDto,
  ReportProgressDto,
  ReportMaterialIssueDto,
} from './dto/execution.dto';
import { ProjectStatus, AssessmentStatus } from '@prisma/client';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) { }

  private calculateFinancials(basic: number, reserve: number, natura: number) {
    const cooperativeFee = Math.round(0.025 * (basic + reserve));
    const agrofundFee = Math.round(0.025 * basic);
    const targetAmount =
      basic + reserve + cooperativeFee + agrofundFee + natura;
    const guaranteeAmount = Math.round(0.05 * basic);

    return { cooperativeFee, agrofundFee, targetAmount, guaranteeAmount };
  }

  async createDraft(userId: string, dto: CreateDraftDto) {
    // Check if UMKM already has an active project
    const activeProject = await this.prisma.project.findFirst({
      where: {
        userId,
        status: {
          notIn: [ProjectStatus.SUKSES_DITUTUP, ProjectStatus.GAGAL_DITUTUP],
        },
      },
    });

    if (activeProject) {
      throw new BadRequestException(
        'Satu UMKM hanya boleh memiliki satu project aktif',
      );
    }

    const basic = dto.basicProcurementCapital;
    const reserve = dto.priceReserve || 0;
    const natura = dto.naturaCost || 0;

    const { cooperativeFee, agrofundFee, targetAmount, guaranteeAmount } =
      this.calculateFinancials(basic, reserve, natura);

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
        imageUrl: dto.imageUrl,
        naturaPackages: dto.naturaPackages
          ? {
            create: dto.naturaPackages.map((pkg) => ({
              name: pkg.name,
              description: pkg.description,
              amount: pkg.amount,
            })),
          }
          : undefined,
      },
    });

    return project;
  }

  async getProjects(status?: ProjectStatus) {
    const where = status ? { status } : {};
    return this.prisma.project.findMany({
      where,
      include: {
        user: { select: { name: true } },
        koperasi: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMyProjects(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      include: {
        user: { select: { name: true } },
        koperasi: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
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
      },
    });
    if (!project) throw new NotFoundException('Project tidak ditemukan');
    return project;
  }

  async requestAssessment(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project tidak ditemukan');
    if (project.userId !== userId)
      throw new ForbiddenException('Akses ditolak');

    if (
      project.status !== ProjectStatus.DRAFT &&
      project.status !== ProjectStatus.COOPERATIVE_ASSESSMENT
    ) {
      throw new BadRequestException(
        'Status project tidak valid untuk request assessment',
      );
    }

    return this.prisma.project.update({
      where: { id: projectId },
      data: { status: ProjectStatus.COOPERATIVE_ASSESSMENT },
    });
  }

  async assessProject(
    projectId: string,
    koperasiId: string,
    dto: AssessProjectDto,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project tidak ditemukan');
    if (project.koperasiId !== koperasiId)
      throw new ForbiddenException('Bukan koperasi yang ditugaskan');
    if (project.status !== ProjectStatus.COOPERATIVE_ASSESSMENT)
      throw new BadRequestException('Project belum siap di-assess');

    await this.prisma.assessment.create({
      data: {
        projectId,
        type: 'COOPERATIVE',
        assessorId: koperasiId,
        status: dto.status,
        notes: dto.notes,
      },
    });

    if (dto.status === AssessmentStatus.APPROVED) {
      await this.prisma.project.update({
        where: { id: projectId },
        data: { status: ProjectStatus.PUBLICATION_REVIEW },
      });
    }

    return { message: 'Assessment berhasil dicatat' };
  }

  async reviewProject(
    projectId: string,
    adminId: string,
    dto: ReviewProjectDto,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project tidak ditemukan');
    if (project.status !== ProjectStatus.PUBLICATION_REVIEW)
      throw new BadRequestException('Project belum siap di-review admin');

    await this.prisma.assessment.create({
      data: {
        projectId,
        type: 'AGROFUND',
        assessorId: adminId,
        status: dto.status,
        notes: dto.notes,
      },
    });

    if (dto.status === AssessmentStatus.APPROVED) {
      await this.prisma.project.update({
        where: { id: projectId },
        data: { status: ProjectStatus.GUARANTEE_PLACEMENT },
      });
    }

    return { message: 'Review berhasil dicatat' };
  }

  async publishProject(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project tidak ditemukan');

    if (project.status !== ProjectStatus.GUARANTEE_PLACEMENT) {
      throw new BadRequestException(
        'Project harus berada pada status GUARANTEE_PLACEMENT',
      );
    }
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 60);

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        status: ProjectStatus.FUNDRAISING,
        publishedAt: new Date(),
        fundraisingDeadline: deadline,
      },
    });
  }

  async createMilestone(
    projectId: string,
    userId: string,
    dto: CreateMilestoneDto,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project tidak ditemukan');
    if (project.userId !== userId)
      throw new ForbiddenException('Akses ditolak');

    return this.prisma.milestone.create({
      data: {
        projectId,
        name: dto.name,
        description: dto.description,
        plannedDate: dto.plannedDate ? new Date(dto.plannedDate) : undefined,
        status: 'PLANNED',
      },
    });
  }

  async getMilestones(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project tidak ditemukan');

    return this.prisma.milestone.findMany({
      where: { projectId },
      include: { reports: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async reportProgress(
    projectId: string,
    milestoneId: string,
    userId: string,
    dto: ReportProgressDto,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project tidak ditemukan');
    if (project.userId !== userId)
      throw new ForbiddenException('Akses ditolak');

    const milestone = await this.prisma.milestone.findUnique({
      where: { id: milestoneId },
    });
    if (!milestone || milestone.projectId !== projectId) {
      throw new NotFoundException('Milestone tidak ditemukan untuk proyek ini');
    }

    if (dto.progressPercentage < 0 || dto.progressPercentage > 100) {
      throw new BadRequestException(
        'Persentase progres harus berada pada rentang 0-100',
      );
    }

    const report = await this.prisma.$transaction(async (tx) => {
      const rep = await tx.progressReport.create({
        data: {
          milestoneId,
          progressPercentage: dto.progressPercentage,
          description: dto.description,
          status: 'SUBMITTED',
        },
      });

      if (dto.evidenceUrl) {
        await tx.evidence.create({
          data: {
            referenceType: 'PROGRESS_REPORT',
            referenceId: rep.id,
            fileUrl: dto.evidenceUrl,
            publicId: dto.evidencePublicId ?? null,
            description: dto.description,
            type: 'PHOTO',
            status: 'SUBMITTED',
          },
        });
      }

      await tx.milestone.update({
        where: { id: milestoneId },
        data: {
          status: dto.progressPercentage >= 100 ? 'COMPLETED' : 'IN_PROGRESS',
        },
      });

      if (dto.progressPercentage >= 100) {
        const remainingMilestones = await tx.milestone.findMany({
          where: {
            projectId,
            id: { not: milestoneId },
            status: { not: 'COMPLETED' },
          },
        });
        if (remainingMilestones.length === 0 && !project.outputAvailableAt) {
          await tx.project.update({
            where: { id: projectId },
            data: { outputAvailableAt: new Date() },
          });
        }
      }

      if (
        project.status !== ProjectStatus.EXECUTION &&
        project.status !== ProjectStatus.NATURA_FULFILLMENT
      ) {
        await tx.project.update({
          where: { id: projectId },
          data: {
            status: ProjectStatus.EXECUTION,
            executionStartedAt: project.executionStartedAt ?? new Date(),
          },
        });
      }

      return rep;
    });

    return report;
  }

  async reportMaterialIssue(
    projectId: string,
    userId: string,
    dto: ReportMaterialIssueDto,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project tidak ditemukan');
    if (project.userId !== userId)
      throw new ForbiddenException('Akses ditolak');

    const incident = await this.prisma.incident.create({
      data: {
        projectId,
        category: dto.category,
        severity: dto.severity,
        description: dto.description,
        status: 'UNDER_REVIEW',
      },
    });

    return {
      message:
        'Laporan kendala material berhasil diajukan dan sedang ditinjau Koperasi/Admin',
      incident,
    };
  }

  async getProjectFinancials(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project tidak ditemukan');

    const ledger = await this.prisma.projectFinancialLedger.findFirst({
      where: { projectId },
    });

    const totalUsedTransactions =
      await this.prisma.financialTransaction.aggregate({
        where: { projectId, direction: 'OUT', type: 'PROCUREMENT_PAYMENT' },
        _sum: { amount: true },
      });

    const allocatedAmount = project.basicProcurementCapital;
    const usedAmount = totalUsedTransactions._sum.amount || BigInt(0);
    const remainingBalance = ledger ? ledger.remainingBalance : BigInt(0);

    return {
      projectId: project.id,
      allocatedAmount: allocatedAmount.toString(),
      usedAmount: usedAmount.toString(),
      remainingBalance: remainingBalance.toString(),
    };
  }

  async getProjectMonitoring(projectId: string, role: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        milestones: { include: { reports: true } },
        incidents: true,
        procurementRequests: true,
      },
    });
    if (!project) throw new NotFoundException('Project tidak ditemukan');

    const totalMilestones = project.milestones.length;
    const completedMilestones = project.milestones.filter(
      (m) => m.status === 'COMPLETED',
    ).length;
    const overallProgress =
      totalMilestones > 0
        ? Math.round((completedMilestones / totalMilestones) * 100)
        : 0;

    let executionHealth = 'NORMAL';
    if (
      project.incidents.some(
        (i) => i.status === 'UNDER_REVIEW' && i.severity === 'HIGH',
      )
    ) {
      executionHealth = 'AT_RISK';
    } else if (project.incidents.some((i) => i.status === 'UNDER_REVIEW')) {
      executionHealth = 'DELAYED';
    }

    return {
      projectId: project.id,
      title: project.title,
      status: project.status,
      executionHealth,
      overallProgressPercentage: overallProgress,
      milestoneSummary: {
        total: totalMilestones,
        completed: completedMilestones,
      },
      incidentsCount: project.incidents.length,
      procurementRequestsCount: project.procurementRequests.length,
      roleView: role,
    };
  }

  async getProjectSchedule(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        milestones: {
          include: { reports: true },
          orderBy: { plannedDate: 'asc' },
        },
      },
    });
    if (!project) throw new NotFoundException('Project tidak ditemukan');

    // 1. Initial Report Due Date (fundingCompletedAt + 7 calendar days)
    let initialReportDueDate: string | null = null;
    if (project.fundingCompletedAt) {
      const initDate = new Date(
        project.fundingCompletedAt.getTime() + 7 * 24 * 60 * 60 * 1000,
      );
      initialReportDueDate = initDate.toISOString();
    }

    // 2. Execution Report Due Date
    // Authoritative anchor determination:
    // - If ProgressReports exist: most recent ProgressReport.createdAt (actual last submission).
    // - If no ProgressReports yet: executionStartedAt is the authoritative business event anchor.
    // - If neither exists (executionStartedAt is null): schedule is unavailable (returns null).
    // NEVER use fundingCompletedAt, publishedAt, createdAt, updatedAt, or new Date() as fallback anchors for execution reporting.
    const allReports = project.milestones
      .flatMap((m) => m.reports)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const lastReportAt: Date | null =
      allReports.length > 0
        ? allReports[0].createdAt
        : project.executionStartedAt; // null when execution has not started — no fabricated anchor

    const incompleteMilestoneWithPlannedDate = project.milestones.find(
      (m) => m.status !== 'COMPLETED' && m.plannedDate !== null,
    );

    let executionReportDueDate: string | null = null;
    let nextMilestonePlannedDate: string | null = null;

    if (lastReportAt) {
      const periodicDueDate = new Date(
        lastReportAt.getTime() + 30 * 24 * 60 * 60 * 1000,
      );

      if (
        incompleteMilestoneWithPlannedDate &&
        incompleteMilestoneWithPlannedDate.plannedDate
      ) {
        nextMilestonePlannedDate =
          incompleteMilestoneWithPlannedDate.plannedDate.toISOString();
        const milestoneDate = incompleteMilestoneWithPlannedDate.plannedDate;
        const effectiveDueDate =
          milestoneDate < periodicDueDate ? milestoneDate : periodicDueDate;
        executionReportDueDate = effectiveDueDate.toISOString();
      } else {
        executionReportDueDate = periodicDueDate.toISOString();
      }
    }
    // else: executionReportDueDate remains null — no authoritative anchor available

    const now = new Date();
    const isOverdue = executionReportDueDate
      ? now > new Date(executionReportDueDate)
      : false;

    // 3. Final Report Due Date (outputAvailableAt + 7 calendar days)
    let finalReportDueDate: string | null = null;
    if (project.outputAvailableAt) {
      const finalDate = new Date(
        project.outputAvailableAt.getTime() + 7 * 24 * 60 * 60 * 1000,
      );
      finalReportDueDate = finalDate.toISOString();
    }

    let reportingCondition = 'UP_TO_DATE';
    if (
      project.status === 'DANA_TERPENUHI' ||
      project.status === 'PROCUREMENT'
    ) {
      reportingCondition =
        initialReportDueDate && now > new Date(initialReportDueDate)
          ? 'OVERDUE'
          : 'INITIAL_DUE';
    } else if (project.status === 'EXECUTION') {
      reportingCondition = isOverdue ? 'OVERDUE' : 'EXECUTION_DUE';
    } else if (project.status === 'NATURA_FULFILLMENT') {
      reportingCondition =
        finalReportDueDate && now > new Date(finalReportDueDate)
          ? 'OVERDUE'
          : 'FINAL_DUE';
    }

    return {
      projectId: project.id,
      status: project.status,
      fundingCompletedAt: project.fundingCompletedAt
        ? project.fundingCompletedAt.toISOString()
        : null,
      executionStartedAt: project.executionStartedAt
        ? project.executionStartedAt.toISOString()
        : null,
      outputAvailableAt: project.outputAvailableAt
        ? project.outputAvailableAt.toISOString()
        : null,
      initialReportDueDate,
      executionReportDueDate,
      finalReportDueDate,
      nextMilestonePlannedDate,
      lastReportAt: lastReportAt ? lastReportAt.toISOString() : null,
      isOverdue,
      reportingCondition,
      scheduleRules: {
        initialReport: 'Maksimal 7 hari kalender setelah dana terdanai penuh',
        executionReport:
          'Setiap 30 hari kalender ATAU per milestone (pilih yang lebih awal)',
        finalReport: 'Maksimal 7 hari kalender setelah output tersedia',
      },
    };
  }
}
