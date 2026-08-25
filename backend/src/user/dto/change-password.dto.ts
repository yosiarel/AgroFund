import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password' })
  @IsNotEmpty({ message: 'Password lama tidak boleh kosong' })
  @IsString({ message: 'Password lama harus berupa teks' })
  oldPassword!: string;

  @ApiProperty({ description: 'New password' })
  @IsNotEmpty({ message: 'Password baru tidak boleh kosong' })
  @IsString({ message: 'Password baru harus berupa teks' })
  @MinLength(6, { message: 'Password baru minimal 6 karakter' })
  newPassword!: string;
}
