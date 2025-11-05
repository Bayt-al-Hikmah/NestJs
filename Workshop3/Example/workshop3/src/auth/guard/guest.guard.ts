import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FastifyReply } from 'fastify';

@Injectable()
export class GuestGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse<FastifyReply>();
    const token = req.cookies?.token;

    if (!token) return true;

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'YOUR_VERY_SECRET_KEY_HERE',
      });

      if (payload) {
        res.redirect('/todo');
        return false;
      }

      return true;
    } catch (err) {
      res.clearCookie('token');
      return true;
    }
  }
}