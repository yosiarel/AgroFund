import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { ProjectStatus } from '@prisma/client';

describe('ProjectService', () => {
  let service: ProjectService;
  let prisma: PrismaService;

  const mockPrismaService = {
    project: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create()', () => {
    const userId = 'user-1';

    it('harus menolak pembuatan proyek dengan kata terlarang (Banned Words)', async () => {
      await expect(service.create(userId, {
        title: 'Proyek Judi Online',
        description: 'Ini adalah proyek yang sangat bagus sekali.',
        targetAmount: 1000000,
        imageUrl: '',
      })).rejects.toThrow(BadRequestException);
    });

    it('harus menolak pembuatan proyek jika judul terlalu pendek', async () => {
      await expect(service.create(userId, {
        title: 'Pendek',
        description: 'Ini adalah proyek yang sangat bagus sekali.',
        targetAmount: 1000000,
        imageUrl: '',
      })).rejects.toThrow(BadRequestException);
    });

    it('harus menolak pembuatan proyek jika deskripsi terlalu pendek', async () => {
      await expect(service.create(userId, {
        title: 'Proyek Pertanian Kopi',
        description: 'Pendek',
        targetAmount: 1000000,
        imageUrl: '',
      })).rejects.toThrow(BadRequestException);
    });

    it('harus membuat proyek dan menghitung 15% mark-up dengan benar', async () => {
      mockPrismaService.project.create.mockResolvedValueOnce({ id: 'proj-1' });

      // Target Rp 1.000.000 -> Mark-up Rp 150.000
      await service.create(userId, {
        title: 'Proyek Pertanian Kopi Arabika',
        description: 'Ini adalah deskripsi yang cukup panjang lebih dari 30 karakter.',
        targetAmount: 1000000,
        imageUrl: 'http://image.jpg',
      });

      expect(mockPrismaService.project.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Proyek Pertanian Kopi Arabika',
            targetAmount: 1000000n,
            markupAmount: 150000n,
            status: ProjectStatus.FUNDING,
            userId,
          }),
        }),
      );
    });
  });
});
