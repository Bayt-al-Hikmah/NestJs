import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { FastifyReply, FastifyRequest } from 'fastify';

@Injectable()
export class FastifyCsrfGuard implements CanActivate {
  constructor(private readonly adapterHost: HttpAdapterHost) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest<FastifyRequest>();
    const res = httpContext.getResponse<FastifyReply>();

    const fastifyInstance = this.adapterHost.httpAdapter.getInstance();
    const csrfProtection = (fastifyInstance as any).csrfProtection;

    if (!csrfProtection) {
        throw new ForbiddenException('CSRF protection is not initialized.');
    }
    return new Promise((resolve, reject) => {
      csrfProtection(req, res, (err) => {
        if (err) {
          return reject(err); 
        }
        resolve(true); 
      });
    });
  }
}