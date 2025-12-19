import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ItemsModule } from './items/items.module';
import { FeedbackModule } from './feedback/feedback.module';

@Module({

  imports: [ ItemsModule, FeedbackModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
