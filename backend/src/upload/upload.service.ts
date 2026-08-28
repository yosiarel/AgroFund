import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('Tidak ada file yang diunggah');
    }

    return new Promise((resolve, reject) => {
      // Ensure config is always present
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'akarmakmur' },
        (error, result) => {
          if (error) {
            console.error('Cloudinary Upload Error:', error);
            return reject(new BadRequestException('Gagal mengunggah: ' + error.message));
          }
          if (!result) return reject(new BadRequestException('Gagal mengunggah: Tidak ada hasil dari server'));
          resolve(result.secure_url);
        }
      );
      
      uploadStream.end(file.buffer);
    });
  }
}
