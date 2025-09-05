import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Email hoặc Username đăng nhập',
    example: 'user@example.com hoặc nguyenvana'
  })
  @IsString()
  emailOrUsername: string;

  @ApiProperty({
    description: 'Mật khẩu',
    example: 'password123'
  })
  @IsString()
  password: string;
}
