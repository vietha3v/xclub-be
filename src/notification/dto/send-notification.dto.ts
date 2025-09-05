import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray, IsUUID, IsDateString } from 'class-validator';
import { NotificationType, NotificationPriority, NotificationChannel } from '../entities/notification.entity';

export class SendNotificationDto {
  @ApiProperty({ description: 'Tiêu đề thông báo' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Nội dung thông báo' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ description: 'Loại thông báo' })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiPropertyOptional({ description: 'Mức độ ưu tiên' })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @ApiPropertyOptional({ description: 'Kênh thông báo' })
  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;

  @ApiProperty({ description: 'Danh sách ID người nhận' })
  @IsArray()
  @IsUUID(4, { each: true })
  recipientIds: string[];

  @ApiPropertyOptional({ description: 'ID câu lạc bộ liên quan' })
  @IsOptional()
  @IsUUID()
  clubId?: string;

  @ApiPropertyOptional({ description: 'ID đối tượng liên quan' })
  @IsOptional()
  @IsUUID()
  relatedObjectId?: string;

  @ApiPropertyOptional({ description: 'Loại đối tượng liên quan' })
  @IsOptional()
  @IsString()
  relatedObjectType?: string;

  @ApiPropertyOptional({ description: 'Dữ liệu bổ sung' })
  @IsOptional()
  data?: any;

  @ApiPropertyOptional({ description: 'Thời gian gửi' })
  @IsOptional()
  @IsDateString()
  sendAt?: Date;

  @ApiPropertyOptional({ description: 'Thời gian hết hạn' })
  @IsOptional()
  @IsDateString()
  expiresAt?: Date;

  @ApiPropertyOptional({ description: 'Cài đặt thông báo' })
  @IsOptional()
  settings?: any;

  @ApiPropertyOptional({ description: 'Tags thông báo' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
