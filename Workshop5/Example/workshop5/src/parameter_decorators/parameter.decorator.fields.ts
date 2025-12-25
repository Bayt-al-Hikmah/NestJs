import { createParamDecorator, ExecutionContext} from '@nestjs/common';
import { CreateUserDto} from '../users/dto/create-user.dto';
import { UpdateUserDto} from '../users/dto/update-user.dto';
export const Fields= createParamDecorator(

  async (data: unknown, ctx: ExecutionContext):Promise<CreateUserDto|UpdateUserDto> => {

    const request = ctx.switchToHttp().getRequest(); 
    const parts = request.parts();
    let avatar = '';
      let typeDto: CreateUserDto|UpdateUserDto = {} as CreateUserDto|UpdateUserDto;
      for await (const part of parts) {
          if (part.type !== 'file') {
            typeDto[part.fieldname] = part.value;
          }else{
            break;
          }
        }
        return typeDto;
    } 
)