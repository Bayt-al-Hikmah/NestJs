import { Controller, Get, Param, Render } from '@nestjs/common';

@Controller('app2')
export class App2Controller {

  @Get(':role') 
  @Render('app2/index')
  index(@Param('role') role: string) {
    const context = {
      isAdmin: role === 'admin',
      isEditor: role === 'editor',
      isViewer: role === 'viewer',
    };
    return context;
  }
}