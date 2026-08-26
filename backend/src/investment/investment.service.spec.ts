import { Test, TestingModule } from '@nestjs/testing';
import { InvestmentService } from './investment.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectStatus, Role } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('InvestmentService', () => {
  let service: InvestmentService;
  let prisma: PrismaService;

  const mockPrismaService: any = {
    project: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    wallet: {
      findUnique: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
    },
    investment: {
      create: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
    },
    $transaction: jest.fn(async (cb: any) => {
      return cb(mockPrismaService);
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvestmentService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<InvestmentService>(InvestmentService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fund() - Inti Logika Pendanaan & Escrow', () => {
    const investorId = 'investor-1';
    const projectId = 'project-1';
    const adminId = 'admin-1';
    const umkmId = 'umkm-1';

    it('harus menolak investasi jika proyek tidak ditemukan', async () => {
      mockPrismaService.project.findUnique.mockResolvedValueOnce(null);

      await expect(service.fund(investorId, projectId, { amount: 1000000 }))
        .rejects
        .toThrow(NotFoundException);
    });

    it('harus menolak investasi jika proyek sudah selesai (bukan PENDING/FUNDING)', async () => {
      mockPrismaService.project.findUnique.mockResolvedValueOnce({
        id: projectId,
        status: ProjectStatus.FUNDED,
        targetAmount: 10000000n,
      });

      await expect(service.fund(investorId, projectId, { amount: 1000000 }))
        .rejects
        .toThrow(BadRequestException);
    });

    it('harus menolak jika saldo wallet investor tidak cukup', async () => {
      mockPrismaService.project.findUnique.mockResolvedValueOnce({
        id: projectId,
        status: ProjectStatus.FUNDING,
        targetAmount: 10000000n,
        collectedAmount: 0n,
      });
      mockPrismaService.wallet.findUnique.mockResolvedValueOnce({
        userId: investorId,
        balance: 50000n, // Saldo hanya 50 ribu
      });

      // Investasi 1 juta
      await expect(service.fund(investorId, projectId, { amount: 1000000 }))
        .rejects
        .toThrow(BadRequestException);
    });

    it('harus menahan (hold) seluruh uang ke admin jika dana masih di bawah Soft-Cap (75%)', async () => {
      const amount = 1150000n; // Rp1.150.000
      const targetAmount = 10000000n; // Target Rp10.000.000

      mockPrismaService.project.findUnique.mockResolvedValueOnce({
        id: projectId,
        userId: umkmId,
        status: ProjectStatus.FUNDING,
        targetAmount,
        collectedAmount: 0n,
      });

      mockPrismaService.wallet.findUnique.mockResolvedValueOnce({
        userId: investorId,
        balance: 50000000n, // Saldo cukup
      });

      mockPrismaService.user.findFirst.mockResolvedValueOnce({
        id: adminId,
        role: Role.ADMIN,
      });

      mockPrismaService.investment.create.mockResolvedValueOnce({ id: 'inv-1' });

      await service.fund(investorId, projectId, { amount: Number(amount) });

      // Validasi: Uang harus dipotong dari investor
      expect(mockPrismaService.wallet.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: investorId },
          data: { balance: { decrement: amount } },
        }),
      );

      // Validasi: Uang 100% masuk ke Hold Admin karena belum mencapai 75%
      expect(mockPrismaService.wallet.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: adminId },
          update: { hold: { increment: amount } }, // Principal + Markup ditahan
        }),
      );

      // Status proyek harus menjadi FUNDING
      expect(mockPrismaService.project.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: projectId },
          data: expect.objectContaining({
            status: ProjectStatus.FUNDING,
          }),
        }),
      );
    });

    it('harus mencairkan dana pokok ke Petani jika melampaui Soft-Cap (75%)', async () => {
      // Proyek butuh 10 juta. Saat ini sudah 7 juta.
      // Investor masuk membawa 1.150.000 (Pokok = 1.000.000, Markup = 150.000)
      // Total akan jadi 8.000.000 (> 7.500.000 Soft-Cap).

      const amount = 1150000n;
      const targetAmount = 10000000n;
      const oldCollected = 7000000n;

      mockPrismaService.project.findUnique.mockResolvedValueOnce({
        id: projectId,
        userId: umkmId,
        status: ProjectStatus.FUNDING,
        targetAmount,
        collectedAmount: oldCollected,
      });

      mockPrismaService.wallet.findUnique.mockResolvedValueOnce({
        userId: investorId,
        balance: 50000000n,
      });

      mockPrismaService.user.findFirst.mockResolvedValueOnce({
        id: adminId,
        role: Role.ADMIN,
      });

      mockPrismaService.investment.create.mockResolvedValueOnce({ id: 'inv-2' });

      await service.fund(investorId, projectId, { amount: Number(amount) });

      // Validasi: Admin melepaskan `hold` dari dana lama (7 juta)
      expect(mockPrismaService.wallet.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: adminId },
          data: { hold: { decrement: oldCollected } },
        }),
      );

      // Validasi: Dana lama (7 juta) masuk ke balance Petani
      expect(mockPrismaService.wallet.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: umkmId },
          update: { balance: { increment: oldCollected } },
        }),
      );

      // Validasi: Dana baru (pokok 1 juta) langsung masuk ke Petani
      expect(mockPrismaService.wallet.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: umkmId },
          update: { balance: { increment: 1000000n } },
        }),
      );

      // Validasi: Mark-up (150rb) tetap di-hold oleh Admin
      expect(mockPrismaService.wallet.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: adminId },
          update: { hold: { increment: 150000n } },
        }),
      );
    });
  });
});
