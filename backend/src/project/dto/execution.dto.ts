import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMilestoneDto {
  @ApiProperty({ description: 'Nama Milestone' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Deskripsi Milestone' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Tanggal Rencana Pelaksanaan' })
  @IsString()
  @IsOptional()
  plannedDate?: string;
}

export class ReportProgressDto {
  @ApiProperty({ description: 'Persentase Progres (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  progressPercentage: number;

  @ApiProperty({ description: 'Deskripsi Laporan Progres' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ description: 'URL Bukti Foto/Dokumen' })
  @IsString()
  @IsOptional()
  evidenceUrl?: string;

  @ApiPropertyOptional({
    description:
      'Cloudinary publicId untuk bukti (digunakan untuk akses secure PB-151)',
  })
  @IsString()
  @IsOptional()
  evidencePublicId?: string;
}

export class ReviewEvidenceDto {
  @ApiProperty({
    description: 'Status Verifikasi Bukti',
    enum: ['VALIDATED', 'REJECTED'],
  })
  @IsEnum(['VALIDATED', 'REJECTED'])
  status: 'VALIDATED' | 'REJECTED';

  @ApiPropertyOptional({ description: 'Catatan Peninjauan Koperasi' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class ReportMaterialIssueDto {
  @ApiProperty({
    description: 'Kategori Kendala/Insiden',
    enum: ['DELAY', 'DAMAGE', 'FRAUD', 'FORCE_MAJEURE'],
  })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({
    description: 'Tingkat Keparahan',
    enum: ['LOW', 'MEDIUM', 'HIGH'],
  })
  @IsString()
  @IsNotEmpty()
  severity: string;

  @ApiProperty({ description: 'Deskripsi Detail Kendala' })
  @IsString()
  @IsNotEmpty()
  description: string;
}
