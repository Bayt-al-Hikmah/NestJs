import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppService } from './app.service';
import { App1Module } from './app1/app1.module';
import { App2Module } from './app2/app2.module';
import { App3Module } from './app3/app3.module';
import { FeedbackModule } from './feedback/feedback.module';

@Module({

  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    App1Module, 
    App2Module, 
    App3Module, FeedbackModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
