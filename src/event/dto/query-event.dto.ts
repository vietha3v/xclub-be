import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsBoolean, IsDateString, IsNumber, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { EventType, EventStatus, EventVisibility } from '../entities/event.entity';

export class QueryEventDto {
  @ApiPropertyOptional({ 
    description: 'Trang hiện tại',
    example: 1,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ 
    description: 'Số lượng sự kiện mỗi trang',
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @ApiPropertyOptional({ 
    description: 'Từ khóa tìm kiếm (tên, mô tả)',
    example: 'chạy bộ'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ 
    description: 'Loại sự kiện',
    enum: EventType
  })
  @IsOptional()
  @IsEnum(EventType)
  type?: EventType;

  @ApiPropertyOptional({ 
    description: 'Trạng thái sự kiện',
    enum: EventStatus
  })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiPropertyOptional({ 
    description: 'Quyền riêng tư',
    enum: EventVisibility
  })
  @IsOptional()
  @IsEnum(EventVisibility)
  visibility?: EventVisibility;

  @ApiPropertyOptional({ 
    description: 'ID câu lạc bộ',
    example: 'uuid-cua-club'
  })
  @IsOptional()
  @IsString()
  clubId?: string;

  @ApiPropertyOptional({ 
    description: 'ID người tạo',
    example: 'uuid-nguoi-tao'
  })
  @IsOptional()
  @IsString()
  createdBy?: string;

  @ApiPropertyOptional({ 
    description: 'Thời gian bắt đầu từ',
    example: '2024-09-01T00:00:00Z'
  })
  @IsOptional()
  @IsDateString()
  startDateFrom?: string;

  @ApiPropertyOptional({ 
    description: 'Thời gian bắt đầu đến',
    example: '2024-09-30T23:59:59Z'
  })
  @IsOptional()
  @IsDateString()
  startDateTo?: string;

  @ApiPropertyOptional({ 
    description: 'Thời gian kết thúc từ',
    example: '2024-09-01T00:00:00Z'
  })
  @IsOptional()
  @IsDateString()
  endDateFrom?: string;

  @ApiPropertyOptional({ 
    description: 'Thời gian kết thúc đến',
    example: '2024-09-30T23:59:59Z'
  })
  @IsOptional()
  @IsDateString()
  endDateTo?: string;

  @ApiPropertyOptional({ 
    description: 'Chỉ lấy sự kiện đang diễn ra',
    default: false
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  activeOnly?: boolean;

  @ApiPropertyOptional({ 
    description: 'Chỉ lấy sự kiện cho phép đăng ký',
    default: false
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  allowRegistration?: boolean;

  @ApiPropertyOptional({ 
    description: 'Chỉ lấy sự kiện miễn phí',
    default: false
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  freeOnly?: boolean;

  @ApiPropertyOptional({ 
    description: 'Tags sự kiện',
    example: ['chạy bộ', 'cộng đồng']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ 
    description: 'Sắp xếp theo trường',
    example: 'startDate',
    default: 'startDate'
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'startDate';

  @ApiPropertyOptional({ 
    description: 'Thứ tự sắp xếp',
    example: 'ASC',
    default: 'ASC'
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'ASC';

  @ApiPropertyOptional({ 
    description: 'Bán kính tìm kiếm theo vị trí (km)',
    example: 10,
    minimum: 0
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  radius?: number;

  @ApiPropertyOptional({ 
    description: 'Tọa độ tìm kiếm (latitude)',
    example: 10.762622
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  searchLatitude?: number;

  @ApiPropertyOptional({ 
    description: 'Tọa độ tìm kiếm (longitude)',
    example: 106.660172
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  searchLongitude?: number;
}
