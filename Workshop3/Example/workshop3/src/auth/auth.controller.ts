import { Controller, Post, Body, UseGuards, Request, Redirect,Get, Render, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/create-auth.dto';
import type { FastifyReply } from 'fastify';
import { User } from './entities/auth.entity';
import {GuestGuard} from "./guard/guest.guard"

@Controller('auth')
@UseGuards(GuestGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('register')
  @Render('auth/register')
  registerPage() {
    return {};
  }

  @Post('register')
  @Redirect("/auth/login")
  async register(@Body() registerDto: AuthDto, @Res({ passthrough: true }) res: FastifyReply) {
    await this.authService.register(registerDto);
    
  }

  @Get('login')
  @Render('auth/login')
  loginPage(@Request() req) {
    return {}; 
 
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @Redirect("/todo")
  async login(@Request() req, @Res({ passthrough: true }) res: FastifyReply) {
    const token = await this.authService.login(req.user);
      res.setCookie('token', token.access_token, {
      httpOnly: true,    
      path: '/',          
      sameSite: 'lax',    
    });

  }
}