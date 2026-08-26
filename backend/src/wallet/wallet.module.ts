import { Module } from '@nestjs/common';
import { InvestmentModule } from '../investment/investment.module';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, InvestmentModule],
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule {}
