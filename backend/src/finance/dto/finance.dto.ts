import { IsString, IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ContributeDto {
  @ApiProperty()
  @IsNumber()
  @Min(10000)
  amount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  naturaPackageId?: string;
}

export class WebhookDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  referenceId: string; // The ID of the Guarantee or Contribution

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  type: 'GUARANTEE' | 'CONTRIBUTION';

  @ApiProperty()
  @IsString()
  status: 'PAID' | 'FAILED';
}
