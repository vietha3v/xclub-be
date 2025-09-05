import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsBoolean, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { ClubType, ClubStatus } from '../entities/club.entity';

export class QueryClubDto {
  @ApiPropertyOptional({ 
    description: 'Loại câu lạc bộ',
    enum: ClubType
  })
  @IsOptional()
  @IsEnum(ClubType)
  type?: ClubType;

  @ApiPropertyOptional({ 
    description: 'Trạng thái câu lạc bộ',
    enum: ClubStatus
  })
  @IsOptional()
  @IsEnum(ClubStatus)
  status?: ClubStatus;

  @ApiPropertyOptional({ 
    description: 'Tìm kiếm theo tên hoặc mô tả'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ 
    description: 'Thành phố'
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ 
    description: 'Tỉnh/Thành phố'
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ 
    description: 'Quốc gia'
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ 
    description: 'Chỉ hiển thị câu lạc bộ công khai',
    default: false
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  publicOnly?: boolean;

  @ApiPropertyOptional({ 
    description: 'Chỉ hiển thị câu lạc bộ cho phép đăng ký mới',
    default: false
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  allowNewMembers?: boolean;

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
    default: 'createdAt'
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ 
    description: 'Thứ tự sắp xếp (ASC/DESC)',
    default: 'DESC'
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
