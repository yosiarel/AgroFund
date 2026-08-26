import { IsNumber, Min, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FundDto {
  @ApiProperty({ description: 'Amount to fund in IDR' })
  @IsNumber({}, { message: 'Nominal pendanaan harus berupa angka' })
  @Min(1000, { message: 'Nominal pendanaan minimal Rp 1.000' })
  amount: number;

  @ApiProperty({ description: 'If true, investor skips natura reward and avoids 5% markup', required: false })
  @IsBoolean({ message: 'Pilihan skip reward harus berupa boolean' })
  @IsOptional()
  skipReward?: boolean;
}
