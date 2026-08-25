import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { CompleteProjectDto } from './dto/complete-project.dto';
import { ProjectStatus, TransactionType, Role } from '@prisma/client';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) { }

  private validateProjectContent(title: string, description: string) {
    const bannedWords = [
      'judi', 'penipuan', 'scam', 'ilegal', 'fiktif', 'palsu', 'ponzi',
      'pinjol', 'babi', 'narkoba', 'pencucian uang', 'slot', 'togel',
      'sabu', 'ganja', 'miras', 'alkohol', 'senjata', 'prostitusi',
      'pornografi', 'pesugihan', 'haram', 'riba', 'rentenir', 'crypto',
      'kripto', 'bitcoin', 'saham', 'trading', 'forex', 'binomo'
    ];

    const titleLower = title.toLowerCase();
    const descLower = description.toLowerCase();

    for (const word of bannedWords) {
      if (titleLower.includes(word) || descLower.includes(word)) {
        throw new BadRequestException(`Proyek ditolak secara otomatis karena terindikasi mengandung konten tidak pantas.`);
      }
    }

    if (title.length < 10) {
      throw new BadRequestException('Judul proyek terlalu singkat (minimal 10 karakter).');
    }
    if (description.length < 30) {
      throw new BadRequestException('Deskripsi proyek terlalu singkat (minimal 30 karakter).');
    }
  }

  async create(userId: string, dto: CreateProjectDto) {
    const targetAmount = BigInt(dto.targetAmount);
    const markupAmount = (targetAmount * 15n) / 100n;

    this.validateProjectContent(dto.title, dto.description);

    return this.prisma.project.create({
      data: {
        title: dto.title,
        description: dto.description,
        targetAmount,
        markupAmount,
        imageUrl: dto.imageUrl,
        userId,
        status: ProjectStatus.FUNDING,
      },
    });
  }

  async findAll() {
    return this.prisma.project.findMany({
      include: {
        user: {
          select: { name: true, address: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMyProjects(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      include: {
        investments: {
          where: { status: { notIn: ['PENDING', 'FAILED'] } },
          include: {
            investor: { select: { name: true, address: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string, currentUser?: any) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, address: true, phone: true } },
        investments: {
          where: { status: { notIn: ['PENDING', 'FAILED'] } },
          select: {
            id: true,
            amount: true,
            createdAt: true,
            investor: { select: { name: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      },
    });

    if (!project) return null;

    const isAdmin = currentUser?.role === Role.ADMIN;

    const maskedInvestments = project.investments.map(inv => {
      const name = inv.investor.name;
      let maskedName = name;

      if (!isAdmin) {
        if (name.length > 2) {
          maskedName = name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
        } else if (name.length === 2) {
          maskedName = name[0] + '*';
        } else {
          maskedName = '*';
        }
      }

      return {
        id: inv.id,
        amount: inv.amount,
        createdAt: inv.createdAt,
        investorName: maskedName,
      };
    });

    return {
      ...project,
      investments: maskedInvestments,
    };
  }

  async completeProject(userId: string, projectId: string, dto: CompleteProjectDto) {
    const { status, failedReason, failedProofUrl } = dto;
    if (status !== ProjectStatus.SUCCESS && status !== ProjectStatus.FAILED) {
      throw new BadRequestException('Status harus SUCCESS atau FAILED');
    }

    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.findUnique({
        where: { id: projectId },
        include: { investments: true }
      });
      if (!project) throw new NotFoundException('Proyek tidak ditemukan');
      if (project.userId !== userId) throw new BadRequestException('Bukan proyek Anda');
      if (project.status !== ProjectStatus.FUNDED && project.status !== ProjectStatus.FUNDING) {
        throw new BadRequestException('Proyek tidak dapat diselesaikan dari status saat ini');
      }

      const admin = await tx.user.findFirst({ where: { role: Role.ADMIN } });
      if (!admin) throw new BadRequestException('Kesalahan Sistem: Akun Admin tidak ditemukan');

      const markup = project.markupAmount;
      const collected = project.collectedAmount;
      const softCap = (project.targetAmount * 75n) / 100n;
      const isSoftCapReached = collected >= softCap;

      if (status === ProjectStatus.SUCCESS) {
        if (!isSoftCapReached) {
          throw new BadRequestException('Proyek tidak dapat ditandai SUCCESS jika Soft Cap belum tercapai');
        }
        let totalMarkup = 0n;
        for (const inv of project.investments) {
          if (inv.status === 'SUCCESS' && inv.rewardOptIn) {
            const principal = (inv.amount * 100n) / 115n;
            totalMarkup += (inv.amount - principal);
          }
        }

        if (totalMarkup > 0n) {
          await tx.wallet.update({
            where: { userId: admin.id },
            data: { hold: { decrement: totalMarkup } }
          });
          await tx.wallet.update({
            where: { userId: project.userId },
            data: { balance: { increment: totalMarkup } }
          });

          await tx.transaction.create({
            data: {
              userId: project.userId,
              type: TransactionType.RELEASE,
              amount: totalMarkup,
              referenceId: projectId
            }
          });
        }
      } else if (status === ProjectStatus.FAILED) {
        let totalPrincipalRefunded = 0n;
        let totalMarkupRefunded = 0n;

        for (const inv of project.investments) {
          if (inv.status === 'SUCCESS') {
            const principal = inv.rewardOptIn ? (inv.amount * 100n) / 115n : inv.amount;
            const markup = inv.rewardOptIn ? (inv.amount - principal) : 0n;

            totalPrincipalRefunded += principal;
            totalMarkupRefunded += markup;

            const refundAmount = isSoftCapReached ? markup : inv.amount;

            if (refundAmount > 0n) {
              await tx.wallet.update({
                where: { userId: inv.investorId },
                data: { balance: { increment: refundAmount } }
              });

              await tx.transaction.create({
                data: {
                  userId: inv.investorId,
                  type: TransactionType.REFUND,
                  amount: refundAmount,
                  referenceId: projectId
                }
              });
            }

            await tx.investment.update({
              where: { id: inv.id },
              data: { status: 'REFUNDED' }
            });
          }
        }

        if (isSoftCapReached) {
          if (totalMarkupRefunded > 0n) {
            await tx.wallet.update({
              where: { userId: admin.id },
              data: { hold: { decrement: totalMarkupRefunded } }
            });
          }
        } else {
          const totalRefund = totalPrincipalRefunded + totalMarkupRefunded;
          if (totalRefund > 0n) {
            await tx.wallet.update({
              where: { userId: admin.id },
              data: { hold: { decrement: totalRefund } }
            });
          }
        }
      }

      const updateData: any = { status };
      if (status === ProjectStatus.FAILED) {
        updateData.failedReason = failedReason;
        updateData.failedProofUrl = failedProofUrl;
      }

      return tx.project.update({
        where: { id: projectId },
        data: updateData
      });
    });
  }

  async deleteProject(userId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { investments: true }
    });
    if (!project) throw new NotFoundException('Proyek tidak ditemukan');
    if (project.userId !== userId) throw new BadRequestException('Bukan proyek Anda');

    const softCap = (project.targetAmount * 75n) / 100n;
    if (project.collectedAmount >= softCap) {
      throw new BadRequestException('Proyek yang sudah mencapai Soft Cap tidak dapat dihapus. Silakan hubungi Admin.');
    }

    const hasSuccessfulInvestments = project.investments.some(inv => inv.status === 'SUCCESS');

    if (!hasSuccessfulInvestments) {
      await this.prisma.investment.deleteMany({ where: { projectId } });
      return this.prisma.project.delete({ where: { id: projectId } });
    } else {
      return this.completeProject(userId, projectId, {
        status: ProjectStatus.FAILED,
        failedReason: 'Proyek dibatalkan oleh pembuat sebelum dana mencapai target soft cap.'
      } as CompleteProjectDto);
    }
  }

  async updateProject(userId: string, projectId: string, data: any) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { investments: true }
    });

    if (!project) {
      throw new NotFoundException('Proyek tidak ditemukan');
    }

    if (project.userId !== userId) {
      throw new BadRequestException('Bukan proyek Anda');
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.trackingResi !== undefined) updateData.trackingResi = data.trackingResi;

    if (data.title !== undefined || data.description !== undefined) {
      const titleToValidate = data.title !== undefined ? data.title : project.title;
      const descToValidate = data.description !== undefined ? data.description : project.description;
      this.validateProjectContent(titleToValidate, descToValidate);
    }

    if (data.targetAmount !== undefined && BigInt(data.targetAmount) !== project.targetAmount) {
      const hasSuccessfulInvestments = project.investments.some(inv => inv.status === 'SUCCESS');
      if (hasSuccessfulInvestments) {
        throw new BadRequestException('Target proyek tidak dapat diubah karena sudah ada pendanaan masuk.');
      }

      const targetAmount = BigInt(data.targetAmount);
      const markupAmount = (targetAmount * 15n) / 100n;

      updateData.targetAmount = targetAmount;
      updateData.markupAmount = markupAmount;
    }

    const updatedProject = await this.prisma.project.update({
      where: { id: projectId },
      data: updateData
    });

    return {
      ...updatedProject,
      targetAmount: updatedProject.targetAmount.toString(),
      markupAmount: updatedProject.markupAmount.toString(),
      collectedAmount: updatedProject.collectedAmount.toString(),
    };
  }
}
