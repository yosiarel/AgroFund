import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectStatus, AssessmentStatus } from '@prisma/client';
import {
  BadRequestException,
  ForbiddenException,
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
});
