import { Module } from '@nestjs/common';
import { KoperasiService } from './koperasi.service';
import { KoperasiController } from './koperasi.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [KoperasiController],
  providers: [KoperasiService],
})
export class KoperasiModule {}
