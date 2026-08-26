import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TopUpDto {
  @ApiProperty({ description: 'Amount to top-up in IDR' })
  @IsNumber({}, { message: 'Nominal top-up harus berupa angka' })
  @Min(1000, { message: 'Nominal top-up minimal Rp 1.000' })
  amount: number;
}
