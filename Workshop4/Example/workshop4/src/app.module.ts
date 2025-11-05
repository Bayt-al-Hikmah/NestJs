import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ImageShareModule } from './image-share/image-share.module';

@Module({
  imports: [ImageShareModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
