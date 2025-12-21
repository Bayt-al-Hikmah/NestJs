import { ExceptionFilter, Catch, ArgumentsHost, NotFoundException } from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Catch(NotFoundException ) // Catches all types of exceptions
export class NotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    (response.status(404)as any).view("noFound");
  }
}