import { IsEmail, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Username đăng ký (duy nhất)',
    example: 'nguyenvana'
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Email đăng ký (duy nhất)',
    example: 'user@example.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Mật khẩu',
    example: 'password123'
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'Xác nhận mật khẩu',
    example: 'password123'
  })
  @IsString()
  confirmPassword: string;

  @ApiProperty({
    description: 'Tên người dùng',
    example: 'Nguyễn'
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'Họ người dùng',
    example: 'Văn A'
  })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({
    description: 'Số điện thoại',
    example: '+84123456789'
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Mã giới thiệu (nếu có)',
    example: 'REF123'
  })
  @IsOptional()
  @IsString()
  referralCode?: string;
}
