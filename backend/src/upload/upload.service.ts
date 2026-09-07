import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

export interface UploadResult {
  fileUrl: string;
  publicId: string;
}

@Injectable()
export class UploadService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    isPrivate: boolean = true,
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('Tidak ada file yang diunggah');
    }

    return new Promise((resolve, reject) => {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'akarmakmur',
          type: isPrivate ? 'authenticated' : 'upload',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary Upload Error:', error);
            return reject(
              new BadRequestException('Gagal mengunggah: ' + error.message),
            );
          }
          if (!result)
            return reject(
              new BadRequestException(
                'Gagal mengunggah: Tidak ada hasil dari server',
              ),
            );
          resolve({
            fileUrl: result.secure_url,
            publicId: result.public_id,
          });
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  generateSignedUrl(publicId: string, expiresInSeconds: number = 3600): string {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;

    return cloudinary.url(publicId, {
      type: 'authenticated',
      sign_url: true,
      expires_at: expiresAt,
      secure: true,
    });
  }
}
