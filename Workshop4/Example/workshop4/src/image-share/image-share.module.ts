import { Module } from '@nestjs/common';
import { ImageShareController } from './image-share.controller';
import { ImageShareService } from './image-share.service';

@Module({
  controllers: [ImageShareController],
  providers: [ImageShareService]
})
export class ImageShareModule {}
