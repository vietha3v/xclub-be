import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsUrl, IsObject } from 'class-validator';
import { EventType, EventStatus, EventVisibility } from '../entities/event.entity';

export class CreateEventDto {
  @ApiProperty({ 
    description: 'Tên sự kiện',
    example: 'Tháng chạy bộ cộng đồng tháng 9'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ 
    description: 'Mô tả sự kiện',
    example: 'Sự kiện chạy bộ cộng đồng hàng tháng dành cho tất cả thành viên CLB'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    description: 'Loại sự kiện',
    enum: EventType,
    example: EventType.TRAINING
  })
  @IsEnum(EventType)
  type: EventType;

  @ApiPropertyOptional({ 
    description: 'Trạng thái sự kiện',
    enum: EventStatus,
    default: EventStatus.UPCOMING
  })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus = EventStatus.UPCOMING;

  @ApiPropertyOptional({ 
    description: 'Quyền riêng tư sự kiện',
    enum: EventVisibility,
    default: EventVisibility.CLUB_ONLY
  })
  @IsOptional()
  @IsEnum(EventVisibility)
  visibility?: EventVisibility = EventVisibility.CLUB_ONLY;

  @ApiPropertyOptional({ 
    description: 'ID câu lạc bộ tổ chức',
    example: 'uuid-cua-club'
  })
  @IsOptional()
  @IsString()
  clubId?: string;

  @ApiProperty({ 
    description: 'Thời gian bắt đầu sự kiện',
    example: '2024-09-01T00:00:00Z'
  })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ 
    description: 'Thời gian kết thúc sự kiện',
    example: '2024-09-30T23:59:59Z'
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ 
    description: 'Thời gian đăng ký bắt đầu',
    example: '2024-08-25T00:00:00Z'
  })
  @IsOptional()
  @IsDateString()
  registrationStartDate?: string;

  @ApiPropertyOptional({ 
    description: 'Thời gian đăng ký kết thúc',
    example: '2024-08-31T23:59:59Z'
  })
  @IsOptional()
  @IsDateString()
  registrationEndDate?: string;

  @ApiPropertyOptional({ 
    description: 'Địa điểm sự kiện',
    example: 'Công viên Tao Đàn, Quận 1, TP.HCM'
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ 
    description: 'Tọa độ địa điểm (latitude)',
    example: 10.7769
  })
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ 
    description: 'Tọa độ địa điểm (longitude)',
    example: 106.7009
  })
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional({ 
    description: 'Địa chỉ chi tiết',
    example: 'Công viên Tao Đàn, Trương Định, Quận 1, TP.HCM'
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ 
    description: 'Thông tin liên hệ',
    example: { email: 'contact@xclub.com', phone: '0123456789' }
  })
  @IsOptional()
  @IsObject()
  contactInfo?: any;

  @ApiPropertyOptional({ 
    description: 'Ảnh bìa sự kiện',
    example: 'https://example.com/cover-image.jpg'
  })
  @IsOptional()
  @IsUrl()
  coverImageUrl?: string;

  @ApiPropertyOptional({ 
    description: 'Ảnh bổ sung',
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
  })
  @IsOptional()
  additionalImages?: string[];

  @ApiPropertyOptional({ 
    description: 'Tags sự kiện',
    example: ['chạy bộ', 'cộng đồng', 'tháng 9', 'training']
  })
  @IsOptional()
  tags?: string[];
}
