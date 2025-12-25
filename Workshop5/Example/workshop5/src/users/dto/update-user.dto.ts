import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsString, IsNotEmpty, MaxLength,IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  email: string;
  
  @IsOptional()
  avatar?: string;
}

export class UpdatePasswordDto extends PartialType(CreateUserDto) {

  @IsString()
  @IsNotEmpty()
  password: string;
}