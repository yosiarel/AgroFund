import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProcurementDto, ApproveProcurementDto } from './dto/procurement.dto';
import { ProjectStatus, Role } from '@prisma/client';

@Injectable()
export class ProcurementService {
  constructor(private readonly prisma: PrismaService) {}

  async requestProcurement(projectId: string, userId: string, dto: CreateProcurementDto) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project tidak ditemukan');
    if (project.userId !== userId) throw new ForbiddenException('Akses ditolak');
    
    if (project.status !== ProjectStatus.DANA_TERPENUHI && project.status !== ProjectStatus.EXECUTION) {
      throw new BadRequestException('Project belum dalam tahap pelaksanaan atau dana belum terpenuhi');
    }

    let totalCost = BigInt(0);
    const itemsData = dto.items.map(i => {
      totalCost += BigInt(i.quantity) * BigInt(i.estimatedUnitPrice);
      return {
        name: i.name,
        quantity: i.quantity,
        estimatedUnitPrice: BigInt(i.estimatedUnitPrice)
      };
    });

    const ledger = await this.prisma.projectFinancialLedger.findFirst({
      where: { projectId }
    });

    if (!ledger || ledger.remainingBalance < totalCost) {
      throw new BadRequestException('Saldo buku besar proyek tidak mencukupi untuk pengajuan ini');
    }

    const request = await this.prisma.procurementRequest.create({
      data: {
        projectId,
        status: 'REQUESTED',
        items: {
          create: itemsData
        }
      },
      include: { items: true }
    });

    return request;
  }

  async approveProcurement(requestId: string, userId: string, dto: ApproveProcurementDto) {
    const request = await this.prisma.procurementRequest.findUnique({ 
      where: { id: requestId },
      include: { project: true }
    });
    
    if (!request) throw new NotFoundException('Procurement Request tidak ditemukan');
    if (request.status !== 'REQUESTED') throw new BadRequestException('Request ini sudah diproses');

    // In MVP, Koperasi is the one who approves
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.role !== Role.KOPERASI && user?.role !== Role.AGROFUND) {
      throw new ForbiddenException('Akses ditolak, hanya Koperasi atau Admin yang dapat menyetujui');
    }

    if (user?.role === Role.KOPERASI && request.project.koperasiId !== userId) {
      throw new ForbiddenException('Bukan Koperasi yang ditugaskan untuk proyek ini');
    }

    const updated = await this.prisma.procurementRequest.update({
      where: { id: requestId },
      data: {
        status: dto.status,
        notes: dto.notes
      }
    });

    // If approved, change project status to PROCUREMENT if it's currently DANA_TERPENUHI
    if (dto.status === 'APPROVED' && request.project.status === ProjectStatus.DANA_TERPENUHI) {
      await this.prisma.project.update({
        where: { id: request.projectId },
        data: { status: ProjectStatus.PROCUREMENT }
      });
    }

    return updated;
  }
}
