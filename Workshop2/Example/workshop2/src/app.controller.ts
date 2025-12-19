import { Controller, Get, Render,Param } from '@nestjs/common';

@Controller() 
export class AppController {

  @Get()
    @Render('index')
    index() {
      return {
      username: 'Alice',
      age: 25
    };
    }
    
    @Get('dashboard/:role') 
    @Render('dashboard')
    dashboard(@Param('role') role: string) {
    const context = {
      isAdmin: role === 'admin',
      isEditor: role === 'editor',
      isViewer: role === 'viewer',
    };
    return context;
  }
}