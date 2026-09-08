import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectStatus, Role } from '@prisma/client';

@Injectable()
export class KoperasiService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      where: { role: Role.KOPERASI },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findAssignedProjects(koperasiUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: koperasiUserId },
    });
    if (!user) return [];

    return this.prisma.project.findMany({
      where: { koperasiId: user.id },
      include: {
        user: { select: { id: true, name: true, phone: true } },
        procurementRequests: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getEvidenceReports(koperasiUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: koperasiUserId },
    });
    if (!user) return [];

    return this.prisma.progressReport.findMany({
      where: {
        milestone: {
          project: { koperasiId: user.id },
        },
      },
      include: {
        milestone: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
                user: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async reviewEvidenceReport(
    koperasiUserId: string,
    reportId: string,
    status: 'VALIDATED' | 'REJECTED',
  ) {
    const report = await this.prisma.progressReport.findUnique({
      where: { id: reportId },
      include: { milestone: { include: { project: true } } },
    });

    if (!report) throw new NotFoundException('Progress report tidak ditemukan');
    if (report.milestone.project.koperasiId !== koperasiUserId) {
      throw new ForbiddenException(
        'Akses ditolak, bukan Koperasi pembina untuk proyek ini',
      );
    }

    const updatedReport = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.progressReport.update({
        where: { id: reportId },
        data: { status },
      });

      await tx.evidence.updateMany({
        where: { referenceType: 'PROGRESS_REPORT', referenceId: reportId },
        data: { status },
      });

      return updated;
    });

    return {
      message: `Bukti progres berhasil ditandai sebagai ${status}`,
      report: updatedReport,
    };
  }

  async getAnalyticsSummary(koperasiUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: koperasiUserId },
    });
    if (!user) throw new NotFoundException('Koperasi tidak ditemukan');

    const [
      totalProjects,
      pendingAssessment,
      pendingProcurement,
      pendingEvidences,
      recentProjects,
    ] = await Promise.all([
      // Total Proyek Binaan
      this.prisma.project.count({
        where: { koperasiId: user.id },
      }),
      // Proyek di tahap ASSESSMENT
      this.prisma.project.count({
        where: { koperasiId: user.id, status: ProjectStatus.COOPERATIVE_ASSESSMENT },
      }),
      // Proyek di tahap PROCUREMENT
      this.prisma.project.count({
        where: { koperasiId: user.id, status: ProjectStatus.PROCUREMENT },
      }),
      // Bukti Laporan yang menunggu verifikasi
      this.prisma.progressReport.count({
        where: {
          milestone: { project: { koperasiId: user.id } },
          status: 'SUBMITTED',
        },
      }),
      // Proyek terbaru
      this.prisma.project.findMany({
        where: { koperasiId: user.id },
        take: 4,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      totalProjects,
      pendingAssessment,
      pendingProcurement,
      pendingEvidences,
      recentProjects,
    };
  }
}
