import { Test, TestingModule } from '@nestjs/testing';
import { EvidenceService } from './evidence.service';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

describe('EvidenceService - PB-151 Secure Evidence Access', () => {
  let service: EvidenceService;
  let prisma: any;
  let uploadService: any;

  beforeEach(async () => {
    prisma = {
      evidence: {
        findUnique: jest.fn(),
      },
      progressReport: {
        findUnique: jest.fn(),
      },
      purchaseOrder: {
        findUnique: jest.fn(),
      },
      incident: {
        findUnique: jest.fn(),
      },
      project: {
        findUnique: jest.fn(),
      },
    };

    uploadService = {
      generateSignedUrl: jest.fn(
        (assetId: string) => `https://cloudinary.com/signed/${assetId}`,
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvidenceService,
        { provide: PrismaService, useValue: prisma },
        { provide: UploadService, useValue: uploadService },
      ],
    }).compile();

    service = module.get<EvidenceService>(EvidenceService);
  });

  it('should grant access to AGROFUND Admin role without checking project ownership', async () => {
    prisma.evidence.findUnique.mockResolvedValue({
      id: 'ev-1',
      referenceType: 'PROGRESS_REPORT',
      referenceId: 'rep-1',
      fileUrl: 'https://cloudinary.com/private-asset.jpg',
      publicId: 'akarmakmur/private-asset',
      status: 'SUBMITTED',
    });
    prisma.progressReport.findUnique.mockResolvedValue({
      id: 'rep-1',
      milestone: { projectId: 'proj-1' },
    });

    const result = await service.getSecureEvidenceAccess(
      'ev-1',
      'admin-user',
      'AGROFUND',
    );

    expect(result.evidenceId).toBe('ev-1');
    expect(result.signedUrl).toContain('https://cloudinary.com/signed/');
    expect(uploadService.generateSignedUrl).toHaveBeenCalledWith(
      'akarmakmur/private-asset',
      3600,
    );
  });

  it('should grant access to UMKM owner of the project', async () => {
    prisma.evidence.findUnique.mockResolvedValue({
      id: 'ev-1',
      referenceType: 'PROGRESS_REPORT',
      referenceId: 'rep-1',
      fileUrl: 'https://cloudinary.com/private-asset.jpg',
      publicId: 'akarmakmur/private-asset',
      status: 'SUBMITTED',
    });
    prisma.progressReport.findUnique.mockResolvedValue({
      id: 'rep-1',
      milestone: { projectId: 'proj-1' },
    });
    prisma.project.findUnique.mockResolvedValue({
      id: 'proj-1',
      userId: 'umkm-user-1',
      koperasiId: 'kop-user-1',
      contributions: [],
    });

    const result = await service.getSecureEvidenceAccess(
      'ev-1',
      'umkm-user-1',
      'UMKM',
    );

    expect(result.evidenceId).toBe('ev-1');
    expect(result.signedUrl).toBeDefined();
  });

  it('should grant access to assigned KOPERASI user', async () => {
    prisma.evidence.findUnique.mockResolvedValue({
      id: 'ev-1',
      referenceType: 'PROGRESS_REPORT',
      referenceId: 'rep-1',
      fileUrl: 'https://cloudinary.com/private-asset.jpg',
      publicId: 'akarmakmur/private-asset',
      status: 'SUBMITTED',
    });
    prisma.progressReport.findUnique.mockResolvedValue({
      id: 'rep-1',
      milestone: { projectId: 'proj-1' },
    });
    prisma.project.findUnique.mockResolvedValue({
      id: 'proj-1',
      userId: 'umkm-user-1',
      koperasiId: 'kop-user-1',
      contributions: [],
    });

    const result = await service.getSecureEvidenceAccess(
      'ev-1',
      'kop-user-1',
      'KOPERASI',
    );

    expect(result.evidenceId).toBe('ev-1');
  });

  it('should grant access to PENDANA investor with paid contribution to the project', async () => {
    prisma.evidence.findUnique.mockResolvedValue({
      id: 'ev-1',
      referenceType: 'PROGRESS_REPORT',
      referenceId: 'rep-1',
      fileUrl: 'https://cloudinary.com/private-asset.jpg',
      publicId: 'akarmakmur/private-asset',
      status: 'SUBMITTED',
    });
    prisma.progressReport.findUnique.mockResolvedValue({
      id: 'rep-1',
      milestone: { projectId: 'proj-1' },
    });
    prisma.project.findUnique.mockResolvedValue({
      id: 'proj-1',
      userId: 'umkm-user-1',
      koperasiId: 'kop-user-1',
      contributions: [
        { id: 'c-1', investorId: 'investor-user-1', status: 'PAID' },
      ],
    });

    const result = await service.getSecureEvidenceAccess(
      'ev-1',
      'investor-user-1',
      'PENDANA',
    );

    expect(result.evidenceId).toBe('ev-1');
  });

  it('should throw 403 Forbidden for cross-project cooperative or unauthorized user', async () => {
    prisma.evidence.findUnique.mockResolvedValue({
      id: 'ev-1',
      referenceType: 'PROGRESS_REPORT',
      referenceId: 'rep-1',
      fileUrl: 'https://cloudinary.com/private-asset.jpg',
      publicId: 'akarmakmur/private-asset',
      status: 'SUBMITTED',
    });
    prisma.progressReport.findUnique.mockResolvedValue({
      id: 'rep-1',
      milestone: { projectId: 'proj-1' },
    });
    prisma.project.findUnique.mockResolvedValue({
      id: 'proj-1',
      userId: 'umkm-user-1',
      koperasiId: 'kop-user-1',
      contributions: [],
    });

    await expect(
      service.getSecureEvidenceAccess(
        'ev-1',
        'unrelated-kop-user-99',
        'KOPERASI',
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw 404 NotFoundException if evidence does not exist', async () => {
    prisma.evidence.findUnique.mockResolvedValue(null);

    await expect(
      service.getSecureEvidenceAccess('non-existent-ev', 'user-1', 'UMKM'),
    ).rejects.toThrow(NotFoundException);
  });

  // ─── FINDING 2 + 3: File-access security boundary ────────────────────────

  it('[F2/F3] signed URL is generated from publicId, NOT from fileUrl', async () => {
    // Proves: fileUrl (full Cloudinary URL) is never passed to generateSignedUrl.
    // Only the publicId (Cloudinary asset identifier) is used to generate the signed URL.
    const publicId = 'akarmakmur/evidence-photo-123';
    const fileUrl =
      'https://res.cloudinary.com/demo/image/authenticated/akarmakmur/evidence-photo-123.jpg';

    prisma.evidence.findUnique.mockResolvedValue({
      id: 'ev-secure',
      referenceType: 'PROGRESS_REPORT',
      referenceId: 'rep-1',
      fileUrl,
      publicId,
      status: 'SUBMITTED',
    });
    prisma.progressReport.findUnique.mockResolvedValue({
      id: 'rep-1',
      milestone: { projectId: 'proj-1' },
    });

    // Grant access as Admin (bypass ownership check)
    await service.getSecureEvidenceAccess(
      'ev-secure',
      'admin-user',
      'AGROFUND',
    );

    // generateSignedUrl must be called with publicId, NOT fileUrl
    expect(uploadService.generateSignedUrl).toHaveBeenCalledWith(
      publicId,
      3600,
    );
    expect(uploadService.generateSignedUrl).not.toHaveBeenCalledWith(
      fileUrl,
      expect.anything(),
    );
  });

  it('[F2/F3] signed URL contains publicId path — not a raw fileUrl', async () => {
    const publicId = 'akarmakmur/photo-abc';

    prisma.evidence.findUnique.mockResolvedValue({
      id: 'ev-2',
      referenceType: 'PROGRESS_REPORT',
      referenceId: 'rep-1',
      fileUrl:
        'https://res.cloudinary.com/demo/image/authenticated/akarmakmur/photo-abc.jpg',
      publicId,
      status: 'SUBMITTED',
    });
    prisma.progressReport.findUnique.mockResolvedValue({
      id: 'rep-1',
      milestone: { projectId: 'proj-1' },
    });

    const result = await service.getSecureEvidenceAccess(
      'ev-2',
      'admin-user',
      'AGROFUND',
    );

    // The signedUrl is generated from publicId (mock appends publicId path)
    expect(result.signedUrl).toContain(publicId);
    // Expiry is set (1 hour = 3600s)
    expect(result.expiresAt).toBeDefined();
    const expiresAt = new Date(result.expiresAt);
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('[F2/F3] throws BadRequestException when evidence.publicId is null (legacy record without secure upload)', async () => {
    // An evidence record without publicId cannot generate a valid signed URL.
    // The system must reject access rather than silently pass fileUrl as a fake publicId.
    prisma.evidence.findUnique.mockResolvedValue({
      id: 'ev-legacy',
      referenceType: 'PROGRESS_REPORT',
      referenceId: 'rep-1',
      fileUrl:
        'https://res.cloudinary.com/demo/image/upload/akarmakmur/old-public.jpg',
      publicId: null, // no secure publicId — legacy record
      status: 'SUBMITTED',
    });
    prisma.progressReport.findUnique.mockResolvedValue({
      id: 'rep-1',
      milestone: { projectId: 'proj-1' },
    });

    await expect(
      service.getSecureEvidenceAccess('ev-legacy', 'admin-user', 'AGROFUND'),
    ).rejects.toThrow(BadRequestException);

    // generateSignedUrl must NOT be called — no publicId to sign with
    expect(uploadService.generateSignedUrl).not.toHaveBeenCalled();
  });
});
