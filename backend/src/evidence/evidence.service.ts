import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class EvidenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  async getSecureEvidenceAccess(
    evidenceId: string,
    userId: string,
    role: string,
  ) {
    const evidence = await this.prisma.evidence.findUnique({
      where: { id: evidenceId },
    });

    if (!evidence) {
      throw new NotFoundException('Evidence tidak ditemukan');
    }

    // Resolve associated projectId
    let projectId: string | null = null;

    if (evidence.referenceType === 'PROGRESS_REPORT') {
      const report = await this.prisma.progressReport.findUnique({
        where: { id: evidence.referenceId },
        include: { milestone: { select: { projectId: true } } },
      });
      if (report) projectId = report.milestone.projectId;
    } else if (evidence.referenceType === 'PO') {
      const po = await this.prisma.purchaseOrder.findUnique({
        where: { id: evidence.referenceId },
        include: { request: { select: { projectId: true } } },
      });
      if (po) projectId = po.request.projectId;
    } else if (evidence.referenceType === 'INCIDENT') {
      const incident = await this.prisma.incident.findUnique({
        where: { id: evidence.referenceId },
        select: { projectId: true },
      });
      if (incident) projectId = incident.projectId;
    }

    if (!projectId) {
      throw new NotFoundException('Proyek terkait evidence tidak ditemukan');
    }

    // AgroFund Admin always has access
    if (role === 'AGROFUND') {
      return this.grantAccess(evidence);
    }

    // Fetch project details with investor contribution check
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        contributions: {
          where: { investorId: userId, status: 'PAID' },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Proyek tidak ditemukan');
    }

    // UMKM Owner
    if (project.userId === userId) {
      return this.grantAccess(evidence);
    }

    // Assigned Koperasi
    if (project.koperasiId === userId) {
      return this.grantAccess(evidence);
    }

    // Investor who paid for this project
    if (project.contributions.length > 0) {
      return this.grantAccess(evidence);
    }

    // Deny all other users (cross-project, unauthorized)
    throw new ForbiddenException(
      'Akses ke bukti proyek ditolak: Anda tidak memiliki wewenang pada proyek ini',
    );
  }

  private grantAccess(evidence: any) {
    // publicId is the authoritative Cloudinary asset identifier for authenticated (private) assets.
    // fileUrl alone cannot be used to generate a valid signed URL — it is a full URL, not a publicId.
    if (!evidence.publicId) {
      throw new BadRequestException(
        'Evidence tidak memiliki publicId — file ini tidak dapat diakses secara aman. Upload ulang melalui endpoint yang benar.',
      );
    }
    const signedUrl = this.uploadService.generateSignedUrl(
      evidence.publicId,
      3600,
    );
    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

    return {
      evidenceId: evidence.id,
      referenceType: evidence.referenceType,
      referenceId: evidence.referenceId,
      status: evidence.status,
      signedUrl,
      expiresAt,
    };
  }
}
