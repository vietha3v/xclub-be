import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateProgressDto {
  @ApiProperty({ 
    description: 'Tiến độ mới',
    example: 25.5
  })
  @IsNumber()
  @Min(0)
  progress: number;

  @ApiPropertyOptional({ 
    description: 'ID hoạt động liên quan',
    example: 'uuid-cua-activity'
  })
  @IsOptional()
  @IsString()
  activityId?: string;
}
