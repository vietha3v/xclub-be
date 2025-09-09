import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsOptional, IsDateString } from 'class-validator';

export class SendInvitationDto {
  @ApiProperty({ 
    description: 'ID câu lạc bộ được mời',
    example: 'uuid-cua-club'
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  clubId: string;

  @ApiPropertyOptional({ 
    description: 'Thời gian hết hạn lời mời',
    example: '2024-12-31T23:59:59Z'
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
