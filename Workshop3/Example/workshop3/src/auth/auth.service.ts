import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import { User } from './entities/auth.entity';
import { AuthDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: AuthDto): Promise<User> {
    const hashedPassword = await argon2.hash(registerDto.password);

    const newUser = this.usersRepository.create({
      username: registerDto.username,
      password: hashedPassword,
    });

    return this.usersRepository.save(newUser);
  }

  async validateUser(username: string, pass: string) {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (user && await argon2.verify(user.password, pass)) {
      const { password, ...safeUser } = user;
      return safeUser;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return { access_token: this.jwtService.sign(payload) };
  }
}