import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController], // Add controllers here
  providers: [AppService],    // Add services here
})
export class AppModule {}