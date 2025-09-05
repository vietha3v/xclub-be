import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString } from 'class-validator';

export class SyncActivityDto {
  @ApiPropertyOptional({ description: 'ID người dùng cần đồng bộ (tự động lấy từ JWT)' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: 'Nền tảng cần đồng bộ (strava, garmin)' })
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiPropertyOptional({ description: 'Số ngày lùi để đồng bộ (mặc định: 7 ngày)' })
  @IsOptional()
  daysBack?: number;
}

export class SyncActivityResponseDto {
  @ApiProperty({ description: 'Trạng thái đồng bộ' })
  success: boolean;

  @ApiProperty({ description: 'Số hoạt động mới được đồng bộ' })
  newActivities: number;

  @ApiProperty({ description: 'Thời gian đồng bộ' })
  syncTime: string;

  @ApiProperty({ description: 'Thông báo kết quả' })
  message: string;

  @ApiPropertyOptional({ description: 'Lỗi nếu có' })
  error?: string;

  @ApiPropertyOptional({ description: 'Thời gian thực hiện (ms)' })
  duration?: number;
}
