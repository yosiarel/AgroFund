import { Test, TestingModule } from '@nestjs/testing';
import { FinanceService } from './finance.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectStatus, GuaranteeStatus } from '@prisma/client';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

jest.mock('xendit-node', () => {
  return {
    Xendit: jest.fn().mockImplementation(() => {
      return {
        Invoice: {
          createInvoice: jest.fn().mockResolvedValue({
            invoiceUrl: 'https://checkout.xendit.co/test',
          }),
        },
      };
    }),
  };
});

// Override env for testing
process.env.XENDIT_WEBHOOK_TOKEN = 'test_token';
process.env.XENDIT_SECRET_KEY = 'xnd_test_secret_key';

const mockPrismaService: any = {
  project: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  contribution: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  guaranteeTransaction: {
    create: jest.fn(),
  },
  financialTransaction: {
    create: jest.fn(),
  },
  projectFinancialLedger: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(async (cb: any) => {
    return cb(mockPrismaService);
  }),
};

describe('FinanceService', () => {
  let service: FinanceService;
  let prisma: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinanceService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<FinanceService>(FinanceService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateGuaranteePayment', () => {
    it('should generate guarantee payment url', async () => {
      const project = {
        id: 'proj-1',
        userId: 'user-1',
        status: ProjectStatus.GUARANTEE_PLACEMENT,
        guaranteeStatus: GuaranteeStatus.PENDING_PAYMENT,
        guaranteeAmount: 500000n,
      };
      prisma.project.findUnique.mockResolvedValue(project);

      const result = await service.generateGuaranteePayment('proj-1', 'user-1');
      expect(result.paymentUrl).toBeDefined();
      expect(result.externalId).toContain('GUARANTEE_proj-1_');
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      const project = {
        id: 'proj-1',
        userId: 'user-1',
        status: ProjectStatus.GUARANTEE_PLACEMENT,
      };
      prisma.project.findUnique.mockResolvedValue(project);

      await expect(
        service.generateGuaranteePayment('proj-1', 'intruder'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if guarantee already HELD', async () => {
      const project = {
        id: 'proj-1',
        userId: 'user-1',
        status: ProjectStatus.GUARANTEE_PLACEMENT,
        guaranteeStatus: GuaranteeStatus.HELD,
      };
      prisma.project.findUnique.mockResolvedValue(project);

      await expect(
        service.generateGuaranteePayment('proj-1', 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('contribute', () => {
    it('should throw BadRequestException if project is not FUNDRAISING', async () => {
      const project = {
        id: 'proj-1',
        status: ProjectStatus.GUARANTEE_PLACEMENT,
      };
      prisma.project.findUnique.mockResolvedValue(project);

      await expect(
        service.contribute('proj-1', 'user-1', { amount: 100000 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if contribution amount exceeds remaining target', async () => {
      const project = {
        id: 'proj-1',
        status: ProjectStatus.FUNDRAISING,
        targetAmount: 1000000n,
      };
      prisma.project.findUnique.mockResolvedValue(project);
      prisma.projectFinancialLedger.findFirst.mockResolvedValue({
        id: 'ledger-1',
        remainingBalance: 800000n,
      });

      await expect(
        service.contribute('proj-1', 'user-1', { amount: 300000 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('handleWebhook', () => {
    it('should throw UnauthorizedException if token mismatch', async () => {
      await expect(
        service.handleWebhook('wrong_token', {
          external_id: 'GUARANTEE_proj-1_12345',
          status: 'PAID',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should process Guarantee webhook and update project status', async () => {
      const project = { id: 'proj-1', guaranteeAmount: 500000n };
      prisma.project.findUnique.mockResolvedValue(project);

      await service.handleWebhook('test_token', {
        external_id: 'GUARANTEE_proj-1_12345',
        status: 'PAID',
      });

      expect(prisma.project.update).toHaveBeenCalledWith({
        where: { id: 'proj-1' },
        data: expect.objectContaining({
          guaranteeStatus: GuaranteeStatus.HELD,
          status: ProjectStatus.FUNDRAISING,
        }),
      });
    });

    it('should return immediately for non-PAID status', async () => {
      const result = await service.handleWebhook('test_token', {
        external_id: 'GUARANTEE_proj-1_12345',
        status: 'FAILED',
      });

      expect(result?.message).toBe('Ignored non-PAID status');
      expect(prisma.project.findUnique).not.toHaveBeenCalled();
    });

    it('should update ledger properly on CONTRIBUTION and trigger DANA_TERPENUHI if target is reached', async () => {
      const contribution = {
        id: 'contrib-1',
        projectId: 'proj-1',
        amount: 500000n,
        status: 'PENDING_PAYMENT',
        project: { targetAmount: 1000000n },
      };
      prisma.contribution.findUnique.mockResolvedValue(contribution);

      // Mock finding an existing ledger that when incremented hits target
      const existingLedger = { id: 'ledger-1', remainingBalance: 500000n };
      prisma.projectFinancialLedger.findFirst
        .mockResolvedValueOnce(existingLedger) // initial check
        .mockResolvedValueOnce({ id: 'ledger-1', remainingBalance: 1000000n }); // check after increment

      await service.handleWebhook('test_token', {
        external_id: 'contrib-1',
        status: 'PAID',
      });

      expect(prisma.projectFinancialLedger.update).toHaveBeenCalledWith({
        where: { id: 'ledger-1' },
        data: { remainingBalance: { increment: 500000n } },
      });

      expect(prisma.project.update).toHaveBeenCalledWith({
        where: { id: 'proj-1' },
        data: {
          status: ProjectStatus.DANA_TERPENUHI,
          fundingCompletedAt: expect.any(Date),
        },
      });
    });
  });
});
