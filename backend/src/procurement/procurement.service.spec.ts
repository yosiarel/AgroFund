import { Test, TestingModule } from '@nestjs/testing';
import { ProcurementService } from './procurement.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

const mockPrismaService: Record<string, any> = {
  project: {
    findUnique: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  procurementRequest: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

describe('ProcurementService', () => {
  let service: ProcurementService;
  let prisma: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcurementService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ProcurementService>(ProcurementService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRequestsByProject (Cooperative & Owner Scope Verification)', () => {
    const project = {
      id: 'proj-1',
      title: 'Budidaya Rumput Laut',
      userId: 'santo-id',
      koperasiId: 'kop-jaya-id',
    };

    it('should throw NotFoundException if project not found', async () => {
      prisma.project.findUnique.mockResolvedValue(null);
      await expect(
        service.getRequestsByProject('unknown', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user not found', async () => {
      prisma.project.findUnique.mockResolvedValue(project);
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.getRequestsByProject(project.id, 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    // Test H
    it('Test H: should throw ForbiddenException when different KOPERASI accesses procurement requests of another cooperative project', async () => {
      prisma.project.findUnique.mockResolvedValue(project);
      prisma.user.findUnique.mockResolvedValue({
        id: 'kop-makmur-id',
        role: Role.KOPERASI,
      });

      await expect(
        service.getRequestsByProject(project.id, 'kop-makmur-id'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow assigned KOPERASI (kop_jaya) to access procurement requests', async () => {
      const mockRequests = [{ id: 'req-1', projectId: project.id }];
      prisma.project.findUnique.mockResolvedValue(project);
      prisma.user.findUnique.mockResolvedValue({
        id: 'kop-jaya-id',
        role: Role.KOPERASI,
      });
      prisma.procurementRequest.findMany.mockResolvedValue(mockRequests);

      const result = await service.getRequestsByProject(project.id, 'kop-jaya-id');
      expect(result).toEqual(mockRequests);
    });

    it('should allow project owner UMKM (Santo) to access procurement requests', async () => {
      const mockRequests = [{ id: 'req-1', projectId: project.id }];
      prisma.project.findUnique.mockResolvedValue(project);
      prisma.user.findUnique.mockResolvedValue({
        id: 'santo-id',
        role: Role.UMKM,
      });
      prisma.procurementRequest.findMany.mockResolvedValue(mockRequests);

      const result = await service.getRequestsByProject(project.id, 'santo-id');
      expect(result).toEqual(mockRequests);
    });

    it('should throw ForbiddenException when different UMKM accesses procurement requests', async () => {
      prisma.project.findUnique.mockResolvedValue(project);
      prisma.user.findUnique.mockResolvedValue({
        id: 'budi-id',
        role: Role.UMKM,
      });

      await expect(
        service.getRequestsByProject(project.id, 'budi-id'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow AGROFUND admin to access procurement requests', async () => {
      const mockRequests = [{ id: 'req-1', projectId: project.id }];
      prisma.project.findUnique.mockResolvedValue(project);
      prisma.user.findUnique.mockResolvedValue({
        id: 'admin-id',
        role: Role.AGROFUND,
      });
      prisma.procurementRequest.findMany.mockResolvedValue(mockRequests);

      const result = await service.getRequestsByProject(project.id, 'admin-id');
      expect(result).toEqual(mockRequests);
    });
  });
});
