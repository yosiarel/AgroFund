import { Test, TestingModule } from '@nestjs/testing';
import { KoperasiService } from './koperasi.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('KoperasiService', () => {
  let service: KoperasiService;
  let prisma: PrismaService;

  const mockPrismaService: any = {
    item: {
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn().mockResolvedValue(1), // mock onModuleInit check
    },
    wallet: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    order: {
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
        KoperasiService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<KoperasiService>(KoperasiService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('buyItem()', () => {
    const userId = 'user-1';
    const itemId = 'item-1';

    it('harus menolak jika barang tidak ditemukan', async () => {
      mockPrismaService.item.findUnique.mockResolvedValueOnce(null);

      await expect(service.buyItem(userId, itemId, { quantity: 1 }))
        .rejects.toThrow(NotFoundException);
    });

    it('harus menolak jika stok barang tidak cukup', async () => {
      mockPrismaService.item.findUnique.mockResolvedValueOnce({
        id: itemId,
        stock: 5,
        price: 1000n,
      });

      await expect(service.buyItem(userId, itemId, { quantity: 10 }))
        .rejects.toThrow(BadRequestException);
    });

    it('harus menolak jika saldo wallet tidak cukup', async () => {
      mockPrismaService.item.findUnique.mockResolvedValueOnce({
        id: itemId,
        stock: 50,
        price: 10000n,
      });
      mockPrismaService.wallet.findUnique.mockResolvedValueOnce({
        userId,
        balance: 1000n, // Saldo hanya 1.000, butuh 10.000 * 2 = 20.000
      });

      await expect(service.buyItem(userId, itemId, { quantity: 2 }))
        .rejects.toThrow(BadRequestException);
    });

    it('harus berhasil membeli barang, mengurangi saldo & stok, dan membuat transaksi', async () => {
      mockPrismaService.item.findUnique.mockResolvedValueOnce({
        id: itemId,
        stock: 50,
        price: 10000n,
      });
      mockPrismaService.wallet.findUnique.mockResolvedValueOnce({
        userId,
        balance: 50000n,
      });
      mockPrismaService.order.create.mockResolvedValueOnce({ id: 'order-1' });

      await service.buyItem(userId, itemId, { quantity: 2 });

      expect(mockPrismaService.wallet.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId },
          data: { balance: { decrement: 20000n } },
        }),
      );

      expect(mockPrismaService.item.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: itemId },
          data: { stock: { decrement: 2 } },
        }),
      );

      expect(mockPrismaService.order.create).toHaveBeenCalled();
      expect(mockPrismaService.transaction.create).toHaveBeenCalled();
    });
  });
});
