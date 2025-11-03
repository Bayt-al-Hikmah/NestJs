import { Controller, Get, Render } from '@nestjs/common';

@Controller('app3')
export class App3Controller {

  @Get()
  @Render('app3/index') // Renders 'views/app3/index.hbs'
  index() {
    const context = {
      fruits: ['Apple', 'Banana', 'Cherry', 'Mango', 'Orange']
      // fruits: [] // Try this to test the 'else' block
    };
    return context;
  }
}