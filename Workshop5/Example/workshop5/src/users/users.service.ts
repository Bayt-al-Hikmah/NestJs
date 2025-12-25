import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository,UpdateResult } from 'typeorm';
import { AuthService} from '../auth/auth.service';
import { UpdateUserDto,UpdatePasswordDto } from './dto/update-user.dto';
import { User } from '../users/entities/user.entity';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
   constructor(
      @InjectRepository(User) 
      private userRepository: Repository<User>,
    ) {}

  async findOne(id: number): Promise<User|null>{
    return this.userRepository.findOne({ where: { id } });
  }
 
  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<UpdateResult> {
    return this.userRepository.update(id, updateUserDto);
  }

  async updatePassword(id: number, updatePasswordDto: UpdatePasswordDto): Promise<UpdateResult> {
    updatePasswordDto.password = await argon2.hash(updatePasswordDto.password || '');
    return this.userRepository.update(id, updatePasswordDto);
  }
}
