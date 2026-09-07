import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TriggerCronDto {
  @ApiProperty({
    example: '2026-11-06',
    description: 'Tanggal saat ini (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  projectId?: string;
}
