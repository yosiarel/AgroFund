import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateResiDto {
  @IsString({ message: 'Nomor resi harus berupa teks' })
  @IsNotEmpty({ message: 'Nomor resi tidak boleh kosong' })
  trackingResi: string;
}
