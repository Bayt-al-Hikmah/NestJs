import { Controller,Get,Render } from '@nestjs/common';

@Controller('items')
export class ItemsController {

  @Get()
  @Render('items') 
  index() {
    const context = {
      fruits: ['Apple', 'Banana', 'Cherry', 'Mango', 'Orange']
    };
    return context;
  }
}
