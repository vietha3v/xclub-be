import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { AuthLocalDto } from './dto/auth-local.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User, UserExperience, UserStatus } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  /**
   * Đăng ký tài khoản mới
   * @param registerDto - DTO chứa thông tin đăng ký
   */
  async register(registerDto: RegisterDto): Promise<any> {
    try {
      // Kiểm tra mật khẩu xác nhận
      if (registerDto.password !== registerDto.confirmPassword) {
        throw new BadRequestException('Mật khẩu xác nhận không khớp');
      }

      // Kiểm tra username đã tồn tại chưa
      const existingUserByUsername = await this.findUserByUsername(registerDto.username);
      if (existingUserByUsername) {
        throw new ConflictException('Username đã được sử dụng');
      }

      // Kiểm tra email đã tồn tại chưa
      const existingUserByEmail = await this.findUserByEmail(registerDto.email);
      if (existingUserByEmail) {
        throw new ConflictException('Email đã được sử dụng');
      }

      // Hash mật khẩu - bcrypt hỗ trợ tối đa 10 rounds
      const saltRounds = Math.min(parseInt(process.env.BCRYPT_ROUNDS || '10', 10), 10);
      const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

      // Tạo user mới
      const newUser = await this.createUser({
        username: registerDto.username,
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phoneNumber: registerDto.phoneNumber,
        referralCode: registerDto.referralCode,
      });

      // Tạo JWT token
      const payload = {
        userId: newUser.id,
        email: newUser.email,
        provider: 'local',
        roles: newUser.roles || ['runner'],
      };

      return {
        access_token: this.jwtService.sign(payload),
        refresh_token: this.jwtService.sign(payload, {
          expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d')
        }),
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          roles: newUser.roles,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Đăng nhập
   * @param loginDto - DTO chứa email và password
   */
  async login(loginDto: LoginDto): Promise<any> {
    try {
      // Tìm user theo email hoặc username
      let user = await this.findUserByEmail(loginDto.emailOrUsername);
      
      if (!user) {
        // Nếu không tìm thấy theo email, thử tìm theo username
        user = await this.findUserByUsername(loginDto.emailOrUsername);
      }

      if (!user) {
        throw new UnauthorizedException('Email/Username hoặc mật khẩu không đúng');
      }

      // Kiểm tra password
      const isPasswordValid = await this.validatePassword(
        loginDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
      }

      // Cập nhật thời gian đăng nhập cuối
      await this.updateLastLogin(user.id);

      // Tạo JWT token
      const payload = {
        userId: user.id,
        email: user.email,
        provider: 'local',
        roles: user.roles || ['runner'],
      };

      return {
        access_token: this.jwtService.sign(payload),
        refresh_token: this.jwtService.sign(payload, {
          expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d')
        }),
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Làm mới access token
   * @param refreshTokenDto - DTO chứa refresh token
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<any> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken);

      // Tìm user
      const user = await this.findUserById(payload.userId);
      if (!user) {
        throw new UnauthorizedException('User không tồn tại');
      }

      // Tạo access token mới
      const newPayload = {
        userId: user.id,
        email: user.email,
        provider: 'local',
        roles: user.roles || ['runner'],
      };

      return {
        access_token: this.jwtService.sign(newPayload),
        refresh_token: this.jwtService.sign(newPayload, {
          expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d')
        }),
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
  }

  /**
   * Quên mật khẩu
   * @param forgotPasswordDto - DTO chứa email
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<any> {
    try {
      // Tìm user theo email
      const user = await this.findUserByEmail(forgotPasswordDto.email);
      if (!user) {
        // Không trả về lỗi để tránh lộ thông tin
        return { message: 'Nếu email tồn tại, chúng tôi sẽ gửi link đặt lại mật khẩu' };
      }

      // Tạo reset token
      const resetToken = this.jwtService.sign(
        { userId: user.id, email: user.email },
        { expiresIn: '1h' }
      );

      // TODO: Gửi email với reset token
      // await this.sendResetPasswordEmail(user.email, resetToken);

      return { message: 'Nếu email tồn tại, chúng tôi sẽ gửi link đặt lại mật khẩu' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Đặt lại mật khẩu
   * @param resetPasswordDto - DTO chứa token và mật khẩu mới
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<any> {
    try {
      // Kiểm tra mật khẩu xác nhận
      if (resetPasswordDto.newPassword !== resetPasswordDto.confirmPassword) {
        throw new BadRequestException('Mật khẩu xác nhận không khớp');
      }

      // Verify reset token
      const payload = this.jwtService.verify(resetPasswordDto.token);

      // Tìm user
      const user = await this.findUserById(payload.userId);
      if (!user) {
        throw new UnauthorizedException('Token không hợp lệ');
      }

      // Hash mật khẩu mới - bcryptjs chỉ hỗ trợ tối đa 10 rounds
      const saltRounds = Math.min(parseInt(process.env.BCRYPT_ROUNDS || '10', 10), 10);
      const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, saltRounds);

      // Cập nhật mật khẩu
      await this.updateUserPassword(user.id, hashedPassword);

      return { message: 'Mật khẩu đã được đặt lại thành công' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xác thực user qua mạng xã hội (NextAuth)
   * @param profile - Thông tin profile từ mạng xã hội
   * @param provider - Tên provider (google, facebook, github, twitter)
   */
  async validateSocialUser(profile: any, provider: string): Promise<any> {
    try {
      // Tìm hoặc tạo user dựa trên profile
      let user = await this.findOrCreateOAuthUser(profile, provider);

      // Tạo JWT token
      const payload = {
        userId: user.id,
        email: user.email,
        provider: provider,
        roles: user.roles || ['runner'],
      };

      return {
        access_token: this.jwtService.sign(payload),
        refresh_token: this.jwtService.sign(payload, {
          expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d')
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
      throw new UnauthorizedException('Xác thực thất bại');
    }
  }

  /**
   * NextAuth: Tìm hoặc tạo user từ OAuth provider
   * @param profile - Profile từ OAuth provider
   * @param provider - Tên provider
   */
  async findOrCreateOAuthUser(profile: any, provider: string): Promise<User> {
    try {
      const email = profile.emails?.[0]?.value || profile.email;
      if (!email) {
        throw new BadRequestException('Email không hợp lệ từ OAuth provider');
      }

      // Tìm user theo email
      let user = await this.findUserByEmail(email);

      if (user) {
        // User đã tồn tại, cập nhật thông tin OAuth
        await this.updateOAuthInfo(user.id, provider, profile);
        return user;
      }

      // Tạo user mới từ OAuth
      const newUser = await this.createOAuthUser(profile, provider);
      return newUser;
    } catch (error) {
      throw error;
    }
  }

  /**
   * NextAuth: Tạo user mới từ OAuth
   * @param profile - Profile từ OAuth
   * @param provider - Tên provider
   */
  private async createOAuthUser(profile: any, provider: string): Promise<User> {
    try {
      const email = profile.emails?.[0]?.value || profile.email;
      const name = profile.displayName || profile.name || profile.username;

      // Tách tên thành firstName và lastName
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const newUser = new User();
      newUser.email = email.toLowerCase();
      newUser.firstName = firstName;
      newUser.lastName = lastName;
      newUser.avatar = profile.photos?.[0]?.value || profile.avatar;
      newUser.roles = ['runner'];
      newUser.experience = UserExperience.BEGINNER;
      newUser.status = UserStatus.ACTIVE;
      newUser.isVerified = true; // OAuth đã xác thực
      newUser.isPublic = false;
      // Các trường khác sẽ có giá trị mặc định

      return await this.userRepository.save(newUser);
    } catch (error) {
      console.error('Lỗi khi tạo OAuth user:', error);
      throw new BadRequestException('Không thể tạo user từ OAuth');
    }
  }

  /**
   * NextAuth: Cập nhật thông tin OAuth cho user
   * @param userId - ID của user
   * @param provider - Tên provider
   * @param profile - Profile từ OAuth
   */
  private async updateOAuthInfo(userId: string, provider: string, profile: any): Promise<void> {
    try {
      const updateData: any = {
        lastLoginAt: new Date(),
        lastActivityAt: new Date(),
      };

      // Cập nhật avatar nếu có
      if (profile.photos?.[0]?.value) {
        updateData.avatar = profile.photos[0].value;
      }

      // Cập nhật tên nếu có thay đổi
      if (profile.displayName || profile.name) {
        const name = profile.displayName || profile.name;
        const nameParts = name.trim().split(' ');
        updateData.firstName = nameParts[0] || '';
        updateData.lastName = nameParts.slice(1).join(' ') || '';
      }

      await this.userRepository.update(userId, updateData);
    } catch (error) {
      console.error('Lỗi khi cập nhật OAuth info:', error);
    }
  }

  /**
   * Xác thực user qua email/password
   * @param authLocalDto - DTO chứa email và password
   */
  async validateLocalUser(authLocalDto: AuthLocalDto): Promise<any> {
    try {
      // Tìm user theo email
      const user = await this.findUserByEmail(authLocalDto.email);

      if (!user) {
        throw new UnauthorizedException('Email không tồn tại');
      }

      // Kiểm tra password (sử dụng bcrypt)
      const isPasswordValid = await this.validatePassword(
        authLocalDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Mật khẩu không đúng');
      }

      // Tạo JWT token
      const payload = {
        userId: user.id,
        email: user.email,
        provider: 'local',
      };

      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          provider: 'local',
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Xác thực thất bại');
    }
  }

  // ========================================
  // HELPER METHODS - Database thật
  // ========================================

  /**
   * Tìm user theo username
   * @param username - Username cần tìm
   */
  private async findUserByUsername(username: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        where: { username: username.toLowerCase() }
      });
    } catch (error) {
      console.error('Lỗi khi tìm user theo username:', error);
      return null;
    }
  }

  /**
   * Tìm user theo email
   * @param email - Email cần tìm
   */
  private async findUserByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        where: { email: email.toLowerCase() }
      });
    } catch (error) {
      console.error('Lỗi khi tìm user theo email:', error);
      return null;
    }
  }

  /**
   * Tìm user theo ID
   * @param id - ID của user
   */
  private async findUserById(id: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        where: { id }
      });
    } catch (error) {
      console.error('Lỗi khi tìm user theo ID:', error);
      return null;
    }
  }

  /**
   * Tạo user mới (đăng ký thường)
   * @param userData - Dữ liệu user
   */
  private async createUser(userData: any): Promise<User> {
    try {
      const newUser = new User();
      newUser.username = userData.username.toLowerCase();
      newUser.email = userData.email.toLowerCase();
      newUser.password = userData.password;
      newUser.firstName = userData.firstName;
      newUser.lastName = userData.lastName;
      newUser.phoneNumber = userData.phoneNumber;
      newUser.referralCode = userData.referralCode;
      newUser.avatar = userData.avatar;
      newUser.roles = userData.roles || ['runner'];
      newUser.experience = UserExperience.BEGINNER;
      newUser.status = UserStatus.ACTIVE;
      newUser.isVerified = userData.isVerified || false;
      newUser.isPublic = false;
      // Các trường khác sẽ có giá trị mặc định từ entity

      return await this.userRepository.save(newUser);
    } catch (error) {
      console.error('Lỗi khi tạo user:', error);
      throw new BadRequestException('Không thể tạo user mới');
    }
  }

  /**
   * Cập nhật thời gian đăng nhập cuối
   * @param userId - ID của user
   */
  private async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.userRepository.update(userId, {
        lastLoginAt: new Date(),
        lastActivityAt: new Date()
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật thời gian đăng nhập:', error);
    }
  }

  /**
   * Cập nhật mật khẩu user
   * @param userId - ID của user
   * @param hashedPassword - Mật khẩu đã hash
   */
  private async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    try {
      await this.userRepository.update(userId, {
        password: hashedPassword
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật mật khẩu:', error);
      throw new BadRequestException('Không thể cập nhật mật khẩu');
    }
  }

  /**
   * Validate password
   * @param plainPassword - Password gốc
   * @param hashedPassword - Password đã hash
   */
  private async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      return false;
    }
  }

  /**
   * Cập nhật thông tin mạng xã hội
   * @param userId - ID của user
   * @param provider - Tên provider
   * @param socialId - ID từ mạng xã hội
   */
  private async updateSocialProvider(userId: string, provider: string, socialId: string): Promise<void> {
    try {
      // TODO: Implement khi có bảng social_connections
      console.log(`Cập nhật ${provider} cho user ${userId} với social ID ${socialId}`);
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin mạng xã hội:', error);
    }
  }
}
