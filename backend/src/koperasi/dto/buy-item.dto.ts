import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BuyItemDto {
  @ApiProperty({ description: 'Quantity to buy' })
  @IsInt({ message: 'Kuantitas harus berupa angka bulat' })
  @Min(1, { message: 'Kuantitas minimal 1' })
  quantity: number;
}
