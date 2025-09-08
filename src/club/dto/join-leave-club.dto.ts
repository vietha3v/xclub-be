import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class JoinClubDto {
  @ApiPropertyOptional({ 
    description: 'Lời nhắn khi tham gia CLB',
    example: 'Tôi muốn tham gia CLB để cải thiện kỹ năng chạy bộ'
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ 
    description: 'Xác nhận tham gia CLB',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  confirmJoin?: boolean = true;
}

export class LeaveClubDto {
  @ApiPropertyOptional({ 
    description: 'Lý do rời CLB',
    example: 'Không có thời gian tham gia hoạt động'
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ 
    description: 'Xác nhận rời CLB',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  confirmLeave?: boolean = true;
}

export class JoinClubResponseDto {
  @ApiProperty({ description: 'Thông báo kết quả' })
  message: string;

  @ApiProperty({ description: 'Trạng thái thành viên sau khi tham gia' })
  status: 'active' | 'pending';

  @ApiProperty({ description: 'Vai trò trong CLB' })
  role: 'admin' | 'moderator' | 'member';

  @ApiProperty({ description: 'Thời gian tham gia' })
  joinedAt: Date;

  @ApiPropertyOptional({ description: 'Ghi chú từ admin (nếu cần approval)' })
  adminNote?: string;
}

export class LeaveClubResponseDto {
  @ApiProperty({ description: 'Thông báo kết quả' })
  message: string;

  @ApiProperty({ description: 'Thời gian rời CLB' })
  leftAt: Date;

  @ApiPropertyOptional({ description: 'Lý do rời CLB' })
  reason?: string;
}
