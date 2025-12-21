import { createParamDecorator, ExecutionContext,BadRequestException,InternalServerErrorException } from '@nestjs/common';
import {MultipartFile} from '@fastify/multipart'
export const File = createParamDecorator(

  async (data: unknown, ctx: ExecutionContext):Promise<MultipartFile|null> => {

    const request = ctx.switchToHttp().getRequest(); 
    if (!request.isMultipart()) {
      throw new BadRequestException('Request must be multipart/form-data.');
    }
    const parts = request.parts();
    try {
      let uploadedCount = 0;
      for await (const part of parts) {
        if (part.type === 'file') {
          return part;
          
        }
      }
      if (uploadedCount === 0) {
        throw new BadRequestException('No file part found in the request.');
        
      }
    } catch (error) {
      console.error('File upload error:', error);
      throw new InternalServerErrorException('File upload failed due to a server error.');
    }
    return null;
}   
)