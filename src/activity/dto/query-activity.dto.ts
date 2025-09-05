import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsDateString, IsNumber, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ActivityType, ActivityStatus } from '../entities/activity.entity';

export class QueryActivityDto {
  @ApiPropertyOptional({ 
    description: 'Loại hoạt động',
    enum: ActivityType
  })
  @IsOptional()
  @IsEnum(ActivityType)
  type?: ActivityType;

  @ApiPropertyOptional({ 
    description: 'Trạng thái hoạt động',
    enum: ActivityStatus
  })
  @IsOptional()
  @IsEnum(ActivityStatus)
  status?: ActivityStatus;

  @ApiPropertyOptional({ 
    description: 'Tìm kiếm theo tên hoặc mô tả'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ 
    description: 'Thời gian bắt đầu từ (ISO 8601)'
  })
  @IsOptional()
  @IsDateString()
  startTimeFrom?: string;

  @ApiPropertyOptional({ 
    description: 'Thời gian bắt đầu đến (ISO 8601)'
  })
  @IsOptional()
  @IsDateString()
  startTimeTo?: string;

  @ApiPropertyOptional({ 
    description: 'Khoảng cách tối thiểu (mét)'
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  minDistance?: number;

  @ApiPropertyOptional({ 
    description: 'Khoảng cách tối đa (mét)'
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  maxDistance?: number;

  @ApiPropertyOptional({ 
    description: 'Thời lượng tối thiểu (giây)'
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  minDuration?: number;

  @ApiPropertyOptional({ 
    description: 'Thời lượng tối đa (giây)'
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  maxDuration?: number;

  @ApiPropertyOptional({ 
    description: 'Chỉ hiển thị hoạt động công khai',
    default: false
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  publicOnly?: boolean;

  @ApiPropertyOptional({ 
    description: 'Số trang',
    default: 1
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ 
    description: 'Số lượng item mỗi trang',
    default: 20
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  limit?: number = 20;

  @ApiPropertyOptional({ 
    description: 'Sắp xếp theo trường',
    default: 'startTime'
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'startTime';

  @ApiPropertyOptional({ 
    description: 'Thứ tự sắp xếp (ASC/DESC)',
    default: 'DESC'
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
