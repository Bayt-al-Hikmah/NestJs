import { Injectable ,BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { MultipartFile, Multipart } from '@fastify/multipart';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImageShare } from './entities/image-share.entity'
import { CreateImageShareDto } from './dto/create-image-share.dto'

@Injectable()
export class ImageShareService {
   constructor(
    @InjectRepository(ImageShare)
    private imagesRepository: Repository<ImageShare>
  ) {
  }
  
  async findAll(): Promise<ImageShare[]> {
    return  this.imagesRepository.find();
  }
  async createImage(createImageDto: CreateImageShareDto){
    const newImage = this.imagesRepository.create(
      createImageDto
    );
    if (!newImage){
      throw new InternalServerErrorException('Couldn\'t save the Image');
    }
    this.imagesRepository.save(newImage)
  }
  async saveImage(file:MultipartFile){
    const  allowedTypes:string[] = ['image/jpeg', 'image/png'];
    if(!allowedTypes.includes(file.mimetype)){
      throw new BadRequestException('Not Allowed format.');
    }
    const fileExtension = file.filename.split('.').pop();
    const uniqueId = randomUUID();
    const name = `${uniqueId}.${fileExtension}`;
    const filePath = join(process.cwd(), 'uploads', name );
    await new Promise<void>((resolve, reject) => {
      const writeStream = createWriteStream( filePath  );
      file.file.pipe(writeStream)
        .on('finish', resolve)
        .on('error', reject);
    });

    const path = 'media/' + name 
    this.createImage({name,path} as CreateImageShareDto)
  }
  /*

  async handelForm(Form:AsyncIterableIterator<Multipart>){
    try {
      let uploadedCount = 0;
      for await (const part of Form) {
        if (part.type === 'file') {
          await this.saveImage(part);
          uploadedCount++;
          break;
        }
      }
      if (uploadedCount === 0) {
        throw new BadRequestException('No file part found in the request.');
      }
    } catch (error) {
      console.error('File upload error:', error);
      throw new InternalServerErrorException('File upload failed due to a server error.');
    }
  }*/
}