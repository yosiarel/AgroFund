import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateItemDto {
  @ApiProperty()
  @IsString({ message: 'Nama barang harus berupa teks' })
  @IsNotEmpty({ message: 'Nama barang tidak boleh kosong' })
  name: string;

  @ApiPropertyOptional()
  @IsString({ message: 'Deskripsi harus berupa teks' })
  @IsOptional()
  description?: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber({}, { message: 'Harga harus berupa angka yang valid' })
  @Min(0, { message: 'Harga tidak boleh kurang dari 0' })
  price: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber({}, { message: 'Stok harus berupa angka yang valid' })
  @Min(0, { message: 'Stok tidak boleh kurang dari 0' })
  stock: number;

  @ApiPropertyOptional()
  @IsString({ message: 'URL Gambar harus berupa teks' })
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsString({ message: 'Kategori harus berupa teks' })
  @IsOptional()
  category?: string;
}
