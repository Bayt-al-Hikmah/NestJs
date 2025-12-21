import {Render,Redirect, Controller, Post, Get, Req,BadRequestException} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { ImageShareService} from './image-share.service';
import { ImageShare } from './entities/image-share.entity'
import {MultipartFile} from '@fastify/multipart'
import {File} from 'src/parameter_decorators/parameter.decorator.form'
@Controller('images')
export class ImageShareController {
  constructor(private readonly imageShareService: ImageShareService) {}

  @Get()
  @Render('upload')
  async getUploadForm() {
    const images: ImageShare[] = await this.imageShareService.findAll();
    return { images };
  }

  @Post('upload')
  @Redirect('/images')
  async uploadImage(@File() file:MultipartFile|null) {
    /*if (!req.isMultipart()) {
      throw new BadRequestException('Request must be multipart/form-data.');
    }
    const parts = req.parts();*/
    return this.imageShareService.saveImage(file as MultipartFile)
  }
}