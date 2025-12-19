import { IsString, IsEmail, MinLength, MaxLength } from 'class-validator';

export class CreateFeedbackDto {

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(10)
  message: string;

  @IsString()
  _csrf: string;
}