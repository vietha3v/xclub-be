import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Token để đặt lại mật khẩu (từ email)',
    example: 'reset_token_here',
    required: true
  })
  @IsString({ message: 'Token phải là chuỗi' })
  token: string;

  @ApiProperty({
    description: 'Mật khẩu mới (tối thiểu 8 ký tự, có chữ hoa, chữ thường, số)',
    example: 'NewPassword123',
    minLength: 8,
    maxLength: 100,
    required: true
  })
  @IsString({ message: 'Mật khẩu mới phải là chuỗi' })
  @MinLength(8, { message: 'Mật khẩu mới phải có ít nhất 8 ký tự' })
  @MaxLength(100, { message: 'Mật khẩu mới không được quá 100 ký tự' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Mật khẩu mới phải có ít nhất 1 chữ thường, 1 chữ hoa và 1 số'
  })
  newPassword: string;

  @ApiProperty({
    description: 'Xác nhận mật khẩu mới',
    example: 'NewPassword123',
    required: true
  })
  @IsString({ message: 'Xác nhận mật khẩu mới phải là chuỗi' })
  confirmPassword: string;
}
