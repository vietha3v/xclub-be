import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsDateString, IsNumber, IsBoolean, IsObject } from 'class-validator';
import { ActivityType, ActivityStatus } from '../entities/activity.entity';

export class CreateActivityDto {
  @ApiProperty({ 
    description: 'Loại hoạt động',
    enum: ActivityType,
    example: ActivityType.RUNNING
  })
  @IsEnum(ActivityType)
  type: ActivityType;

  @ApiProperty({ 
    description: 'Tên hoạt động',
    example: 'Chạy bộ buổi sáng'
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({ 
    description: 'Mô tả hoạt động',
    example: 'Chạy bộ 5km trong công viên'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    description: 'Thời gian bắt đầu (ISO 8601)',
    example: '2025-02-09T06:00:00Z'
  })
  @IsDateString()
  startTime: string;

  @ApiPropertyOptional({ 
    description: 'Thời gian kết thúc (ISO 8601)',
    example: '2025-02-09T07:00:00Z'
  })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiPropertyOptional({ 
    description: 'Thời lượng (giây)',
    example: 3600
  })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({ 
    description: 'Khoảng cách (mét)',
    example: 5000
  })
  @IsOptional()
  @IsNumber()
  distance?: number;

  @ApiPropertyOptional({ 
    description: 'Tốc độ trung bình (m/phút)',
    example: 5.5
  })
  @IsOptional()
  @IsNumber()
  averagePace?: number;

  @ApiPropertyOptional({ 
    description: 'Tốc độ trung bình (km/h)',
    example: 10.8
  })
  @IsOptional()
  @IsNumber()
  averageSpeed?: number;

  @ApiPropertyOptional({ 
    description: 'Calories tiêu thụ',
    example: 450
  })
  @IsOptional()
  @IsNumber()
  calories?: number;

  @ApiPropertyOptional({ 
    description: 'Nhịp tim trung bình',
    example: 140
  })
  @IsOptional()
  @IsNumber()
  averageHeartRate?: number;

  @ApiPropertyOptional({ 
    description: 'Nhịp tim tối đa',
    example: 165
  })
  @IsOptional()
  @IsNumber()
  maxHeartRate?: number;

  @ApiPropertyOptional({ 
    description: 'Độ cao tăng (mét)',
    example: 50
  })
  @IsOptional()
  @IsNumber()
  elevationGain?: number;

  @ApiPropertyOptional({ 
    description: 'Độ cao giảm (mét)',
    example: 45
  })
  @IsOptional()
  @IsNumber()
  elevationLoss?: number;

  @ApiPropertyOptional({ 
    description: 'Trạng thái hoạt động',
    enum: ActivityStatus,
    default: ActivityStatus.SYNCED
  })
  @IsOptional()
  @IsEnum(ActivityStatus)
  status?: ActivityStatus;

  @ApiPropertyOptional({ 
    description: 'Dữ liệu GPS (GeoJSON)',
    example: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } }
  })
  @IsOptional()
  @IsObject()
  gpsData?: any;

  @ApiPropertyOptional({ 
    description: 'Ảnh hoạt động',
    example: 'https://example.com/activity-image.jpg'
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ 
    description: 'Ghi chú cá nhân',
    example: 'Chạy rất tốt, cảm thấy khỏe'
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ 
    description: 'Công khai hay riêng tư',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
