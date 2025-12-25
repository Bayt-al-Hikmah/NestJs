import { Controller, Get, Put, Body, Patch, UseGuards,Res,Req} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto,UpdatePasswordDto } from './dto/update-user.dto';
import type { FastifyRequest, FastifyReply } from 'fastify';
import {AuthService } from 'src/auth/auth.service';
import { File } from 'src/parameter_decorators/parameter.decorator.file'
import { Fields } from 'src/parameter_decorators/parameter.decorator.fields'
import {Authorized} from 'src/guard/authorization.guard'


@Controller('api')
@UseGuards(Authorized)
export class UsersController {
  constructor(private readonly usersService: UsersService,
    private readonly authService: AuthService ) {}

  
  @Get('user')
  async findOne(@Req() req: FastifyRequest, @Res() reply: FastifyReply) {
    const userSession = parseInt(req.session.get("userId"));
    const user = await this.usersService.findOne(userSession);
    if(!user){
        return reply.status(404).send({ message: 'User not found' });
    }
    return reply.status(201).send(
            {id: user.id,username: user.username,email: user.email,avatar: 'static/avatars/' + user.avatar,});
  }

  @Put('user')
  async updateUser(@File() file,@Fields() fields:UpdateUserDto,@Req() req: FastifyRequest, @Res() reply: FastifyReply) {
    const userSession = parseInt(req.session.get("userId"));
    if(file !== null){
      fields.avatar = await this.authService.uploadAvatar(file);
    }
    await  this.usersService.updateUser(userSession,fields);
    return reply.status(201).send({ message: 'User profile updated successfully' });
  }

  @Patch('user/password')
  async updatePassword(@Body() updatePasswordDto: UpdatePasswordDto,@Req() req: FastifyRequest, @Res() reply: FastifyReply) {
    const userSession = parseInt(req.session.get("id"));
    await this.usersService.updatePassword(userSession, updatePasswordDto);
    return reply.status(201).send({ message: 'Password updated successfully' });
  }
}
