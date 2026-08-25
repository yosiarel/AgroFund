import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { ProjectStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteProjectDto {
  @ApiProperty({ enum: [ProjectStatus.SUCCESS, ProjectStatus.FAILED] })
  @IsEnum({ SUCCESS: ProjectStatus.SUCCESS, FAILED: ProjectStatus.FAILED }, { message: 'Status tidak valid' })
  status: ProjectStatus;

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.status === ProjectStatus.FAILED)
  @IsString()
  @IsNotEmpty({ message: 'Alasan kegagalan wajib diisi jika status gagal' })
  failedReason?: string;

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.status === ProjectStatus.FAILED)
  @IsString()
  @IsNotEmpty({ message: 'Bukti foto kegagalan wajib disertakan jika status gagal' })
  failedProofUrl?: string;
}
