import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { User } from './entities/auth.entity';
import { AuthDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
   constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

  ) {}

  async register(registerDto: AuthDto): Promise<User> {
    const hashedPassword = await argon2.hash(registerDto.password);
    const newUser = this.usersRepository.create({
      username: registerDto.username,
      password: hashedPassword,
    });
    return this.usersRepository.save(newUser);
  }

  async login(loginDto: AuthDto): Promise<User|null>  {
    const user = await this.usersRepository.findOne({ where: { username:loginDto.username} });
    if (user && await argon2.verify(user.password, loginDto.password)) {
      
      return user;
    }
    return null;
  }
}