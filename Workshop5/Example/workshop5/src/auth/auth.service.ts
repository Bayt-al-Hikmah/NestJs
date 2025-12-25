import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateUserDto, LoginDto} from '../users/dto/create-user.dto';
import * as argon2 from 'argon2';
import { MultipartFile} from '@fastify/multipart';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) 
    private authRepository: Repository<User>
  ) {}

  async uploadAvatar(file: MultipartFile): Promise<string> {
    const fileExtension = file.filename.split('.').pop();
    const uniqueId = randomUUID();
    const newFilename = `${uniqueId}.${fileExtension}`;
    const filePath = join(process.cwd(), 'public/avatars', newFilename);

    await new Promise<void>((resolve, reject) => {
      const writeStream = createWriteStream(filePath);
      file.file.pipe(writeStream)
        .on('finish', resolve)
        .on('error', reject);
    });
    return newFilename;
  }
  
  async register(CreateUserDto: CreateUserDto): Promise<User> {
    CreateUserDto.password = await argon2.hash(CreateUserDto.password);
    const newUser = this.authRepository.create(CreateUserDto);
    return this.authRepository.save(newUser);
  }
  
  async login(LoginDto: LoginDto): Promise<User|null> {
    const user = await this.authRepository.findOne({ where: { email: LoginDto.email} });
    if (user && await argon2.verify(user.password, LoginDto.password)) {
      return user;
    }
    return null;
  }
}
