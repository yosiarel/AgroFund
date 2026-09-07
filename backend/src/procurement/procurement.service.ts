import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProcurementDto,
  ApproveProcurementDto,
} from './dto/procurement.dto';
import { ProjectStatus, Role } from '@prisma/client';

@Injectable()
export class ProcurementService {
  constructor(private readonly prisma: PrismaService) {}

  async requestProcurement(
    projectId: string,
    userId: string,
    dto: CreateProcurementDto,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project tidak ditemukan');
    if (project.userId !== userId)
      throw new ForbiddenException('Akses ditolak');

    if (
      project.status !== ProjectStatus.DANA_TERPENUHI &&
      project.status !== ProjectStatus.EXECUTION
    ) {
      throw new BadRequestException(
        'Project belum dalam tahap pelaksanaan atau dana belum terpenuhi',
      );
    }

    let totalCost = BigInt(0);
    const itemsData = dto.items.map((i) => {
      totalCost += BigInt(i.quantity) * BigInt(i.estimatedUnitPrice);
      return {
        name: i.name,
        quantity: i.quantity,
        estimatedUnitPrice: BigInt(i.estimatedUnitPrice),
      };
    });

    const ledger = await this.prisma.projectFinancialLedger.findFirst({
      where: { projectId },
    });

    if (!ledger || ledger.remainingBalance < totalCost) {
      throw new BadRequestException(
        'Saldo buku besar proyek tidak mencukupi untuk pengajuan ini',
      );
    }

    const request = await this.prisma.procurementRequest.create({
      data: {
        projectId,
        status: 'REQUESTED',
        notes: dto.notes,
        supplierId: dto.supplierId,
        nominatedSupplier: dto.nominatedSupplier ?? undefined,
        items: {
          create: itemsData,
        },
      },
      include: { items: true },
    });

    return request;
  }

  async approveProcurement(
    requestId: string,
    userId: string,
    dto: ApproveProcurementDto,
  ) {
    const request = await this.prisma.procurementRequest.findUnique({
      where: { id: requestId },
      include: { project: true },
    });

    if (!request)
      throw new NotFoundException('Procurement Request tidak ditemukan');
    if (request.status !== 'REQUESTED')
      throw new BadRequestException('Request ini sudah diproses');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.role !== Role.KOPERASI && user?.role !== Role.AGROFUND) {
      throw new ForbiddenException(
        'Akses ditolak, hanya Koperasi atau Admin yang dapat menyetujui',
      );
    }

    if (user?.role === Role.KOPERASI && request.project.koperasiId !== userId) {
      throw new ForbiddenException(
        'Bukan Koperasi yang ditugaskan untuk proyek ini',
      );
    }

    const updated = await this.prisma.procurementRequest.update({
      where: { id: requestId },
      data: {
        status: dto.status,
        notes: dto.notes,
      },
    });

    if (
      dto.status === 'APPROVED' &&
      request.project.status === ProjectStatus.DANA_TERPENUHI
    ) {
      await this.prisma.project.update({
        where: { id: request.projectId },
        data: { status: ProjectStatus.PROCUREMENT },
      });
    }

    return updated;
  }

  async getRequests(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    if (user.role === Role.KOPERASI) {
      return this.prisma.procurementRequest.findMany({
        where: { project: { koperasiId: userId } },
        include: {
          items: true,
          project: true,
          orders: { include: { supplier: true } },
        },
      });
    }

    if (user.role === Role.AGROFUND) {
      return this.prisma.procurementRequest.findMany({
        include: {
          items: true,
          project: true,
          orders: { include: { supplier: true } },
        },
      });
    }

    throw new ForbiddenException('Akses ditolak');
  }

  async issuePo(requestId: string, userId: string) {
    const request = await this.prisma.procurementRequest.findUnique({
      where: { id: requestId },
      include: { project: true, items: true },
    });

    if (!request)
      throw new NotFoundException('Procurement Request tidak ditemukan');
    if (request.status !== 'APPROVED')
      throw new BadRequestException('Request belum disetujui');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.role !== Role.KOPERASI && user?.role !== Role.AGROFUND) {
      throw new ForbiddenException(
        'Akses ditolak, hanya Koperasi atau Admin yang dapat menerbitkan PO',
      );
    }

    if (user?.role === Role.KOPERASI && request.project.koperasiId !== userId) {
      throw new ForbiddenException(
        'Bukan Koperasi yang ditugaskan untuk proyek ini',
      );
    }

    // Verify constraint Payment <= Available Allocation is implicitly checked
    // because during requestProcurement we check ledger.remainingBalance
    // But let's verify again
    let totalCost = BigInt(0);
    for (const item of request.items) {
      totalCost += BigInt(item.quantity) * BigInt(item.estimatedUnitPrice);
    }

    const ledger = await this.prisma.projectFinancialLedger.findFirst({
      where: { projectId: request.projectId },
    });

    if (!ledger || ledger.remainingBalance < totalCost) {
      throw new BadRequestException(
        'Saldo buku besar proyek tidak mencukupi untuk penerbitan PO ini',
      );
    }

    // Update status to PO_ISSUED and deduct from ledger
    await this.prisma.$transaction(async (tx) => {
      await tx.procurementRequest.update({
        where: { id: requestId },
        data: { status: 'PO_ISSUED' },
      });

      await tx.projectFinancialLedger.update({
        where: { id: ledger.id },
        data: { remainingBalance: ledger.remainingBalance - totalCost },
      });

      await tx.financialTransaction.create({
        data: {
          projectId: request.projectId,
          type: 'PROCUREMENT_PAYMENT',
          direction: 'OUT',
          amount: totalCost,
          source: 'AGROFUND_ESCROW',
          destination: 'SUPPLIER_ACCOUNT',
          referenceType: 'PROCUREMENT_REQUEST',
          referenceId: requestId,
          status: 'SUCCESS',
        },
      });
    });

    return { message: 'PO diterbitkan dan pembayaran diproses ke supplier' };
  }

  async getRequestsByProject(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project tidak ditemukan');

    return this.prisma.procurementRequest.findMany({
      where: { projectId },
      include: { items: true, orders: { include: { supplier: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSuppliers() {
    return this.prisma.supplierRecord.findMany({
      select: {
        id: true,
        name: true,
        contactInfo: true,
        businessInformation: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}
