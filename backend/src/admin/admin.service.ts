import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectStatus, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateKoperasiDto } from './dto/create-koperasi.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async provisionCooperative(dto: CreateKoperasiDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (existingUser) {
      throw new BadRequestException('Username sudah terdaftar');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const koperasi = await this.prisma.user.create({
      data: {
        username: dto.username,
        password: hashedPassword,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        role: Role.KOPERASI,
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
      }
    });

    return koperasi;
  }

  async getAnalyticsSummary() {
    try {
      const [
        totalUsers,
        totalUmkm,
        totalInvestors,
        totalKoperasi,
        activeProjects,
        successProjects,
        failedProjects,
        totalInvestments,
        recentProjects,
      ] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { role: Role.UMKM } }),
        this.prisma.user.count({ where: { role: Role.PENDANA } }),
        this.prisma.user.count({ where: { role: Role.KOPERASI } }),
        this.prisma.project.count({
          where: { status: { in: [ProjectStatus.FUNDRAISING, ProjectStatus.DANA_TERPENUHI, ProjectStatus.PROCUREMENT, ProjectStatus.EXECUTION] } },
        }),
        this.prisma.project.count({ where: { status: ProjectStatus.SUKSES_DITUTUP } }),
        this.prisma.project.count({ where: { status: ProjectStatus.GAGAL_DITUTUP } }),
        this.prisma.contribution.aggregate({
          _sum: { amount: true },
          where: { status: 'PAID' },
        }),
        this.prisma.project.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            status: true,
            targetAmount: true,
            fundedAmount: true,
            createdAt: true,
            user: { select: { name: true } },
          },
        }),
      ]);

      const totalFundingCollected = totalInvestments._sum.amount ?? BigInt(0);

      return {
        totalUsers,
        totalUmkm,
        totalInvestors,
        totalKoperasi,
        activeProjects,
        successProjects,
        failedProjects,
        totalFundingCollected: totalFundingCollected.toString(),
        recentProjects,
      };
    } catch (error) {
      throw new InternalServerErrorException('Gagal mengambil data analitik admin');
    }
  }
}
