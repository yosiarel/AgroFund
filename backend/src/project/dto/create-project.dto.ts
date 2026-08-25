import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty()
  @IsString({ message: 'Judul proyek harus berupa teks' })
  @IsNotEmpty({ message: 'Judul proyek tidak boleh kosong' })
  title: string;

  @ApiProperty()
  @IsString({ message: 'Deskripsi proyek harus berupa teks' })
  @IsNotEmpty({ message: 'Deskripsi proyek tidak boleh kosong' })
  description: string;

  @ApiProperty({ description: 'Target funding amount in IDR' })
  @IsNumber({}, { message: 'Target pendanaan harus berupa angka' })
  @Min(10000, { message: 'Target pendanaan minimal Rp 10.000' })
  targetAmount: number;

  @ApiProperty({ required: false })
  @IsString({ message: 'URL Gambar harus berupa teks' })
  @IsNotEmpty({ message: 'URL Gambar tidak boleh kosong' })
  imageUrl?: string;
}
