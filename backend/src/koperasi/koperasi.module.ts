import { Module } from '@nestjs/common';
import { KoperasiService } from './koperasi.service';
import { KoperasiController } from './koperasi.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [KoperasiController],
  providers: [KoperasiService],
})
export class KoperasiModule {}
