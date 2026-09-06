import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class KoperasiService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      where: { role: Role.KOPERASI },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
      },
      orderBy: { name: 'asc' }
    });
  }
}
