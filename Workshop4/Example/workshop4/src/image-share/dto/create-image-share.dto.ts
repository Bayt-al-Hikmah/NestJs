
import { IsString, IsNotEmpty} from 'class-validator';

export class CreateImageShareDto  {
  @IsString()
  @IsNotEmpty()
  name: string;
  
  @IsString()
  @IsNotEmpty()
  path: string;
  
}
