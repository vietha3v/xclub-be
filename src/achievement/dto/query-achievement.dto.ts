import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, IsEnum, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { AchievementType, AchievementTier, AchievementStatus } from '../entities/achievement.entity';

export class QueryAchievementDto {
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

  @ApiPropertyOptional({ description: 'Lọc theo loại thành tích' })
  @IsOptional()
  @IsEnum(AchievementType)
  type?: AchievementType;

  @ApiPropertyOptional({ description: 'Lọc theo cấp độ thành tích' })
  @IsOptional()
  @IsEnum(AchievementTier)
  tier?: AchievementTier;

  @ApiPropertyOptional({ description: 'Lọc theo trạng thái thành tích' })
  @IsOptional()
  @IsEnum(AchievementStatus)
  status?: AchievementStatus;

  @ApiPropertyOptional({ description: 'Lọc theo ID câu lạc bộ' })
  @IsOptional()
  @IsUUID()
  clubId?: string;

  @ApiPropertyOptional({ description: 'Lọc theo ID người tạo' })
  @IsOptional()
  @IsString()
  createdBy?: string;

  @ApiPropertyOptional({ description: 'Lọc theo tags' })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({ description: 'Sắp xếp theo trường nào (e.g., name, points, createdAt)' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Thứ tự sắp xếp (ASC, DESC)', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}
