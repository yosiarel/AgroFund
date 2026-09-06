import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AssessmentStatus } from '@prisma/client';

export class AssessProjectDto {
  @ApiProperty({ enum: AssessmentStatus })
  @IsEnum(AssessmentStatus)
  status: AssessmentStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
