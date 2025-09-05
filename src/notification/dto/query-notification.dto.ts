import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, IsEnum, IsUUID, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType, NotificationStatus, NotificationPriority, NotificationChannel } from '../entities/notification.entity';

export class QueryNotificationDto {
  @ApiPropertyOptional({ description: 'Trang hiện tại', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Số lượng item mỗi trang', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm (tiêu đề, nội dung)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Lọc theo loại thông báo' })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({ description: 'Lọc theo trạng thái' })
  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

  @ApiPropertyOptional({ description: 'Lọc theo mức độ ưu tiên' })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @ApiPropertyOptional({ description: 'Lọc theo kênh thông báo' })
  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;

  @ApiPropertyOptional({ description: 'Lọc theo ID người nhận' })
  @IsOptional()
  @IsUUID()
  recipientId?: string;

  @ApiPropertyOptional({ description: 'Lọc theo ID người gửi' })
  @IsOptional()
  @IsUUID()
  senderId?: string;

  @ApiPropertyOptional({ description: 'Lọc theo ID câu lạc bộ' })
  @IsOptional()
  @IsUUID()
  clubId?: string;

  @ApiPropertyOptional({ description: 'Lọc theo ID đối tượng liên quan' })
  @IsOptional()
  @IsUUID()
  relatedObjectId?: string;

  @ApiPropertyOptional({ description: 'Lọc theo loại đối tượng liên quan' })
  @IsOptional()
  @IsString()
  relatedObjectType?: string;

  @ApiPropertyOptional({ description: 'Lọc theo tags' })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({ description: 'Lọc thông báo chưa đọc' })
  @IsOptional()
  @IsBoolean()
  unreadOnly?: boolean;

  @ApiPropertyOptional({ description: 'Sắp xếp theo trường nào (e.g., createdAt, priority)' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Thứ tự sắp xếp (ASC, DESC)', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}
