import { Controller, Post, Body, UseGuards, Req, Get, Res, HttpCode, HttpStatus, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Public } from './decorators/public.decorator';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthLocalDto } from './dto/auth-local.dto';


@ApiTags('🔐 Xác thực & Đăng nhập')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Đăng ký tài khoản mới
   * @param registerDto - DTO chứa thông tin đăng ký
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiResponse({ 
    status: 201, 
    description: 'Đăng ký thành công',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string', description: 'JWT access token' },
        refresh_token: { type: 'string', description: 'JWT refresh token' },
        user: { type: 'object', description: 'Thông tin user' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 409, description: 'Email đã được sử dụng' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * Đăng nhập bằng email/password
   * @param loginDto - DTO chứa email và password
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập bằng email/password' })
  @ApiResponse({ 
    status: 200, 
    description: 'Đăng nhập thành công',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string', description: 'JWT access token' },
        refresh_token: { type: 'string', description: 'JWT refresh token' },
        user: { type: 'object', description: 'Thông tin user' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Email hoặc mật khẩu không đúng' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Làm mới access token
   * @param refreshTokenDto - DTO chứa refresh token
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Làm mới access token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Làm mới token thành công',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string', description: 'JWT access token mới' },
        refresh_token: { type: 'string', description: 'JWT refresh token mới' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Refresh token không hợp lệ' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  /**
   * Quên mật khẩu
   * @param forgotPasswordDto - DTO chứa email
   */
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gửi email đặt lại mật khẩu' })
  @ApiResponse({ 
    status: 200, 
    description: 'Email đã được gửi (nếu tồn tại)',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Thông báo' }
      }
    }
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  /**
   * Đặt lại mật khẩu
   * @param resetPasswordDto - DTO chứa token và mật khẩu mới
   */
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đặt lại mật khẩu bằng token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Đặt lại mật khẩu thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Thông báo' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Token không hợp lệ' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  /**
   * Đăng nhập bằng email/password (NextAuth)
   * @param authLocalDto - DTO chứa email và password
   */
  @Public()
  @Post('local/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập bằng email/password (NextAuth)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Đăng nhập thành công',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string', description: 'JWT access token' },
        user: { type: 'object', description: 'Thông tin user' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Email hoặc mật khẩu không đúng' })
  async localLogin(@Body() authLocalDto: AuthLocalDto) {
    return this.authService.validateLocalUser(authLocalDto);
  }

  /**
   * Callback cho Google OAuth
   * @param req - Request object
   * @param res - Response object
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req, @Res() res) {
    try {
      const result = await this.authService.validateSocialUser(
        req.user,
        'google',
      );
      
      // Redirect về frontend với token
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${result.access_token}`;
      res.redirect(redirectUrl);
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
    }
  }

  /**
   * Callback cho Facebook OAuth
   * @param req - Request object
   * @param res - Response object
   */
  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookCallback(@Req() req, @Res() res) {
    try {
      const result = await this.authService.validateSocialUser(
        req.user,
        'facebook',
      );
      
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${result.access_token}`;
      res.redirect(redirectUrl);
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
    }
  }

  /**
   * Callback cho Github OAuth
   * @param req - Request object
   * @param res - Response object
   */
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req, @Res() res) {
    try {
      const result = await this.authService.validateSocialUser(
        req.user,
        'github',
      );
      
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${result.access_token}`;
      res.redirect(redirectUrl);
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
    }
  }

  /**
   * Callback cho Twitter OAuth
   * @param req - Request object
   * @param res - Response object
   */
  @Get('twitter/callback')
  @UseGuards(AuthGuard('twitter'))
  async twitterCallback(@Req() req, @Res() res) {
    try {
      const result = await this.authService.validateSocialUser(
        req.user,
        'twitter',
      );
      
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${result.access_token}`;
      res.redirect(redirectUrl);
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
    }
  }

  /**
   * Lấy thông tin user hiện tại (cần JWT token)
   * @param req - Request object
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy thông tin user hiện tại' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thông tin user',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'ID của user' },
        email: { type: 'string', description: 'Email của user' },
        provider: { type: 'string', description: 'Provider xác thực' },
        roles: { type: 'array', items: { type: 'string' }, description: 'Danh sách vai trò' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async getProfile(@Req() req) {
    return {
      userId: req.user.userId,
      email: req.user.email,
      provider: req.user.provider,
      roles: req.user.roless,
    };
  }

  /**
   * NextAuth: Callback endpoint cho OAuth providers
   * @param req - Request object
   */
  @Public()
  @Post('oauth/callback')
  @ApiOperation({ summary: 'NextAuth OAuth callback' })
  @ApiResponse({ 
    status: 200, 
    description: 'OAuth callback thành công',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string', description: 'JWT access token' },
        refresh_token: { type: 'string', description: 'JWT refresh token' },
        user: { type: 'object', description: 'Thông tin user' }
      }
    }
  })
  async oauthCallback(@Body() oauthData: any) {
    console.log('OAuth callback result:66666666666666',oauthData);
    try {
      const { provider, profile } = oauthData;
      console.log('OAuth callback result:55555555555555',provider, profile);
      if (!provider || !profile) {
        throw new BadRequestException('Thiếu thông tin provider hoặc profile');
      }

      // Tìm hoặc tạo user từ OAuth
      const user = await this.authService.findOrCreateOAuthUser(profile, provider);
      
      // Tạo JWT token
      const payload = {
        userId: user.id,
        email: user.email,
        provider: provider,
        roles: user.roles || ['runner'],
      };

      return {
        access_token: this.authService['jwtService'].sign(payload),
        refresh_token: this.authService['jwtService'].sign(payload, { 
          expiresIn: '7d' 
        }),
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          provider: provider,
          roles: user.roles,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('OAuth callback thất bại');
    }
  }

  /**
   * NextAuth: Kiểm tra session
   * @param req - Request object
   */
  @Public()
  @Post('session')
  @ApiOperation({ summary: 'NextAuth session check' })
  @ApiResponse({ 
    status: 200, 
    description: 'Session hợp lệ',
    schema: {
      type: 'object',
      properties: {
        user: { type: 'object', description: 'Thông tin user' },
        expires: { type: 'string', description: 'Thời gian hết hạn' }
      }
    }
  })
  async checkSession(@Body() sessionData: any) {
    try {
      const { access_token } = sessionData;
      
      if (!access_token) {
        throw new BadRequestException('Thiếu access token');
      }

      // Verify JWT token
      const payload = this.authService['jwtService'].verify(access_token);
      
      // Tìm user
      const user = await this.authService['findUserById'](payload.userId);
      if (!user) {
        throw new UnauthorizedException('User không tồn tại');
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          roles: user.roles,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
      };
    } catch (error) {
      throw new UnauthorizedException('Session không hợp lệ');
    }
  }

  /**
   * NextAuth: Đăng xuất
   * @param req - Request object
   */
  @Post('signout')
  @ApiOperation({ summary: 'NextAuth sign out' })
  @ApiResponse({ 
    status: 200, 
    description: 'Đăng xuất thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Thông báo' }
      }
    }
  })
  async signOut(@Body() signOutData: any) {
    try {
      // TODO: Implement blacklist token hoặc revoke refresh token
      // Hiện tại chỉ trả về success message
      
      return {
        message: 'Đăng xuất thành công'
      };
    } catch (error) {
      throw new BadRequestException('Đăng xuất thất bại');
    }
  }
}
