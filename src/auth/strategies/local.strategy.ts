import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    try {
      // Gọi service để xác thực user
      const user = await this.authService.validateLocalUser({ email, password });
      
      if (!user) {
        throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Xác thực thất bại');
    }
  }
}
