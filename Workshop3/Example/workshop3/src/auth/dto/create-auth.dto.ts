
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class AuthDto  {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;


}


