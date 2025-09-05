import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ChallengeStatus, ChallengeType, ChallengeDifficulty, ChallengeVisibility } from '../entities/challenge.entity';

export class QueryChallengeDto {
  @ApiPropertyOptional({ description: 'Trang hiện tại', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ description: 'Số lượng mỗi trang', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ 
    description: 'Từ khóa tìm kiếm',
    example: 'chạy 100km'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Trạng thái thử thách', enum: ChallengeStatus })
  @IsOptional()
  @IsEnum(ChallengeStatus)
  status?: ChallengeStatus;

  @ApiPropertyOptional({ description: 'Loại thử thách', enum: ChallengeType })
  @IsOptional()
  @IsEnum(ChallengeType)
  type?: ChallengeType;

  @ApiPropertyOptional({ description: 'Độ khó thử thách', enum: ChallengeDifficulty })
  @IsOptional()
  @IsEnum(ChallengeDifficulty)
  difficulty?: ChallengeDifficulty;

  @ApiPropertyOptional({ description: 'Quyền riêng tư', enum: ChallengeVisibility })
  @IsOptional()
  @IsEnum(ChallengeVisibility)
  visibility?: ChallengeVisibility;

  @ApiPropertyOptional({ 
    description: 'ID câu lạc bộ',
    example: 'uuid-cua-club'
  })
  @IsOptional()
  @IsString()
  clubId?: string;

  @ApiPropertyOptional({ 
    description: 'ID sự kiện',
    example: 'uuid-cua-event'
  })
  @IsOptional()
  @IsString()
  eventId?: string;

  @ApiPropertyOptional({ description: 'Chỉ lấy thử thách đang hoạt động' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  activeOnly?: boolean;

  @ApiPropertyOptional({ description: 'Chỉ lấy thử thách cho phép đăng ký' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  allowRegistration?: boolean;

  @ApiPropertyOptional({ description: 'Sắp xếp theo trường', example: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Thứ tự sắp xếp', example: 'DESC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}
