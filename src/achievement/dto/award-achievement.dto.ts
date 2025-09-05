import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsNumber, IsDateString } from 'class-validator';

export class AwardAchievementDto {
  @ApiProperty({ description: 'ID của thành tích' })
  @IsUUID()
  achievementId: string;

  @ApiProperty({ description: 'ID của người dùng' })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ description: 'Giá trị đạt được' })
  @IsOptional()
  @IsNumber()
  achievedValue?: number;

  @ApiPropertyOptional({ description: 'Thời gian đạt được' })
  @IsOptional()
  @IsDateString()
  achievedAt?: Date;

  @ApiPropertyOptional({ description: 'Thông tin bổ sung' })
  @IsOptional()
  metadata?: any;

  @ApiPropertyOptional({ description: 'Ghi chú' })
  @IsOptional()
  @IsString()
  notes?: string;
}
