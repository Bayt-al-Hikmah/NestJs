import { Controller, Post, Body, UseGuards, Get, Render, Req,Res} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/create-auth.dto';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { Guest } from "./guard/auth.guard"
import type {Session } from '@fastify/secure-session'

@Controller('todo')
@UseGuards(Guest)
export class AuthController {
  constructor(private readonly authService: AuthService,
    
  ) {}

  @Get('register')
  @Render('auth/register')
  registerPage() {
    return {};
  }

  @Post('register')
  async register(@Body() registerDto: AuthDto,@Res() res:FastifyReply ) {
    const user = await this.authService.register(registerDto);
    if(user){
      return await res.status(301).redirect("/todo/login")
    }
    return res.status(301).redirect("/todo/register")
  }

  @Get('login')
  @Render('auth/login')
  loginPage() {
    return {};
  }
  

  @Post('login')
  async login(@Body() login :AuthDto, @Req() req:FastifyRequest,@Res() res:FastifyReply) {
    const user = await this.authService.login(login);
    if(user){
       await (req.session as any).set("userId",String(user.id) )
       res.status(301).redirect("/")
    }
     res.status(301).redirect("/todo/login")
  }
}