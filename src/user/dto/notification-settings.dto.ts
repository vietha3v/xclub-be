import { IsBoolean, IsOptional, IsString, IsObject, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class EmailNotificationSettings {
  @ApiProperty({ 
    description: 'Bật/tắt thông báo email',
    example: true,
    default: true
  })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ 
    description: 'Thông báo hoạt động chạy bộ',
    example: true,
    default: true
  })
  @IsBoolean()
  activities: boolean;

  @ApiProperty({ 
    description: 'Thông báo thành tích',
    example: true,
    default: true
  })
  @IsBoolean()
  achievements: boolean;

  @ApiProperty({ 
    description: 'Báo cáo hàng tuần',
    example: true,
    default: true
  })
  @IsBoolean()
  weeklyReport: boolean;

  @ApiProperty({ 
    description: 'Báo cáo hàng tháng',
    example: false,
    default: false
  })
  @IsBoolean()
  monthlyReport: boolean;

  @ApiProperty({ 
    description: 'Email marketing',
    example: false,
    default: false
  })
  @IsBoolean()
  marketing: boolean;
}

export class PushNotificationSettings {
  @ApiProperty({ 
    description: 'Bật/tắt thông báo push',
    example: true,
    default: true
  })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ 
    description: 'Thông báo hoạt động chạy bộ',
    example: true,
    default: true
  })
  @IsBoolean()
  activities: boolean;

  @ApiProperty({ 
    description: 'Thông báo thành tích',
    example: true,
    default: true
  })
  @IsBoolean()
  achievements: boolean;

  @ApiProperty({ 
    description: 'Thông báo nhắc nhở',
    example: false,
    default: false
  })
  @IsBoolean()
  reminders: boolean;
}

export class FrequencySettings {
  @ApiProperty({ 
    description: 'Thông báo hàng ngày',
    example: true,
    default: true
  })
  @IsBoolean()
  daily: boolean;

  @ApiProperty({ 
    description: 'Thông báo hàng tuần',
    example: true,
    default: true
  })
  @IsBoolean()
  weekly: boolean;

  @ApiProperty({ 
    description: 'Thông báo hàng tháng',
    example: false,
    default: false
  })
  @IsBoolean()
  monthly: boolean;
}

export class QuietHoursSettings {
  @ApiProperty({ 
    description: 'Bật/tắt giờ im lặng',
    example: false,
    default: false
  })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ 
    description: 'Thời gian bắt đầu (HH:mm)',
    example: '22:00',
    default: '22:00'
  })
  @IsString()
  startTime: string;

  @ApiProperty({ 
    description: 'Thời gian kết thúc (HH:mm)',
    example: '08:00',
    default: '08:00'
  })
  @IsString()
  endTime: string;
}

export class NotificationSettingsDto {
  @ApiProperty({ 
    description: 'Cài đặt thông báo email',
    type: EmailNotificationSettings
  })
  @ValidateNested()
  @Type(() => EmailNotificationSettings)
  emailNotifications: EmailNotificationSettings;

  @ApiProperty({ 
    description: 'Cài đặt thông báo push',
    type: PushNotificationSettings
  })
  @ValidateNested()
  @Type(() => PushNotificationSettings)
  pushNotifications: PushNotificationSettings;

  @ApiProperty({ 
    description: 'Cài đặt tần suất thông báo',
    type: FrequencySettings
  })
  @ValidateNested()
  @Type(() => FrequencySettings)
  frequency: FrequencySettings;

  @ApiProperty({ 
    description: 'Cài đặt giờ im lặng',
    type: QuietHoursSettings
  })
  @ValidateNested()
  @Type(() => QuietHoursSettings)
  quietHours: QuietHoursSettings;
}


