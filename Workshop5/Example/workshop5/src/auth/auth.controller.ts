import { Controller, Post, Body, Req,Res,UseGuards} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto,LoginDto } from '../users/dto/create-user.dto';
import type { FastifyRequest,FastifyReply } from 'fastify';
import { File } from 'src/parameter_decorators/parameter.decorator.file'
import { Fields } from 'src/parameter_decorators/parameter.decorator.fields'
import type { MultipartFile} from '@fastify/multipart';
import { JwtService } from '@nestjs/jwt';
@Controller('api')

export class AuthController {
  constructor(private readonly authService: AuthService,
    private jwtService: JwtService
  ) {}

  @Post('register')
  async register(@File() file:MultipartFile,@Fields() fields:CreateUserDto,@Res() res:FastifyReply) {
    const filename:string = await this.authService.uploadAvatar(file);
    fields.avatar = filename
    await this.authService.register(fields);
    return res.status(201).send({ message: 'Registred' });
  }
  
  @Post('login')
  async create(@Body() loginDto: LoginDto, @Req() req: FastifyRequest,@Res() res:FastifyReply) { 
    const user = await this.authService.login(loginDto);
    if(!user){
    return res.status(401).send({ message: 'Invalid credentials' });
    }
    const payload = {
      userId:user.id,
      email:user.email
    }
    return res.status(201).send({ message: 'logged in' ,access_token:this.jwtService.sign(payload)});
  }
  
}
