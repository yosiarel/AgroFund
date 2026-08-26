import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FundDto } from './dto/fund.dto';
import { TransactionType, ProjectStatus, Role } from '@prisma/client';
import { Xendit } from 'xendit-node';

@Injectable()
export class InvestmentService {
  private xenditClient: Xendit;

  constructor(private prisma: PrismaService) { 
    this.xenditClient = new Xendit({ secretKey: process.env.XENDIT_SECRET_KEY || 'dummy_key' });
  }

  async findMyInvestments(investorId: string) {
    return this.prisma.investment.findMany({
      where: { 
        investorId,
        status: { notIn: ['PENDING', 'FAILED'] }
      },
      include: {
        project: {
          select: { title: true, status: true, imageUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async fund(investorId: string, projectId: string, dto: FundDto) {
    const amount = BigInt(dto.amount);
    const skipReward = dto.skipReward ?? false;

    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.findUnique({ where: { id: projectId } });
      if (!project) throw new NotFoundException('Proyek tidak ditemukan');
      if (project.status !== ProjectStatus.PENDING && project.status !== ProjectStatus.FUNDING) {
        throw new BadRequestException('Proyek tidak tersedia untuk pendanaan');
      }

      const minNatura = (project.targetAmount * 5n) / 100n;
      const threshold = minNatura > 50000n ? minNatura : 50000n;
      if (!skipReward && amount < threshold) {
        throw new BadRequestException(`Minimal investasi untuk Natura adalah Rp${threshold}`);
      }

      const principal = skipReward ? amount : (amount * 100n) / 115n;
      const markup = skipReward ? 0n : amount - principal;

      const totalRequired = project.targetAmount;
      const oldCollected = project.collectedAmount;
      const newCollected = oldCollected + principal;
      const softCap = (totalRequired * 75n) / 100n;

      if (newCollected > totalRequired) {
        throw new BadRequestException('Nominal investasi melebihi sisa dana yang dibutuhkan proyek');
      }

      const investorWallet = await tx.wallet.findUnique({ where: { userId: investorId } });
      if (!investorWallet || investorWallet.balance < amount) {
        throw new BadRequestException('Saldo tidak mencukupi');
      }

      const admin = await tx.user.findFirst({ where: { role: Role.ADMIN } });
      if (!admin) throw new BadRequestException('Kesalahan Sistem: Akun Admin tidak ditemukan');

      await tx.wallet.update({
        where: { userId: investorId },
        data: { balance: { decrement: amount } }
      });

      if (newCollected < softCap) {
        await tx.wallet.upsert({
          where: { userId: admin.id },
          update: { hold: { increment: principal + markup } },
          create: { userId: admin.id, hold: principal + markup }
        });
      } else {
        if (oldCollected < softCap && oldCollected > 0n) {
          await tx.wallet.update({
            where: { userId: admin.id },
            data: { hold: { decrement: oldCollected } }
          });
          await tx.wallet.upsert({
            where: { userId: project.userId },
            update: { balance: { increment: oldCollected } },
            create: { userId: project.userId, balance: oldCollected }
          });
        }
        await tx.wallet.upsert({
          where: { userId: project.userId },
          update: { balance: { increment: principal } },
          create: { userId: project.userId, balance: principal }
        });
        if (markup > 0n) {
          await tx.wallet.upsert({
            where: { userId: admin.id },
            update: { hold: { increment: markup } },
            create: { userId: admin.id, hold: markup }
          });
        }
      }

      await tx.transaction.create({
        data: {
          userId: investorId,
          type: TransactionType.FUND,
          amount,
          referenceId: projectId
        }
      });

      const investment = await tx.investment.create({
        data: {
          projectId,
          investorId,
          amount,
          rewardOptIn: !skipReward,
          status: 'SUCCESS'
        }
      });

      let newStatus: ProjectStatus = project.status;
      if (project.status === ProjectStatus.PENDING) newStatus = ProjectStatus.FUNDING;
      if (newCollected === totalRequired) newStatus = ProjectStatus.FUNDED;

      await tx.project.update({
        where: { id: projectId },
        data: {
          collectedAmount: newCollected,
          status: newStatus
        }
      });

      return investment;
    });
  }

  async fundDirect(investorId: string, projectId: string, dto: FundDto) {
    const amount = BigInt(dto.amount);
    const skipReward = dto.skipReward ?? false;

    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Proyek tidak ditemukan');
    if (project.status !== ProjectStatus.PENDING && project.status !== ProjectStatus.FUNDING) {
      throw new BadRequestException('Proyek tidak tersedia untuk pendanaan');
    }

    const minNatura = (project.targetAmount * 5n) / 100n;
    const threshold = minNatura > 50000n ? minNatura : 50000n;
    if (!skipReward && amount < threshold) {
      throw new BadRequestException(`Minimal investasi untuk Natura adalah Rp${threshold}`);
    }

    const principal = skipReward ? amount : (amount * 100n) / 115n;
    const newCollected = project.collectedAmount + principal;
    if (newCollected > project.targetAmount) {
      throw new BadRequestException('Nominal investasi melebihi sisa dana yang dibutuhkan proyek');
    }

    const investment = await this.prisma.investment.create({
      data: {
        projectId,
        investorId,
        amount,
        rewardOptIn: !skipReward,
        status: 'PENDING'
      }
    });

    try {
      const invoice = await this.xenditClient.Invoice.createInvoice({
        data: {
          externalId: `inv-${investment.id}`,
          amount: dto.amount,
          description: `Pendanaan Langsung Proyek: ${project.title}`,
          invoiceDuration: 86400,
          successRedirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/projects/${projectId}`,
          failureRedirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/projects/${projectId}`,
        }
      });
      return { invoiceUrl: invoice.invoiceUrl };
    } catch (error) {
      await this.prisma.investment.delete({ where: { id: investment.id } });
      console.error('Xendit Invoice Error:', error);
      throw new BadRequestException('Gagal membuat tagihan pembayaran.');
    }
  }

  async handleDirectWebhook(payload: any) {
    const { external_id, status } = payload;
    
    if (!external_id) {
      return { success: true, message: 'Ignored (Missing external_id)' };
    }
    
    if (status !== 'PAID' && status !== 'EXPIRED') {
      return { success: true, message: `Ignored status: ${status}` };
    }

    if (!external_id.startsWith('inv-')) {
       return { success: true, message: 'Not an investment invoice' };
    }

    const investmentId = external_id.replace('inv-', '');
    const investment = await this.prisma.investment.findUnique({ where: { id: investmentId } });
    if (!investment || investment.status !== 'PENDING') {
      return { success: true, message: 'Already processed or not found' };
    }

    if (status === 'EXPIRED') {
      await this.prisma.investment.update({
        where: { id: investmentId },
        data: { status: 'FAILED' }
      });
      return { success: true, message: 'Investment marked as EXPIRED/FAILED' };
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.investment.update({
        where: { id: investmentId },
        data: { status: 'SUCCESS' }
      });

      const amount = investment.amount;
      const skipReward = !investment.rewardOptIn;
      const principal = skipReward ? amount : (amount * 100n) / 115n;
      const markup = skipReward ? 0n : amount - principal;

      const project = await tx.project.findUnique({ where: { id: investment.projectId } });
      if(!project) throw new Error("Proyek tidak ditemukan");

      const totalRequired = project.targetAmount;
      const oldCollected = project.collectedAmount;
      const newCollected = oldCollected + principal;
      const softCap = (totalRequired * 75n) / 100n;

      let newStatus = project.status;
      if (newStatus === ProjectStatus.PENDING) newStatus = ProjectStatus.FUNDING;
      if (newCollected >= project.targetAmount) newStatus = ProjectStatus.FUNDED;

      await tx.project.update({
        where: { id: project.id },
        data: { collectedAmount: newCollected, status: newStatus }
      });

      const admin = await tx.user.findFirst({ where: { role: Role.ADMIN } });
      if (!admin) throw new Error('Kesalahan Sistem: Akun Admin tidak ditemukan');

      if (newCollected < softCap) {
        await tx.wallet.upsert({
          where: { userId: admin.id },
          update: { hold: { increment: principal + markup } },
          create: { userId: admin.id, hold: principal + markup }
        });
      } else {
        if (oldCollected < softCap && oldCollected > 0n) {
          await tx.wallet.update({
            where: { userId: admin.id },
            data: { hold: { decrement: oldCollected } }
          });
          await tx.wallet.upsert({
            where: { userId: project.userId },
            update: { balance: { increment: oldCollected } },
            create: { userId: project.userId, balance: oldCollected }
          });
        }
        
        await tx.wallet.upsert({
          where: { userId: project.userId },
          update: { balance: { increment: principal } },
          create: { userId: project.userId, balance: principal }
        });
        
        if (markup > 0n) {
          await tx.wallet.upsert({
            where: { userId: admin.id },
            update: { hold: { increment: markup } },
            create: { userId: admin.id, hold: markup }
          });
        }
      }

      await tx.transaction.create({
        data: {
          userId: investment.investorId,
          type: TransactionType.FUND,
          amount,
          referenceId: project.id
        }
      });
    });

    return { success: true };
  }

  async confirmReceipt(investorId: string, investmentId: string) {
    return this.prisma.$transaction(async (tx) => {
      const investment = await tx.investment.findUnique({
        where: { id: investmentId },
        include: { project: true }
      });
      if (!investment) throw new NotFoundException('Investasi tidak ditemukan');
      if (investment.investorId !== investorId) throw new BadRequestException('Bukan investasi Anda');
      if (investment.status !== 'SUCCESS') throw new BadRequestException('Hanya investasi dengan status SUCCESS yang dapat dikonfirmasi');

      const project = investment.project;
      if (project.status !== ProjectStatus.FUNDED && project.status !== ProjectStatus.SUCCESS) {
        throw new BadRequestException('Proyek belum pada tahap pengiriman barang');
      }
      if (!investment.rewardOptIn) {
        throw new BadRequestException('Investasi ini tidak meminta Natura');
      }

      const amount = investment.amount;
      const principal = (amount * 100n) / 115n;
      const markup = amount - principal;

      await tx.investment.update({
        where: { id: investmentId },
        data: { status: 'RECEIVED' }
      });

      if (markup > 0n) {
        const admin = await tx.user.findFirst({ where: { role: Role.ADMIN } });
        if (!admin) throw new BadRequestException('Kesalahan Sistem: Akun Admin tidak ditemukan');

        await tx.wallet.update({
          where: { userId: admin.id },
          data: { hold: { decrement: markup } }
        });
        await tx.wallet.update({
          where: { userId: project.userId },
          data: { balance: { increment: markup } }
        });

        await tx.transaction.create({
          data: {
            userId: project.userId,
            type: TransactionType.RELEASE,
            amount: markup,
            referenceId: project.id
          }
        });
      }

      const allProjectInvestments = await tx.investment.findMany({
        where: { projectId: project.id }
      });

      const allCompleted = allProjectInvestments.every(inv => 
        inv.status === 'RECEIVED' || inv.status === 'REFUNDED' || (!inv.rewardOptIn && inv.status === 'SUCCESS')
      );

      if (allCompleted && project.status !== ProjectStatus.SUCCESS) {
        await tx.project.update({
          where: { id: project.id },
          data: { status: ProjectStatus.SUCCESS }
        });
      }

      return { success: true, message: 'Barang berhasil dikonfirmasi' };
    });
  }

  async updateResi(umkmId: string, investmentId: string, dto: { trackingResi: string }) {
    const investment = await this.prisma.investment.findUnique({
      where: { id: investmentId },
      include: { project: true }
    });

    if (!investment) {
      throw new NotFoundException('Investasi tidak ditemukan');
    }

    if (investment.project.userId !== umkmId) {
      throw new BadRequestException('Anda tidak berhak memperbarui resi investasi ini');
    }

    if (investment.project.status !== ProjectStatus.FUNDED) {
      throw new BadRequestException('Proyek belum pada tahap pengiriman barang');
    }

    if (!investment.rewardOptIn) {
      throw new BadRequestException('Investor ini tidak meminta Natura');
    }

    return this.prisma.investment.update({
      where: { id: investmentId },
      data: { trackingResi: dto.trackingResi }
    });
  }
}
