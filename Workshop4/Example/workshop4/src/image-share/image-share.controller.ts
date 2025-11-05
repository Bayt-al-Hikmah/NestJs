import {Render,Redirect, Controller, Post, Get, Req, Res, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { ImageShareService, ImageMetadata } from './image-share.service'; // Import the Service

@Controller('images')
export class ImageShareController {
  constructor(private readonly imageShareService: ImageShareService) {}

  @Get()
  @Render('upload')
  async getUploadForm(@Res({passthrough:true}) res: FastifyReply) {
    const images: ImageMetadata[] = this.imageShareService.getAllImages();
    return { images };
  }

  @Post('upload')
  @Redirect('/images')
  async uploadImage(@Req() req: FastifyRequest, @Res({passthrough:true}) res: FastifyReply) {
    
    if (!req.isMultipart()) {
      throw new BadRequestException('Request must be multipart/form-data.');
      
    }

    try {
      const parts = req.parts();
      let uploadedCount = 0;
      
      for await (const part of parts) {
        if (part.type === 'file') {
          await this.imageShareService.saveImage(part);
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
  }
}