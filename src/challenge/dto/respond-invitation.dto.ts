import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { InvitationStatus } from '../entities/challenge-invitation.entity';

export class RespondInvitationDto {
  @ApiProperty({ 
    description: 'Trạng thái phản hồi',
    enum: InvitationStatus,
    example: InvitationStatus.ACCEPTED
  })
  @IsEnum(InvitationStatus)
  status: InvitationStatus;
}
