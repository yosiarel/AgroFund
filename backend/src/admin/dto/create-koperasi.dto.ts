import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsEmail,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKoperasiDto {
  @ApiProperty()
  @IsString({ message: 'Username harus berupa teks' })
  @IsNotEmpty({ message: 'Username tidak boleh kosong' })
  username: string;

  @ApiProperty()
  @IsString({ message: 'Password harus berupa teks' })
  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password: string;

  @ApiProperty()
  @IsString({ message: 'Nama koperasi harus berupa teks' })
  @IsNotEmpty({ message: 'Nama koperasi tidak boleh kosong' })
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Email tidak valid' })
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'Nomor telepon harus berupa teks' })
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'Alamat harus berupa teks' })
  address?: string;
}
