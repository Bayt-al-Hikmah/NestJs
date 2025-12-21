import { Controller, Get,Render,Res,Req } from '@nestjs/common';
import { AppService } from './app.service';
import type{ FastifyReply} from 'fastify';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  index(@Res() res:FastifyReply){
    res.status(301).redirect("/images")
  }
}
