import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectStatus } from '@prisma/client';

describe('ProjectService - PB-091 Reporting Schedule (Authoritative executionStartedAt Anchor)', () => {
  let service: ProjectService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      project: { findUnique: jest.fn(), update: jest.fn() },
      milestone: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      progressReport: { create: jest.fn() },
      evidence: { create: jest.fn() },
      $transaction: jest.fn((cb) => cb(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
  });

  // =========================================================================
  // TASK 7 - A: Execution start timestamp
  // =========================================================================
  describe('A � Execution start timestamp (PB-091 Lifecycle Transition)', () => {
    it('A1: executionStartedAt is set when the project transitions into EXECUTION', async () => {
      prisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        userId: 'user-1',
        status: ProjectStatus.PROCUREMENT,
        executionStartedAt: null,
        outputAvailableAt: null,
      });
      prisma.milestone.findUnique.mockResolvedValue({
        id: 'm-1',
        projectId: 'proj-1',
        status: 'PLANNED',
      });
      prisma.progressReport.create.mockResolvedValue({
        id: 'rep-1',
        milestoneId: 'm-1',
        progressPercentage: 25,
      });
      prisma.milestone.update.mockResolvedValue({});
      prisma.project.update.mockResolvedValue({});

      await service.reportProgress('proj-1', 'm-1', 'user-1', {
        progressPercentage: 25,
        description: 'First progress report',
      });

      expect(prisma.project.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'proj-1' },
          data: {
            status: ProjectStatus.EXECUTION,
            executionStartedAt: expect.any(Date),
          },
        }),
      );
    });

    it('A2: executionStartedAt is preserved (not overwritten) on repeated/idempotent transition', async () => {
      const existingExecutionStartedAt = new Date('2026-09-21T08:00:00.000Z');
      prisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        userId: 'user-1',
        status: ProjectStatus.PROCUREMENT,
        executionStartedAt: existingExecutionStartedAt,
        outputAvailableAt: null,
      });
      prisma.milestone.findUnique.mockResolvedValue({
        id: 'm-1',
        projectId: 'proj-1',
        status: 'PLANNED',
      });
      prisma.progressReport.create.mockResolvedValue({
        id: 'rep-2',
        milestoneId: 'm-1',
        progressPercentage: 50,
      });
      prisma.milestone.update.mockResolvedValue({});
      prisma.project.update.mockResolvedValue({});

      await service.reportProgress('proj-1', 'm-1', 'user-1', {
        progressPercentage: 50,
        description: 'Second progress report',
      });

      expect(prisma.project.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'proj-1' },
          data: {
            status: ProjectStatus.EXECUTION,
            executionStartedAt: existingExecutionStartedAt,
          },
        }),
      );
    });
  });

  // =========================================================================
  // TASK 7 - B: First execution schedule
  // =========================================================================
  describe('B � First execution schedule (executionStartedAt + 30 days)', () => {
    it('B1: Given executionStartedAt = 2026-09-21 and no ProgressReport, expected executionReportDueDate = 2026-10-21 and lastReportAt = 2026-09-21', async () => {
      const executionStartedAt = new Date('2026-09-21T00:00:00.000Z');
      prisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        status: 'EXECUTION',
        fundingCompletedAt: new Date('2026-09-01T00:00:00.000Z'),
        executionStartedAt,
        outputAvailableAt: null,
        milestones: [
          { id: 'm1', plannedDate: null, status: 'PLANNED', reports: [] },
        ],
      });

      const result = await service.getProjectSchedule('proj-1');

      const expectedDueDate = new Date(
        '2026-10-21T00:00:00.000Z',
      ).toISOString();
      expect(result.executionStartedAt).toBe(executionStartedAt.toISOString());
      expect(result.lastReportAt).toBe(executionStartedAt.toISOString());
      expect(result.executionReportDueDate).toBe(expectedDueDate);
    });
  });

  // =========================================================================
  // TASK 7 - C: Funding timestamp is NOT used
  // =========================================================================
  describe('C � Funding timestamp is NOT used as execution reporting anchor', () => {
    it('C1: Given fundingCompletedAt = 2026-09-01, executionStartedAt = 2026-09-21, no ProgressReport -> deadline is 2026-10-21, NOT 2026-10-01', async () => {
      const fundingCompletedAt = new Date('2026-09-01T00:00:00.000Z');
      const executionStartedAt = new Date('2026-09-21T00:00:00.000Z');

      prisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        status: 'EXECUTION',
        fundingCompletedAt,
        executionStartedAt,
        outputAvailableAt: null,
        milestones: [
          { id: 'm1', plannedDate: null, status: 'PLANNED', reports: [] },
        ],
      });

      const result = await service.getProjectSchedule('proj-1');

      const expectedExecutionDueDate = new Date(
        '2026-10-21T00:00:00.000Z',
      ).toISOString();
      const wrongFundingBasedDueDate = new Date(
        '2026-10-01T00:00:00.000Z',
      ).toISOString();

      expect(result.executionReportDueDate).toBe(expectedExecutionDueDate);
      expect(result.executionReportDueDate).not.toBe(wrongFundingBasedDueDate);
      expect(result.lastReportAt).toBe(executionStartedAt.toISOString());
    });
  });

  // =========================================================================
  // TASK 7 - D: Technical timestamps & fundingCompletedAt are NOT fallback
  // =========================================================================
  describe('D � Technical timestamps & funding are NOT fallback anchors', () => {
    it('D1: When executionStartedAt = null, fundingCompletedAt = null, no ProgressReport, even if publishedAt/createdAt/updatedAt exist -> returns executionReportDueDate = null and lastReportAt = null', async () => {
      prisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        status: 'FUNDRAISING',
        fundingCompletedAt: null,
        executionStartedAt: null,
        publishedAt: new Date('2026-08-01T00:00:00.000Z'),
        createdAt: new Date('2026-07-01T00:00:00.000Z'),
        updatedAt: new Date('2026-08-15T00:00:00.000Z'),
        outputAvailableAt: null,
        milestones: [],
      });

      const result = await service.getProjectSchedule('proj-1');

      expect(result.executionReportDueDate).toBeNull();
      expect(result.lastReportAt).toBeNull();
      expect(result.isOverdue).toBe(false);
    });

    it('D2: When executionStartedAt = null, fundingCompletedAt = 2026-09-01, no ProgressReport -> returns executionReportDueDate = null (funding is NOT a fallback)', async () => {
      prisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        status: 'PROCUREMENT',
        fundingCompletedAt: new Date('2026-09-01T00:00:00.000Z'),
        executionStartedAt: null,
        outputAvailableAt: null,
        milestones: [
          { id: 'm1', plannedDate: null, status: 'PLANNED', reports: [] },
        ],
      });

      const result = await service.getProjectSchedule('proj-1');

      expect(result.executionReportDueDate).toBeNull();
      expect(result.lastReportAt).toBeNull();
      // Initial report deadline is still calculated from fundingCompletedAt + 7 days
      expect(result.initialReportDueDate).toBe(
        new Date('2026-09-08T00:00:00.000Z').toISOString(),
      );
    });
  });

  // =========================================================================
  // TASK 7 - E: ProgressReport reset
  // =========================================================================
  describe('E � ProgressReport resets the 30-day reporting cycle', () => {
    it('E1: Given executionStartedAt = 2026-09-21, ProgressReport.createdAt = 2026-10-05 -> expected periodic deadline = 2026-11-04 (report supersedes executionStartedAt)', async () => {
      const executionStartedAt = new Date('2026-09-21T00:00:00.000Z');
      const reportDate = new Date('2026-10-05T00:00:00.000Z');

      prisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        status: 'EXECUTION',
        fundingCompletedAt: new Date('2026-09-01T00:00:00.000Z'),
        executionStartedAt,
        outputAvailableAt: null,
        milestones: [
          {
            id: 'm1',
            plannedDate: null,
            status: 'IN_PROGRESS',
            reports: [{ createdAt: reportDate }],
          },
        ],
      });

      const result = await service.getProjectSchedule('proj-1');

      const expectedDueDate = new Date(
        '2026-11-04T00:00:00.000Z',
      ).toISOString();
      expect(result.lastReportAt).toBe(reportDate.toISOString());
      expect(result.executionReportDueDate).toBe(expectedDueDate);

      // Verify execution-based due is NOT returned
      const executionOnlyDue = new Date(
        executionStartedAt.getTime() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString();
      expect(result.executionReportDueDate).not.toBe(executionOnlyDue);
    });

    it('E2: uses most recent ProgressReport when multiple exist (late report resets cycle)', async () => {
      const report1 = new Date('2026-10-05T00:00:00.000Z');
      const report2 = new Date('2026-11-15T00:00:00.000Z');

      prisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        status: 'EXECUTION',
        fundingCompletedAt: new Date('2026-09-01T00:00:00.000Z'),
        executionStartedAt: new Date('2026-09-21T00:00:00.000Z'),
        outputAvailableAt: null,
        milestones: [
          {
            id: 'm1',
            plannedDate: null,
            status: 'IN_PROGRESS',
            reports: [{ createdAt: report1 }, { createdAt: report2 }],
          },
        ],
      });

      const result = await service.getProjectSchedule('proj-1');

      const expectedDue = new Date(
        report2.getTime() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString();
      expect(result.executionReportDueDate).toBe(expectedDue);
      expect(result.lastReportAt).toBe(report2.toISOString());
    });
  });

  // =========================================================================
  // TASK 7 - F: Milestone MIN rule
  // =========================================================================
  describe('F � Milestone MIN(30d, milestonePlannedDate) rule', () => {
    it('F1: milestone earlier than 30-day deadline -> milestone wins', async () => {
      const executionStartedAt = new Date('2026-09-21T00:00:00.000Z');
      const milestonePlanned = new Date('2026-10-05T00:00:00.000Z'); // 14 days later < 30 days

      prisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        status: 'EXECUTION',
        fundingCompletedAt: new Date('2026-09-01T00:00:00.000Z'),
        executionStartedAt,
        outputAvailableAt: null,
        milestones: [
          {
            id: 'm1',
            plannedDate: milestonePlanned,
            status: 'PLANNED',
            reports: [],
          },
        ],
      });

      const result = await service.getProjectSchedule('proj-1');

      expect(result.executionReportDueDate).toBe(
        milestonePlanned.toISOString(),
      );
      expect(result.nextMilestonePlannedDate).toBe(
        milestonePlanned.toISOString(),
      );
    });

    it('F2: 30-day deadline earlier than milestone -> 30-day deadline wins', async () => {
      const executionStartedAt = new Date('2026-09-21T00:00:00.000Z');
      const milestonePlanned = new Date('2026-11-15T00:00:00.000Z'); // 55 days later > 30 days

      prisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        status: 'EXECUTION',
        fundingCompletedAt: new Date('2026-09-01T00:00:00.000Z'),
        executionStartedAt,
        outputAvailableAt: null,
        milestones: [
          {
            id: 'm1',
            plannedDate: milestonePlanned,
            status: 'PLANNED',
            reports: [],
          },
        ],
      });

      const result = await service.getProjectSchedule('proj-1');

      const expected30DayDue = new Date(
        executionStartedAt.getTime() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString();
      expect(result.executionReportDueDate).toBe(expected30DayDue);
      expect(result.nextMilestonePlannedDate).toBe(
        milestonePlanned.toISOString(),
      );
    });
  });

  // =========================================================================
  // TASK 7 - G: Completed milestones
  // =========================================================================
  describe('G � Completed milestones exclusion', () => {
    it('G1: completed milestones must not become the next reporting trigger', async () => {
      const executionStartedAt = new Date('2026-09-21T00:00:00.000Z');
      const m2Planned = new Date('2026-10-10T00:00:00.000Z');

      prisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        status: 'EXECUTION',
        fundingCompletedAt: new Date('2026-09-01T00:00:00.000Z'),
        executionStartedAt,
        outputAvailableAt: null,
        milestones: [
          {
            id: 'm1',
            plannedDate: new Date('2026-09-25T00:00:00.000Z'),
            status: 'COMPLETED',
            reports: [{ createdAt: new Date('2026-09-24T00:00:00.000Z') }],
          },
          { id: 'm2', plannedDate: m2Planned, status: 'PLANNED', reports: [] },
        ],
      });

      const result = await service.getProjectSchedule('proj-1');

      expect(result.nextMilestonePlannedDate).toBe(m2Planned.toISOString());
    });
  });

  // =========================================================================
  // TASK 7 - H: Determinism
  // =========================================================================
  describe('H � Schedule calculation determinism', () => {
    it('H1: two schedule reads with identical persisted data produce identical deadline/anchor values', async () => {
      const executionStartedAt = new Date('2026-09-21T00:00:00.000Z');
      const mockProject = {
        id: 'proj-1',
        status: 'EXECUTION',
        fundingCompletedAt: new Date('2026-09-01T00:00:00.000Z'),
        executionStartedAt,
        outputAvailableAt: null,
        milestones: [
          { id: 'm1', plannedDate: null, status: 'PLANNED', reports: [] },
        ],
      };

      prisma.project.findUnique.mockResolvedValue(mockProject);
      const result1 = await service.getProjectSchedule('proj-1');

      prisma.project.findUnique.mockResolvedValue(mockProject);
      const result2 = await service.getProjectSchedule('proj-1');

      expect(result1.executionReportDueDate).toBe(
        result2.executionReportDueDate,
      );
      expect(result1.lastReportAt).toBe(result2.lastReportAt);
      expect(result1.initialReportDueDate).toBe(result2.initialReportDueDate);
      expect(result1.finalReportDueDate).toBe(result2.finalReportDueDate);
    });
  });

  // =========================================================================
  // TASK 5 � Preserved Existing Behavior: Initial Report & Final Report
  // =========================================================================
  describe('Preserved Valid Rules � Initial & Final Report Deadlines', () => {
    it('Initial report deadline is fundingCompletedAt + 7 calendar days', async () => {
      const fundingDate = new Date('2026-09-01T10:00:00.000Z');
      prisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        status: 'DANA_TERPENUHI',
        fundingCompletedAt: fundingDate,
        executionStartedAt: null,
        outputAvailableAt: null,
        milestones: [],
      });

      const result = await service.getProjectSchedule('proj-1');

      expect(result.fundingCompletedAt).toBe(fundingDate.toISOString());
      expect(result.initialReportDueDate).toBe(
        new Date('2026-09-08T10:00:00.000Z').toISOString(),
      );
    });

    it('Final report deadline is outputAvailableAt + 7 calendar days', async () => {
      const outputDate = new Date('2026-11-01T10:00:00.000Z');
      prisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        status: 'NATURA_FULFILLMENT',
        fundingCompletedAt: new Date('2026-09-01T10:00:00.000Z'),
        executionStartedAt: new Date('2026-09-21T10:00:00.000Z'),
        outputAvailableAt: outputDate,
        milestones: [],
      });

      const result = await service.getProjectSchedule('proj-1');

      expect(result.outputAvailableAt).toBe(outputDate.toISOString());
      expect(result.finalReportDueDate).toBe(
        new Date('2026-11-08T10:00:00.000Z').toISOString(),
      );
    });

    it('Sets outputAvailableAt when all milestones complete in reportProgress', async () => {
      prisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        userId: 'user-1',
        status: ProjectStatus.EXECUTION,
        executionStartedAt: new Date('2026-09-21T00:00:00.000Z'),
        outputAvailableAt: null,
      });
      prisma.milestone.findUnique.mockResolvedValue({
        id: 'm-last',
        projectId: 'proj-1',
        status: 'IN_PROGRESS',
      });
      prisma.progressReport.create.mockResolvedValue({
        id: 'rep-1',
        milestoneId: 'm-last',
        progressPercentage: 100,
      });
      prisma.milestone.findMany.mockResolvedValue([]);
      prisma.project.update.mockResolvedValue({});

      await service.reportProgress('proj-1', 'm-last', 'user-1', {
        progressPercentage: 100,
        description: 'Complete',
      });

      expect(prisma.project.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'proj-1' },
          data: { outputAvailableAt: expect.any(Date) },
        }),
      );
    });
  });
});
