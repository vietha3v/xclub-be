import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email để gửi link đặt lại mật khẩu',
    example: 'user@example.com',
    required: true
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;
}
