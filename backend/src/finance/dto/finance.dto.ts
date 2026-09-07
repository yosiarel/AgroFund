import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ContributeDto {
  @ApiProperty({
    description: 'Jumlah uang yang diinvestasikan',
    example: 500000,
  })
  @IsNumber()
  @Min(10000)
  amount: number;

  @ApiProperty({
    required: false,
    description: 'ID Paket Natura (jika memilih natura)',
  })
  @IsOptional()
  @IsString()
  naturaPackageId?: string;
}

export class WebhookDto {
  @ApiProperty({
    description:
      'ID Eksternal dari Invoice (contoh: GUARANTEE_projId_timestamp atau contributionId)',
  })
  @IsString()
  @IsNotEmpty()
  external_id: string;

  @ApiProperty({
    description: 'Status dari Invoice (contoh: PAID atau FAILED)',
  })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({ description: 'Total jumlah uang yang dibayarkan' })
  @IsOptional()
  @IsNumber()
  amount?: number;
}
