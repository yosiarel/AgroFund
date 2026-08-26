import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { PrismaService } from '../prisma/prisma.service';
import { InvestmentService } from '../investment/investment.service';

describe('WalletService', () => {
  let service: WalletService;
  let prisma: PrismaService;
  let investmentService: InvestmentService;

  const mockPrismaService: any = {
    topUp: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    wallet: {
      upsert: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
    },
    $transaction: jest.fn(async (cb: any) => {
      return cb(mockPrismaService);
    }),
  };

  const mockInvestmentService = {
    handleDirectWebhook: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: InvestmentService, useValue: mockInvestmentService },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    prisma = module.get<PrismaService>(PrismaService);
    investmentService = module.get<InvestmentService>(InvestmentService);

    // Mock Xendit Client
    (service as any).xenditClient = {
      Invoice: {
        createInvoice: jest.fn().mockResolvedValue({ invoiceUrl: 'http://test-invoice.com' }),
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('topup()', () => {
    it('harus membuat record TopUp dan memanggil Xendit createInvoice', async () => {
      mockPrismaService.topUp.create.mockResolvedValueOnce({ id: 'topup-1' });

      const result = await service.topup('user-1', { amount: 50000 });

      expect(mockPrismaService.topUp.create).toHaveBeenCalled();
      expect((service as any).xenditClient.Invoice.createInvoice).toHaveBeenCalled();
      expect(mockPrismaService.topUp.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'topup-1' },
          data: { invoiceUrl: 'http://test-invoice.com' },
        }),
      );
      expect(result).toEqual({ invoiceUrl: 'http://test-invoice.com' });
    });
  });

  describe('handleXenditWebhook()', () => {
    it('harus meneruskan webhook ke InvestmentService jika external_id diawali dengan inv-', async () => {
      await service.handleXenditWebhook({ external_id: 'inv-123', status: 'PAID' });
      expect(mockInvestmentService.handleDirectWebhook).toHaveBeenCalledWith(
        expect.objectContaining({ external_id: 'inv-123' })
      );
    });

    it('harus menambahkan saldo pengguna jika status top-up menjadi PAID', async () => {
      const topUpId = 'topup-123';
      mockPrismaService.topUp.findUnique.mockResolvedValueOnce({
        id: topUpId,
        userId: 'user-1',
        amount: 50000n,
        status: 'PENDING',
      });

      const result = await service.handleXenditWebhook({ external_id: topUpId, status: 'PAID' });

      expect(result).toEqual({ success: true });
      expect(mockPrismaService.topUp.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: topUpId },
          data: { status: 'PAID' },
        }),
      );
      expect(mockPrismaService.wallet.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
          update: { balance: { increment: 50000n } },
        }),
      );
    });
  });
});
