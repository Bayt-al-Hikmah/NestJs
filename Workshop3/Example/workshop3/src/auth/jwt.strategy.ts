import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors(
        [
        (req) => req?.cookies?.token,   
      ]
      ), 
      ignoreExpiration: false,
      secretOrKey: 'YOUR_VERY_SECRET_KEY_HERE', 
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}