import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TriggerCronDto } from './dto/cron.dto';
import { ProjectStatus } from '@prisma/client';

@Injectable()
export class CronService {
  constructor(private readonly prisma: PrismaService) {}

  async checkExpiredFunds(dto: TriggerCronDto) {
    const checkDate = new Date(dto.date);

    const whereClause: any = {
      status: ProjectStatus.FUNDRAISING,
      fundraisingDeadline: {
        lt: checkDate,
      },
    };

    if (dto.projectId) {
      whereClause.id = dto.projectId;
    }

    const expiredProjects = await this.prisma.project.findMany({
      where: whereClause,
    });

    let updatedCount = 0;

    for (const project of expiredProjects) {
      await this.prisma.$transaction(async (tx) => {
        // Change status to GAGAL_DITUTUP
        await tx.project.update({
          where: { id: project.id },
          data: {
            status: ProjectStatus.GAGAL_DITUTUP,
            failedReason: 'Target pendanaan tidak tercapai hingga batas waktu',
          },
        });

        // In a real scenario, trigger refunds here for contributions and guarantee.
        // For MVP, just changing status is sufficient to demonstrate the state transition.
      });
      updatedCount++;
    }

    return {
      message: 'Cron job manual berhasil dijalankan',
      checkedDate: checkDate.toISOString(),
      expiredProjectsFound: updatedCount,
    };
  }
}
