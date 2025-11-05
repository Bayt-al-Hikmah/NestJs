import { Injectable } from '@nestjs/common';
import { MultipartFile } from '@fastify/multipart';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

export interface ImageMetadata {
  id: string;
  originalFilename: string;
  mediaPath: string;
}

const images: ImageMetadata[] = [];

@Injectable()
export class ImageShareService {
  async saveImage(file: MultipartFile): Promise<ImageMetadata> {
    
    const fileExtension = file.filename.split('.').pop();
    const uniqueId = randomUUID();
    const newFilename = `${uniqueId}.${fileExtension}`;
    const filePath = join(process.cwd(), 'uploads', newFilename);

    await new Promise<void>((resolve, reject) => {
      const writeStream = createWriteStream(filePath);
      file.file.pipe(writeStream)
        .on('finish', resolve)
        .on('error', reject);
    });
    
    const uploadedFile: ImageMetadata = {
      id: uniqueId,
      originalFilename: file.filename,
      mediaPath: `/media/${newFilename}`, 
    };
    
    images.push(uploadedFile); 
    
    return uploadedFile;
  }

  getAllImages(): ImageMetadata[] {
    return images;
  }
}