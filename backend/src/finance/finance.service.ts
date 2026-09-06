import { Injectable, NotFoundException, BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContributeDto, WebhookDto } from './dto/finance.dto';
import { ProjectStatus, GuaranteeStatus } from '@prisma/client';
import { Xendit } from 'xendit-node';

@Injectable()
export class FinanceService {
  private xenditClient: any;

  constructor(private readonly prisma: PrismaService) {
    const xenditSecret = process.env.XENDIT_SECRET_KEY;
    if (xenditSecret) {
      this.xenditClient = new Xendit({ secretKey: xenditSecret });
    } else {
      console.warn('XENDIT_SECRET_KEY is not set in .env');
    }
  }

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

    const externalId = `GUARANTEE_${projectId}_${Date.now()}`;

    // Create Real Xendit Invoice
    if (!this.xenditClient) {
      throw new BadRequestException('Xendit Client belum dikonfigurasi (XENDIT_SECRET_KEY tidak ada)');
    }

    const invoice = await this.xenditClient.Invoice.createInvoice({
      data: {
        externalId: externalId,
        amount: Number(project.guaranteeAmount),
        description: `Pembayaran Jaminan Proyek: ${project.title}`
      }
    });

    const paymentUrl = invoice.invoiceUrl;

    return {
      message: 'Silakan lakukan pembayaran jaminan',
      guaranteeAmount: project.guaranteeAmount.toString(),
      paymentUrl: paymentUrl,
      externalId: externalId,
    };
  }

  async contribute(projectId: string, userId: string, dto: ContributeDto) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project tidak ditemukan');
    if (project.status !== ProjectStatus.FUNDRAISING) {
      throw new BadRequestException('Project ini tidak sedang menggalang dana');
    }

    const processingFee = 0;
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

    const externalId = contribution.id;

    // Create Real Xendit Invoice
    if (!this.xenditClient) {
      throw new BadRequestException('Xendit Client belum dikonfigurasi (XENDIT_SECRET_KEY tidak ada)');
    }

    const invoice = await this.xenditClient.Invoice.createInvoice({
      data: {
        externalId: externalId,
        amount: Number(totalPayment),
        description: `Investasi Proyek: ${project.title}`
      }
    });

    const paymentUrl = invoice.invoiceUrl;

    return {
      message: 'Silakan selesaikan pembayaran investasi Anda',
      contributionId: contribution.id,
      amount: totalPayment.toString(),
      paymentUrl: paymentUrl,
    };
  }

  async handleWebhook(callbackToken: string, dto: WebhookDto) {
    // Verify Webhook Token
    const expectedToken = process.env.XENDIT_WEBHOOK_TOKEN;
    if (expectedToken && callbackToken !== expectedToken) {
      throw new UnauthorizedException('Invalid callback token');
    }

    if (dto.status !== 'PAID') {
      return { message: 'Ignored non-PAID status' };
    }

    const externalId = dto.external_id;

    if (externalId.startsWith('GUARANTEE_')) {
      const projectId = externalId.split('_')[1];
      if (!projectId) throw new BadRequestException('Invalid external_id for Guarantee');

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
            referenceId: externalId
          }
        });
      });

      return { message: 'Guarantee Payment Processed' };
    }
    else {
      // Treat as Contribution UUID
      const contributionId = externalId;
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
        let ledger = await tx.projectFinancialLedger.findFirst({
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
