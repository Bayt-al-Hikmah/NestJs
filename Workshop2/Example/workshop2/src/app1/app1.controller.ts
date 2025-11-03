import { Controller, Get, Render } from '@nestjs/common';

@Controller('app1')
export class App1Controller {
  
  @Get()
  @Render('index')
  index() {
    return {
      username: 'Alice',
      age: 25
    };
  }
}