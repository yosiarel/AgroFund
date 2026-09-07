import {
  IsString,
  IsNotEmpty,
  IsEnum,
  MinLength,
  IsOptional,
  IsIn,
} from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty()
  @IsString({ message: 'Username harus berupa teks' })
  @IsNotEmpty({ message: 'Username tidak boleh kosong' })
  username: string;

  @ApiProperty()
  @IsString({ message: 'Password harus berupa teks' })
  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password: string;

  @ApiProperty({ enum: ['PENDANA', 'UMKM'] })
  @IsEnum(Role, { message: 'Role tidak valid' })
  @IsIn(['PENDANA', 'UMKM'], {
    message: 'Pendaftaran publik hanya bisa sebagai PENDANA atau UMKM',
  })
  role: Role;

  @ApiProperty()
  @IsString({ message: 'Nama harus berupa teks' })
  @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'Nomor telepon harus berupa teks' })
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'Alamat harus berupa teks' })
  address?: string;
}
