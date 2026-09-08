import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectStatus, AssessmentStatus, Role } from '@prisma/client';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

const mockPrismaService: Record<string, any> = {
  project: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
  assessment: {
    create: jest.fn(),
  },
  milestone: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
  progressReport: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
  incident: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  evidence: {
    create: jest.fn(),
    updateMany: jest.fn(),
  },
  $transaction: jest.fn(async (cb: (tx: Record<string, any>) => Promise<any>) =>
    cb(mockPrismaService),
  ),
};

describe('ProjectService', () => {
  let service: ProjectService;
  let prisma: any;

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

  describe('createDraft', () => {
    it('should calculate financials correctly when creating draft', async () => {
      const userId = 'user-1';
      const dto = {
        title: 'Kebun',
        description: 'Test',
        koperasiId: 'kop-1',
        basicProcurementCapital: 10000000,
        priceReserve: 1000000,
        naturaCost: 500000,
      };

      prisma.project.findFirst.mockResolvedValue(null);
      prisma.project.create.mockImplementation(({ data }: any) =>
        Promise.resolve({ id: 'proj-1', ...data }),
      );

      const result = await service.createDraft(userId, dto);

      const expectedCooperativeFee = Math.round(0.025 * (10000000 + 1000000)); // 275,000
      const expectedAgrofundFee = Math.round(0.025 * 10000000); // 250,000
      const expectedTargetAmount =
        10000000 +
        1000000 +
        expectedCooperativeFee +
        expectedAgrofundFee +
        500000;
      const expectedGuaranteeAmount = Math.round(0.05 * 10000000); // 500,000

      expect(result.cooperativeFeeProvision).toBe(expectedCooperativeFee);
      expect(result.agrofundServiceFee).toBe(expectedAgrofundFee);
      expect(result.targetAmount).toBe(expectedTargetAmount);
      expect(result.guaranteeAmount).toBe(expectedGuaranteeAmount);
      expect(result.status).toBe(ProjectStatus.DRAFT);
    });

    it('should throw error if UMKM already has an active project', async () => {
      prisma.project.findFirst.mockResolvedValue({
        id: 'proj-1',
        status: ProjectStatus.FUNDRAISING,
      });

      await expect(
        service.createDraft('user-1', {
          title: 'Kebun',
          description: 'Test',
          koperasiId: 'kop-1',
          basicProcurementCapital: 10000,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('requestAssessment', () => {
    it('should transition to COOPERATIVE_ASSESSMENT', async () => {
      const project = {
        id: 'proj-1',
        userId: 'user-1',
        status: ProjectStatus.DRAFT,
      };
      prisma.project.findUnique.mockResolvedValue(project);
      prisma.project.update.mockResolvedValue({
        ...project,
        status: ProjectStatus.COOPERATIVE_ASSESSMENT,
      });

      const result = await service.requestAssessment('proj-1', 'user-1');
      expect(result.status).toBe(ProjectStatus.COOPERATIVE_ASSESSMENT);
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      const project = {
        id: 'proj-1',
        userId: 'user-1',
        status: ProjectStatus.DRAFT,
      };
      prisma.project.findUnique.mockResolvedValue(project);

      await expect(
        service.requestAssessment('proj-1', 'intruder'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if project is not in DRAFT or COOPERATIVE_ASSESSMENT status', async () => {
      const project = {
        id: 'proj-1',
        userId: 'user-1',
        status: ProjectStatus.FUNDRAISING,
      };
      prisma.project.findUnique.mockResolvedValue(project);

      await expect(
        service.requestAssessment('proj-1', 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('assessProject (Koperasi)', () => {
    it('should advance status to PUBLICATION_REVIEW if APPROVED', async () => {
      const project = {
        id: 'proj-1',
        koperasiId: 'kop-1',
        status: ProjectStatus.COOPERATIVE_ASSESSMENT,
      };
      prisma.project.findUnique.mockResolvedValue(project);
      prisma.assessment.create.mockResolvedValue({});

      await service.assessProject('proj-1', 'kop-1', {
        status: AssessmentStatus.APPROVED,
        notes: 'OK',
      });
      expect(prisma.project.update).toHaveBeenCalledWith({
        where: { id: 'proj-1' },
        data: { status: ProjectStatus.PUBLICATION_REVIEW },
      });
    });

    it('should NOT advance status if NEEDS_CORRECTION', async () => {
      const project = {
        id: 'proj-1',
        koperasiId: 'kop-1',
        status: ProjectStatus.COOPERATIVE_ASSESSMENT,
      };
      prisma.project.findUnique.mockResolvedValue(project);
      prisma.assessment.create.mockResolvedValue({});

      await service.assessProject('proj-1', 'kop-1', {
        status: AssessmentStatus.NEEDS_CORRECTION,
        notes: 'Fix',
      });
      expect(prisma.project.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if wrong koperasi attempts to assess', async () => {
      const project = {
        id: 'proj-1',
        koperasiId: 'kop-1',
        status: ProjectStatus.COOPERATIVE_ASSESSMENT,
      };
      prisma.project.findUnique.mockResolvedValue(project);

      await expect(
        service.assessProject('proj-1', 'kop-intruder', {
          status: AssessmentStatus.APPROVED,
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('reviewProject (AgroFund)', () => {
    it('should throw BadRequestException if project is not in PUBLICATION_REVIEW', async () => {
      const project = { id: 'proj-1', status: ProjectStatus.DRAFT };
      prisma.project.findUnique.mockResolvedValue(project);

      await expect(
        service.reviewProject('proj-1', 'admin-1', {
          status: AssessmentStatus.APPROVED,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('reportProgress (PB-090 & PB-148)', () => {
    it('should throw BadRequestException if progressPercentage is out of bounds (> 100)', async () => {
      const project = { id: 'proj-1', userId: 'user-1' };
      const milestone = { id: 'm-1', projectId: 'proj-1' };
      prisma.project.findUnique.mockResolvedValue(project);
      prisma.milestone.findUnique.mockResolvedValue(milestone);

      await expect(
        service.reportProgress('proj-1', 'm-1', 'user-1', {
          progressPercentage: 150,
          description: 'Test Invalid',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getProjectById (BUG-MT-001 Authorization & Pre-Publication Scope)', () => {
    const prePubProject = {
      id: 'c681589e-8aa0-4f54-823d-224ce6253534',
      title: 'Budidaya Rumput Laut',
      userId: 'santo-user-id',
      koperasiId: 'de7e618f-b7bc-44f2-9ee2-6b0cddc33bad', // kop_jaya
      status: ProjectStatus.COOPERATIVE_ASSESSMENT,
    };

    const fundraisingProject = {
      id: '6b951b4e-74f2-454f-8e1c-03ce4575dc18',
      title: 'Melon Hidroponik',
      userId: 'budi-user-id',
      koperasiId: 'kud-makmur-id',
      status: ProjectStatus.FUNDRAISING,
    };

    it('should throw NotFoundException if project does not exist', async () => {
      prisma.project.findUnique.mockResolvedValue(null);
      await expect(
        service.getProjectById('non-existent', { userId: 'any', role: Role.UMKM }),
      ).rejects.toThrow(NotFoundException);
    });

    // Test A
    it('Test A: should allow assigned KOPERASI (kop_jaya) to access project in COOPERATIVE_ASSESSMENT', async () => {
      prisma.project.findUnique.mockResolvedValue(prePubProject);
      const result = await service.getProjectById(prePubProject.id, {
        userId: 'de7e618f-b7bc-44f2-9ee2-6b0cddc33bad',
        role: Role.KOPERASI,
      });
      expect(result).toEqual(prePubProject);
    });

    // Test B
    it('Test B: should throw ForbiddenException when different KOPERASI (kop_makmur) accesses project in COOPERATIVE_ASSESSMENT', async () => {
      prisma.project.findUnique.mockResolvedValue(prePubProject);
      await expect(
        service.getProjectById(prePubProject.id, {
          userId: '70d99643-a8cd-4ac8-8692-2dc95157d76c', // kop_makmur
          role: Role.KOPERASI,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    // Test C
    it('Test C: should allow project owner UMKM (Santo) to access own project in COOPERATIVE_ASSESSMENT', async () => {
      prisma.project.findUnique.mockResolvedValue(prePubProject);
      const result = await service.getProjectById(prePubProject.id, {
        userId: 'santo-user-id',
        role: Role.UMKM,
      });
      expect(result).toEqual(prePubProject);
    });

    // Test D
    it('Test D: should throw ForbiddenException when different UMKM (Budi) accesses project in COOPERATIVE_ASSESSMENT', async () => {
      prisma.project.findUnique.mockResolvedValue(prePubProject);
      await expect(
        service.getProjectById(prePubProject.id, {
          userId: 'budi-user-id',
          role: Role.UMKM,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    // Test E
    it('Test E: should allow AGROFUND admin to access project in COOPERATIVE_ASSESSMENT', async () => {
      prisma.project.findUnique.mockResolvedValue(prePubProject);
      const result = await service.getProjectById(prePubProject.id, {
        userId: 'admin-id',
        role: Role.AGROFUND,
      });
      expect(result).toEqual(prePubProject);
    });

    // Test F
    it('Test F: should throw ForbiddenException when anonymous user accesses pre-publication project', async () => {
      prisma.project.findUnique.mockResolvedValue(prePubProject);
      await expect(
        service.getProjectById(prePubProject.id, undefined),
      ).rejects.toThrow(ForbiddenException);
    });

    // Test G
    it('Test G: should allow anonymous user to access project in FUNDRAISING (Melon Hidroponik)', async () => {
      prisma.project.findUnique.mockResolvedValue(fundraisingProject);
      const result = await service.getProjectById(fundraisingProject.id, undefined);
      expect(result).toEqual(fundraisingProject);
    });
  });
});
