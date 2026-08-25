import { IsOptional, IsString, IsPhoneNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Full name of the user' })
  @IsOptional()
  @IsString({ message: 'Nama harus berupa teks' })
  name?: string;

  @ApiPropertyOptional({ description: 'Phone number of the user' })
  @IsOptional()
  @IsString({ message: 'Nomor telepon harus berupa teks' })
  phone?: string;

  @ApiPropertyOptional({ description: 'Address of the user' })
  @IsOptional()
  @IsString({ message: 'Alamat harus berupa teks' })
  address?: string;
}
