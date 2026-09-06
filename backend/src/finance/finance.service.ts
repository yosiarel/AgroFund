import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContributeDto, WebhookDto } from './dto/finance.dto';
import { ProjectStatus, GuaranteeStatus } from '@prisma/client';

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  async generateGuaranteePayment(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project tidak ditemukan');
    if (project.userId !== userId) throw new ForbiddenException('Akses ditolak');
    if (project.status !== ProjectStatus.GUARANTEE_PLACEMENT) {
      throw new BadRequestException('Project tidak berada pada tahap penempatan jaminan');
    }
    if (project.guaranteeStatus === GuaranteeStatus.HELD) {
      throw new BadRequestException('Uang jaminan sudah disetorkan');
    }

    // In a real application, we would call Xendit API to generate VA here.
    // We will simulate it by returning a mock URL and reference ID.
    const mockReferenceId = `GUARANTEE_${projectId}_${Date.now()}`;
    const mockPaymentUrl = `https://mock-payment-gateway.com/pay/${mockReferenceId}`;

    return {
      message: 'Silakan lakukan pembayaran jaminan',
      guaranteeAmount: project.guaranteeAmount.toString(),
      paymentUrl: mockPaymentUrl,
      referenceId: mockReferenceId, // The user will copy this to test the webhook
    };
  }

  async contribute(projectId: string, userId: string, dto: ContributeDto) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project tidak ditemukan');
    if (project.status !== ProjectStatus.FUNDRAISING) {
      throw new BadRequestException('Project ini tidak sedang menggalang dana');
    }

    const processingFee = 0; // Flat fee or percentage can go here
    const totalPayment = BigInt(dto.amount) + BigInt(processingFee);

    const contribution = await this.prisma.contribution.create({
      data: {
        projectId,
        investorId: userId,
        amount: BigInt(dto.amount),
        processingFee: BigInt(processingFee),
        totalPayment,
        naturaPackageId: dto.naturaPackageId,
        status: 'PENDING_PAYMENT',
      }
    });

    const mockPaymentUrl = `https://mock-payment-gateway.com/pay/${contribution.id}`;

    return {
      message: 'Silakan selesaikan pembayaran investasi Anda',
      contributionId: contribution.id,
      amount: totalPayment.toString(),
      paymentUrl: mockPaymentUrl,
    };
  }

  async handleWebhook(dto: WebhookDto) {
    if (dto.status !== 'PAID') {
      return { message: 'Ignored non-PAID status' };
    }

    if (dto.type === 'GUARANTEE') {
      // dto.referenceId is like GUARANTEE_<projectId>_<timestamp> (or old dashed format)
      // To support both (just in case), we can extract using Regex or split by '_' if it contains '_'
      let projectId = '';
      if (dto.referenceId.includes('_')) {
        projectId = dto.referenceId.split('_')[1];
      } else {
        // Fallback for old format GUARANTEE-049ab16f-ac33-40e7-9624-0fdde01e5499-timestamp
        const parts = dto.referenceId.split('-');
        projectId = parts.slice(1, parts.length - 1).join('-');
      }

      if (!projectId) throw new BadRequestException('Invalid referenceId for Guarantee');

      const project = await this.prisma.project.findUnique({ where: { id: projectId } });
      if (!project) throw new NotFoundException('Project tidak ditemukan');

      // Update project guarantee status and create transaction
      await this.prisma.$transaction(async (tx) => {
        await tx.project.update({
          where: { id: projectId },
          data: {
            guaranteeStatus: GuaranteeStatus.HELD,
            status: ProjectStatus.FUNDRAISING, // Auto-publish
            publishedAt: new Date(),
            fundraisingDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // +60 days
          }
        });

        await tx.guaranteeTransaction.create({
          data: {
            projectId,
            amount: project.guaranteeAmount,
            status: 'HELD',
            reason: 'Setoran Awal UMKM',
            referenceId: dto.referenceId
          }
        });
      });

      return { message: 'Guarantee Payment Processed' };
    } 
    else if (dto.type === 'CONTRIBUTION') {
      const contributionId = dto.referenceId;
      const contribution = await this.prisma.contribution.findUnique({ 
        where: { id: contributionId },
        include: { project: true }
      });

      if (!contribution) throw new NotFoundException('Contribution tidak ditemukan');
      if (contribution.status === 'PAID') return { message: 'Already paid' };

      await this.prisma.$transaction(async (tx) => {
        // Mark contribution as PAID
        await tx.contribution.update({
          where: { id: contributionId },
          data: { status: 'PAID' }
        });

        // Record to FinancialTransaction (Ledger Entry)
        await tx.financialTransaction.create({
          data: {
            projectId: contribution.projectId,
            type: 'CONTRIBUTION',
            direction: 'IN',
            amount: contribution.amount,
            source: `INVESTOR_${contribution.investorId}`,
            destination: 'PROJECT_LEDGER',
            referenceType: 'CONTRIBUTION',
            referenceId: contribution.id,
            status: 'SUCCESS'
          }
        });

        // Update Project Financial Ledger
        const ledger = await tx.projectFinancialLedger.findFirst({
          where: { projectId: contribution.projectId }
        });

        if (ledger) {
          await tx.projectFinancialLedger.update({
            where: { id: ledger.id },
            data: { remainingBalance: { increment: contribution.amount } }
          });
        } else {
          await tx.projectFinancialLedger.create({
            data: {
              projectId: contribution.projectId,
              remainingBalance: contribution.amount
            }
          });
        }

        // Check if target is met
        const newLedger = await tx.projectFinancialLedger.findFirst({
          where: { projectId: contribution.projectId }
        });

        if (newLedger && newLedger.remainingBalance >= contribution.project.targetAmount) {
          await tx.project.update({
            where: { id: contribution.projectId },
            data: { status: ProjectStatus.DANA_TERPENUHI }
          });
        }
      });

      return { message: 'Contribution Payment Processed' };
    }
  }
}
