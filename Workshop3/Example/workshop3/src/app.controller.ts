import { Controller, Get,Res,Req } from '@nestjs/common';
import { AppService } from './app.service';
import type{ FastifyReply,FastifyRequest } from 'fastify';


@Controller('/')
export class AppController {
  constructor(private readonly appService: AppService) {}

  
  @Get()
  index(@Res() res:FastifyReply){
    res.status(301).redirect("/todo")
  }
  @Get('logout')
    logout(@Req() req:FastifyRequest,@Res() res:FastifyReply) {
      req.session.delete()
      res.status(301).redirect("/login")
  }
  
  
}
