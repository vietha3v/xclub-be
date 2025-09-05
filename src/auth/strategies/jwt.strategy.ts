import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // Kiểm tra payload có hợp lệ không
    if (!payload.userId || !payload.email) {
      throw new UnauthorizedException('Token không hợp lệ');
    }

    // Trả về thông tin user để sử dụng trong request
    return {
      userId: payload.userId,
      email: payload.email,
      provider: payload.provider,
      roles: payload.roles || [],
    };
  }
}
