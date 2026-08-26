import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TopUpDto } from './dto/topup.dto';
import { InvestmentService } from '../investment/investment.service';
import { TransactionType } from '@prisma/client';
import { Xendit } from 'xendit-node';

@Injectable()
export class WalletService {
  private xenditClient: Xendit;

  constructor(
    private prisma: PrismaService,
    private investmentService: InvestmentService,
  ) {
    this.xenditClient = new Xendit({ secretKey: process.env.XENDIT_SECRET_KEY || 'dummy_key' });
  }

  async getTransactions(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async topup(userId: string, dto: TopUpDto) {
    const amount = BigInt(dto.amount);

    const topUp = await this.prisma.topUp.create({
      data: {
        userId,
        amount,
        invoiceUrl: '',
        status: 'PENDING'
      }
    });

    try {
      const invoice = await this.xenditClient.Invoice.createInvoice({
        data: {
          externalId: topUp.id,
          amount: dto.amount,
          description: 'Top-Up Saldo Dompet AkarMakmur',
          invoiceDuration: 86400,
          successRedirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`,
          failureRedirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`,
        }
      });

      await this.prisma.topUp.update({
        where: { id: topUp.id },
        data: { invoiceUrl: invoice.invoiceUrl }
      });

      return { invoiceUrl: invoice.invoiceUrl };
    } catch (error) {
      console.error('Xendit Invoice Error:', error);
      throw new BadRequestException('Gagal membuat tagihan pembayaran. Pastikan API Key valid.');
    }
  }

  async handleXenditWebhook(payload: any) {
    const { external_id, status, amount } = payload;

    if (!external_id) {
      return { success: true, message: 'Ignored (Missing external_id)' };
    }

    if (external_id.startsWith('inv-')) {
      return this.investmentService.handleDirectWebhook(payload);
    }

    if (status !== 'PAID' && status !== 'EXPIRED') {
      return { success: true, message: `Ignored status: ${status}` };
    }

    const topUp = await this.prisma.topUp.findUnique({
      where: { id: external_id }
    });

    if (!topUp) {
      return { success: true, message: 'TopUp record not found (Might be from another system)' };
    }

    if (topUp.status === 'PAID' || topUp.status === 'FAILED') {
      return { success: true, message: `Already processed (${topUp.status})` };
    }

    if (status === 'EXPIRED') {
      await this.prisma.topUp.update({
        where: { id: external_id },
        data: { status: 'FAILED' }
      });
      return { success: true, message: 'TopUp marked as EXPIRED/FAILED' };
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.topUp.update({
        where: { id: external_id },
        data: { status: 'PAID' }
      });

      await tx.wallet.upsert({
        where: { userId: topUp.userId },
        update: { balance: { increment: topUp.amount } },
        create: { userId: topUp.userId, balance: topUp.amount },
      });

      await tx.transaction.create({
        data: {
          userId: topUp.userId,
          type: TransactionType.TOPUP,
          amount: topUp.amount,
          referenceId: external_id
        },
      });
    });

    return { success: true };
  }
}
