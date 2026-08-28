import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectStatus, Role, TransactionType } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) { }

  async getAnalyticsSummary() {
    try {
      const [
        totalUsers,
        totalUmkm,
        totalInvestors,
        activeProjects,
        successProjects,
        failedProjects,
        totalOrders,
        pendingOrders,
        adminWallets,
        totalInvestments,
        recentProjects,
      ] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { role: Role.UMKM } }),
        this.prisma.user.count({ where: { role: Role.INVESTOR } }),
        this.prisma.project.count({
          where: { status: { in: [ProjectStatus.FUNDING, ProjectStatus.FUNDED] } },
        }),
        this.prisma.project.count({ where: { status: ProjectStatus.SUCCESS } }),
        this.prisma.project.count({ where: { status: ProjectStatus.FAILED } }),
        this.prisma.order.count(),
        this.prisma.order.count({ where: { status: 'PENDING' } }),
        this.prisma.wallet.findMany({ where: { user: { role: Role.ADMIN } } }),
        this.prisma.investment.aggregate({
          _sum: { amount: true },
          where: { status: 'SUCCESS' },
        }),

        this.prisma.project.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            status: true,
            targetAmount: true,
            collectedAmount: true,
            createdAt: true,
            user: { select: { name: true } },
          },
        }),
      ]);

      const totalHold = adminWallets.reduce(
        (acc, wallet) => acc + BigInt(wallet.hold || 0),
        BigInt(0),
      );

      const totalFundingCollected = totalInvestments._sum.amount ?? BigInt(0);

      return {
        totalUsers,
        totalUmkm,
        totalInvestors,
        activeProjects,
        successProjects,
        failedProjects,
        totalOrders,
        pendingOrders,
        totalHold: totalHold.toString(),
        totalFundingCollected: totalFundingCollected.toString(),
        recentProjects,
      };
    } catch (error) {
      throw new InternalServerErrorException('Gagal mengambil data analitik admin');
    }
  }
}
