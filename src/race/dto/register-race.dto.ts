import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsNumber,
  IsEnum,
  IsArray,
  IsBoolean,
  Min
} from 'class-validator';

export enum RegistrationCategory {
  MALE_18_29 = 'male_18_29',
  MALE_30_39 = 'male_30_39',
  MALE_40_49 = 'male_40_49',
  MALE_50_59 = 'male_50_59',
  MALE_60_PLUS = 'male_60_plus',
  FEMALE_18_29 = 'female_18_29',
  FEMALE_30_39 = 'female_30_39',
  FEMALE_40_49 = 'female_40_49',
  FEMALE_50_59 = 'female_50_59',
  FEMALE_60_PLUS = 'female_60_plus',
  YOUTH = 'youth',
  SENIOR = 'senior',
  ELITE = 'elite',
  WHEELCHAIR = 'wheelchair',
  OTHER = 'other'
}

export class RegisterRaceDto {
  @ApiPropertyOptional({ 
    description: 'Khoảng cách muốn tham gia (mét)',
    example: 42195,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  distance?: number;

  @ApiPropertyOptional({ 
    description: 'Danh mục tham gia',
    enum: RegistrationCategory,
    example: RegistrationCategory.MALE_30_39
  })
  @IsOptional()
  @IsEnum(RegistrationCategory)
  category?: RegistrationCategory;

  @ApiPropertyOptional({ 
    description: 'Số điện thoại liên hệ',
    example: '0123456789'
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ 
    description: 'Địa chỉ liên hệ',
    example: '123 Đường ABC, Quận XYZ, TP.HCM'
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ 
    description: 'Thông tin y tế',
    example: 'Không có vấn đề sức khỏe đặc biệt'
  })
  @IsOptional()
  @IsString()
  medicalInfo?: string;

  @ApiPropertyOptional({ 
    description: 'Kinh nghiệm chạy bộ',
    example: 'Đã tham gia 5 giải chạy marathon'
  })
  @IsOptional()
  @IsString()
  runningExperience?: string;

  @ApiPropertyOptional({ 
    description: 'Thời gian dự kiến hoàn thành (phút)',
    example: 240,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  expectedFinishTime?: number;

  @ApiPropertyOptional({ 
    description: 'Ghi chú đặc biệt',
    example: 'Cần hỗ trợ đặc biệt về dinh dưỡng'
  })
  @IsOptional()
  @IsString()
  specialNotes?: string;

  @ApiPropertyOptional({ 
    description: 'Đồng ý với quy định',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  agreeToTerms?: boolean;

  @ApiPropertyOptional({ 
    description: 'Đồng ý chia sẻ thông tin',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  agreeToDataSharing?: boolean;

  @ApiPropertyOptional({ 
    description: 'Thông tin bổ sung',
    example: { emergencyContact: 'Nguyễn Văn A - 0987654321' }
  })
  @IsOptional()
  additionalInfo?: any;
}
