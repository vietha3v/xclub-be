import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsInt, Min, IsNumber, Length, IsUUID, IsArray } from 'class-validator';
import { AchievementType, AchievementTier, AchievementStatus } from '../entities/achievement.entity';

export class CreateAchievementDto {
  @ApiProperty({ description: 'Mã thành tích (duy nhất)' })
  @IsString()
  @Length(1, 20)
  achievementCode: string;

  @ApiProperty({ description: 'Tên thành tích' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiPropertyOptional({ description: 'Mô tả thành tích' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Loại thành tích' })
  @IsEnum(AchievementType)
  type: AchievementType;

  @ApiProperty({ description: 'Cấp độ thành tích' })
  @IsEnum(AchievementTier)
  tier: AchievementTier;

  @ApiPropertyOptional({ description: 'Trạng thái thành tích' })
  @IsOptional()
  @IsEnum(AchievementStatus)
  status?: AchievementStatus;

  @ApiPropertyOptional({ description: 'ID câu lạc bộ tạo thành tích' })
  @IsOptional()
  @IsUUID()
  clubId?: string;

  @ApiPropertyOptional({ description: 'Điều kiện để đạt được thành tích' })
  @IsOptional()
  conditions?: any;

  @ApiPropertyOptional({ description: 'Giá trị mục tiêu' })
  @IsOptional()
  @IsNumber()
  targetValue?: number;

  @ApiPropertyOptional({ description: 'Đơn vị của giá trị mục tiêu' })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  targetUnit?: string;

  @ApiPropertyOptional({ description: 'Thời gian giới hạn (giây)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  timeLimit?: number;

  @ApiPropertyOptional({ description: 'Số lần thực hiện tối thiểu' })
  @IsOptional()
  @IsInt()
  @Min(1)
  minOccurrences?: number;

  @ApiPropertyOptional({ description: 'Số ngày liên tiếp tối thiểu' })
  @IsOptional()
  @IsInt()
  @Min(1)
  minStreak?: number;

  @ApiPropertyOptional({ description: 'Điểm thưởng khi đạt được' })
  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;

  @ApiPropertyOptional({ description: 'Huy hiệu thành tích' })
  @IsOptional()
  @IsString()
  badgeUrl?: string;

  @ApiPropertyOptional({ description: 'Chứng chỉ thành tích' })
  @IsOptional()
  @IsString()
  certificateUrl?: string;

  @ApiPropertyOptional({ description: 'Phần thưởng bổ sung' })
  @IsOptional()
  rewards?: any;

  @ApiPropertyOptional({ description: 'Ảnh minh họa thành tích' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Tags thành tích' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Thống kê thành tích' })
  @IsOptional()
  stats?: any;

  @ApiPropertyOptional({ description: 'Cài đặt thành tích' })
  @IsOptional()
  settings?: any;
}
