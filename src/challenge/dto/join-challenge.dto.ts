import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class JoinChallengeDto {
  @ApiPropertyOptional({ 
    description: 'Mật khẩu phê duyệt tự động',
    example: 'mySecretPassword123'
  })
  @IsOptional()
  @IsString()
  autoApprovalPassword?: string;
}
