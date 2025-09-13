import { IsBoolean, IsOptional, IsString, IsNumber, IsArray, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TrustedDevice {
  @ApiProperty({ 
    description: 'ID của thiết bị',
    example: 'device_123'
  })
  @IsString()
  deviceId: string;

  @ApiProperty({ 
    description: 'Tên thiết bị',
    example: 'iPhone 15 Pro'
  })
  @IsString()
  deviceName: string;

  @ApiProperty({ 
    description: 'Loại thiết bị',
    example: 'mobile'
  })
  @IsString()
  deviceType: string;

  @ApiProperty({ 
    description: 'Địa chỉ IP',
    example: '192.168.1.100'
  })
  @IsString()
  ipAddress: string;

  @ApiProperty({ 
    description: 'Thời gian đăng nhập cuối',
    example: '2024-01-15T10:30:00Z'
  })
  @IsString()
  lastLoginAt: string;

  @ApiProperty({ 
    description: 'Vị trí đăng nhập',
    example: 'Hà Nội, Việt Nam'
  })
  @IsString()
  location: string;
}

export class SecuritySettingsDto {
  @ApiProperty({ 
    description: 'Bật/tắt xác thực 2 yếu tố',
    example: false,
    default: false
  })
  @IsBoolean()
  twoFactorEnabled: boolean;

  @ApiProperty({ 
    description: 'Thông báo đăng nhập',
    example: true,
    default: true
  })
  @IsBoolean()
  loginNotifications: boolean;

  @ApiProperty({ 
    description: 'Thời gian timeout session (phút)',
    example: 30,
    default: 30,
    minimum: 5,
    maximum: 1440
  })
  @IsNumber()
  @Min(5)
  @Max(1440)
  sessionTimeout: number;

  @ApiProperty({ 
    description: 'Danh sách thiết bị tin cậy',
    type: [TrustedDevice],
    default: []
  })
  @IsArray()
  trustedDevices: TrustedDevice[];

  @ApiPropertyOptional({ 
    description: 'Cài đặt bảo mật bổ sung',
    example: { requirePasswordChange: false, maxLoginAttempts: 5 }
  })
  @IsOptional()
  additionalSettings?: any;
}


