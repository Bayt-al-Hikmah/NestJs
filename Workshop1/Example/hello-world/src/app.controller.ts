import { Controller, Get, Param, Query, DefaultValuePipe } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get() 
  getHello(): string {
    return this.appService.getHello();
  }

  @Get(':name') 
  personalGreeting(
    @Param('name') name: string,
    @Query('greet', new DefaultValuePipe('Hello')) greeting: string,
  ): string {
    return `${greeting}, ${name}!`;
  }
}