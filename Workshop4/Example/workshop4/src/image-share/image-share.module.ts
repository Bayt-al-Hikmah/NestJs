import { Module } from '@nestjs/common';
import { ImageShareService } from './image-share.service';
import { ImageShareController } from './image-share.controller';
import {ImageShare} from './entities/image-share.entity'
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports:[TypeOrmModule.forFeature([ImageShare])],
  controllers: [ImageShareController],
  providers: [ImageShareService],
})
export class ImageShareModule {}
