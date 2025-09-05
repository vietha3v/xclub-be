import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { MediaType, MediaStatus } from '../entities/media.entity';

export class QueryMediaDto {
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

  @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm (tên, mô tả)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Lọc theo loại media' })
  @IsOptional()
  @IsEnum(MediaType)
  type?: MediaType;

  @ApiPropertyOptional({ description: 'Lọc theo trạng thái' })
  @IsOptional()
  @IsEnum(MediaStatus)
  status?: MediaStatus;

  @ApiPropertyOptional({ description: 'Lọc theo MIME type' })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional({ description: 'Lọc theo ID người upload' })
  @IsOptional()
  @IsUUID()
  uploadedBy?: string;

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

  @ApiPropertyOptional({ description: 'Lọc theo kích thước tối thiểu (bytes)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minSize?: number;

  @ApiPropertyOptional({ description: 'Lọc theo kích thước tối đa (bytes)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxSize?: number;

  @ApiPropertyOptional({ description: 'Lọc theo ngày tạo từ' })
  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @ApiPropertyOptional({ description: 'Lọc theo ngày tạo đến' })
  @IsOptional()
  @IsDateString()
  createdTo?: string;

  @ApiPropertyOptional({ description: 'Lọc theo tags' })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({ description: 'Lọc theo quyền riêng tư' })
  @IsOptional()
  @IsString()
  privacy?: string;

  @ApiPropertyOptional({ description: 'Sắp xếp theo trường nào (e.g., createdAt, size)' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Thứ tự sắp xếp (ASC, DESC)', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}
