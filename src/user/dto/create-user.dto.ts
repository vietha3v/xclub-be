import { IsEmail, IsString, IsOptional, IsEnum, IsDateString, IsNumber, IsBoolean, IsArray, Min, Max, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserGender, UserExperience } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ 
    description: 'Email đăng nhập',
    example: 'user@example.com',
    required: true
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    description: 'Mật khẩu (tối thiểu 6 ký tự)',
    example: 'password123',
    minLength: 6,
    maxLength: 100,
    required: true
  })
  @IsString()
  @Length(6, 100)
  password: string;

  @ApiPropertyOptional({ 
    description: 'Số điện thoại',
    example: '+84123456789'
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ 
    description: 'Tên người dùng',
    example: 'Nguyễn',
    minLength: 1,
    maxLength: 100,
    required: true
  })
  @IsString()
  @Length(1, 100)
  firstName: string;

  @ApiProperty({ 
    description: 'Họ người dùng',
    example: 'Văn A',
    minLength: 1,
    maxLength: 100,
    required: true
  })
  @IsString()
  @Length(1, 100)
  lastName: string;

  @ApiPropertyOptional({ 
    description: 'Ngày sinh (ISO 8601: YYYY-MM-DDTHH:mm:ss.sssZ)',
    example: '1990-01-01T00:00:00.000Z'
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ 
    description: 'Giới tính',
    enum: UserGender,
    example: UserGender.MALE
  })
  @IsOptional()
  @IsEnum(UserGender)
  gender?: UserGender;

  @ApiPropertyOptional({ 
    description: 'URL avatar',
    example: 'https://example.com/avatar.jpg'
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ 
    description: 'Chiều cao (cm)',
    example: 170,
    minimum: 50,
    maximum: 300
  })
  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(300)
  height?: number;

  @ApiPropertyOptional({ 
    description: 'Cân nặng (kg)',
    example: 65,
    minimum: 20,
    maximum: 500
  })
  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(500)
  weight?: number;

  @ApiPropertyOptional({ 
    description: 'Kinh nghiệm chạy bộ (mặc định: beginner)',
    enum: UserExperience,
    example: UserExperience.BEGINNER,
    default: UserExperience.BEGINNER
  })
  @IsOptional()
  @IsEnum(UserExperience)
  experience: UserExperience = UserExperience.BEGINNER;

  @ApiPropertyOptional({ 
    description: 'Tiểu sử cá nhân',
    example: 'Tôi là người yêu thích chạy bộ và muốn tham gia cộng đồng X-Club',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  bio?: string;

  @ApiPropertyOptional({ 
    description: 'Địa điểm',
    example: 'Hà Nội, Việt Nam'
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ 
    description: 'Vĩ độ (từ -90 đến 90)',
    example: 21.0285,
    minimum: -90,
    maximum: 90
  })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ 
    description: 'Kinh độ (từ -180 đến 180)',
    example: 105.8542,
    minimum: -180,
    maximum: 180
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({ 
    description: 'Múi giờ',
    example: 'Asia/Ho_Chi_Minh'
  })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ 
    description: 'Ngôn ngữ ưa thích',
    example: 'vi'
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ 
    description: 'Đơn vị tiền tệ',
    example: 'VND'
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ 
    description: 'Đơn vị đo lường (metric/imperial)',
    example: 'metric'
  })
  @IsOptional()
  @IsString()
  units?: string;

  @ApiPropertyOptional({ 
    description: 'Hồ sơ công khai (mặc định: false)',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  isPublic: boolean = false;

  @ApiPropertyOptional({ 
    description: 'Danh sách vai trò (mặc định: runner)',
    example: ['runner'],
    type: [String],
    default: ['runner']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles: string[] = ['runner'];
}
