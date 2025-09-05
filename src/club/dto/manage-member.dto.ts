import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsEnum, IsOptional, IsString, IsBoolean } from 'class-validator';
import { MemberRole, MemberStatus } from '../entities/club-member.entity';

export class AddMemberDto {
  @ApiProperty({ description: 'ID người dùng cần thêm vào câu lạc bộ' })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ description: 'Vai trò trong câu lạc bộ', enum: MemberRole })
  @IsOptional()
  @IsEnum(MemberRole)
  role?: MemberRole = MemberRole.MEMBER;

  @ApiPropertyOptional({ description: 'Ghi chú về thành viên' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateMemberRoleDto {
  @ApiProperty({ description: 'Vai trò mới', enum: MemberRole })
  @IsEnum(MemberRole)
  role: MemberRole;

  @ApiPropertyOptional({ description: 'Ghi chú về việc thay đổi vai trò' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateMemberStatusDto {
  @ApiProperty({ description: 'Trạng thái mới', enum: MemberStatus })
  @IsEnum(MemberStatus)
  status: MemberStatus;

  @ApiPropertyOptional({ description: 'Lý do thay đổi trạng thái' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'Ghi chú bổ sung' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class TransferAdminDto {
  @ApiProperty({ description: 'ID thành viên sẽ nhận quyền admin' })
  @IsUUID()
  newAdminUserId: string;

  @ApiPropertyOptional({ description: 'Xác nhận chuyển giao quyền' })
  @IsOptional()
  @IsBoolean()
  confirmTransfer?: boolean = false;

  @ApiPropertyOptional({ description: 'Ghi chú về việc chuyển giao quyền' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RemoveMemberDto {
  @ApiPropertyOptional({ description: 'Lý do rời câu lạc bộ' })
  @IsOptional()
  @IsString()
  leaveReason?: string;

  @ApiPropertyOptional({ description: 'Ghi chú bổ sung' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class MemberResponseDto {
  @ApiProperty({ description: 'ID thành viên' })
  id: string;

  @ApiProperty({ description: 'ID câu lạc bộ' })
  clubId: string;

  @ApiProperty({ description: 'ID người dùng' })
  userId: string;

  @ApiProperty({ description: 'Vai trò trong câu lạc bộ', enum: MemberRole })
  role: MemberRole;

  @ApiProperty({ description: 'Trạng thái thành viên', enum: MemberStatus })
  status: MemberStatus;

  @ApiProperty({ description: 'Thời gian tham gia' })
  joinedAt: Date;

  @ApiPropertyOptional({ description: 'Thời gian rời câu lạc bộ' })
  leftAt?: Date;

  @ApiPropertyOptional({ description: 'Lý do rời câu lạc bộ' })
  leaveReason?: string;

  @ApiPropertyOptional({ description: 'Ghi chú' })
  notes?: string;

  @ApiPropertyOptional({ description: 'Thông tin bổ sung' })
  metadata?: any;

  // User information
  @ApiPropertyOptional({ description: 'Thông tin người dùng' })
  user?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    email: string;
  };
}
