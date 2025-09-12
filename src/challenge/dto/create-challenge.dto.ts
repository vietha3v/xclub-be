import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsBoolean, IsNumber, IsUrl, IsDateString, IsArray } from 'class-validator';
import { ChallengeType, ChallengeDifficulty, ChallengeVisibility, ChallengeStatus, ChallengeCategory } from '../entities/challenge.entity';

export class CreateChallengeDto {
  @ApiProperty({ 
    description: 'Tên thử thách',
    example: 'Thử thách chạy 100km trong tháng'
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({ 
    description: 'Mô tả thử thách',
    example: 'Hoàn thành 100km chạy bộ trong vòng 30 ngày'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Loại thử thách',
    enum: ChallengeType,
    default: ChallengeType.DISTANCE
  })
  @IsOptional()
  @IsEnum(ChallengeType)
  type?: ChallengeType;

  @ApiPropertyOptional({ 
    description: 'Độ khó thử thách',
    enum: ChallengeDifficulty,
    default: ChallengeDifficulty.MEDIUM
  })
  @IsOptional()
  @IsEnum(ChallengeDifficulty)
  difficulty?: ChallengeDifficulty;

  @ApiPropertyOptional({ 
    description: 'Quyền riêng tư thử thách',
    enum: ChallengeVisibility,
    default: ChallengeVisibility.PUBLIC
  })
  @IsOptional()
  @IsEnum(ChallengeVisibility)
  visibility?: ChallengeVisibility;

  @ApiPropertyOptional({ 
    description: 'Phân loại thử thách',
    enum: ChallengeCategory,
    default: ChallengeCategory.INDIVIDUAL
  })
  @IsOptional()
  @IsEnum(ChallengeCategory)
  category?: ChallengeCategory;

  @ApiPropertyOptional({ 
    description: 'ID câu lạc bộ tạo thử thách'
  })
  @IsOptional()
  @IsString()
  clubId?: string;

  @ApiPropertyOptional({ 
    description: 'ID sự kiện liên quan'
  })
  @IsOptional()
  @IsString()
  eventId?: string;

  @ApiProperty({ 
    description: 'Thời gian bắt đầu thử thách (ISO 8601)',
    example: '2025-02-01T00:00:00Z'
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({ 
    description: 'Thời gian kết thúc thử thách (ISO 8601)',
    example: '2025-02-28T23:59:59Z'
  })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ 
    description: 'Thời gian đăng ký bắt đầu (ISO 8601)',
    example: '2025-01-25T00:00:00Z'
  })
  @IsOptional()
  @IsDateString()
  registrationStartDate?: string;

  @ApiPropertyOptional({ 
    description: 'Thời gian đăng ký kết thúc (ISO 8601)',
    example: '2025-01-31T23:59:59Z'
  })
  @IsOptional()
  @IsDateString()
  registrationEndDate?: string;

  @ApiPropertyOptional({ 
    description: 'Số lượng người tham gia tối đa',
    example: 100
  })
  @IsOptional()
  @IsNumber()
  maxParticipants?: number;

  @ApiPropertyOptional({ 
    description: 'Số lượng người tham gia tối thiểu',
    example: 10
  })
  @IsOptional()
  @IsNumber()
  minParticipants?: number;

  @ApiPropertyOptional({ 
    description: 'Số lượng thành viên tối đa mỗi team',
    example: 10
  })
  @IsOptional()
  @IsNumber()
  maxTeamMembers?: number;

  @ApiPropertyOptional({ 
    description: 'Số lượng team tối đa',
    example: 20
  })
  @IsOptional()
  @IsNumber()
  maxTeams?: number;

  @ApiPropertyOptional({ 
    description: 'Khoảng cách tối thiểu mỗi tracklog (km)',
    example: 5
  })
  @IsOptional()
  @IsNumber()
  minTracklogDistance?: number;

  @ApiPropertyOptional({ 
    description: 'Khoảng cách tối đa mỗi cá nhân được tính (km)',
    example: 50
  })
  @IsOptional()
  @IsNumber()
  maxIndividualContribution?: number;

  @ApiPropertyOptional({ 
    description: 'Khoảng cách mục tiêu (mét)',
    example: 100000
  })
  @IsOptional()
  @IsNumber()
  targetDistance?: number;

  @ApiPropertyOptional({ 
    description: 'Thời gian mục tiêu (giây)',
    example: 7200
  })
  @IsOptional()
  @IsNumber()
  targetTime?: number;

  @ApiPropertyOptional({ 
    description: 'Số lần thực hiện mục tiêu',
    example: 30
  })
  @IsOptional()
  @IsNumber()
  targetFrequency?: number;

  @ApiPropertyOptional({ 
    description: 'Số ngày liên tiếp mục tiêu',
    example: 7
  })
  @IsOptional()
  @IsNumber()
  targetStreak?: number;

  @ApiProperty({ 
    description: 'Giá trị mục tiêu',
    example: 100
  })
  @IsNumber()
  targetValue: number;

  @ApiProperty({ 
    description: 'Đơn vị mục tiêu',
    example: 'km',
    enum: ['km', 'days', 'pace', 'hours', 'times']
  })
  @IsString()
  targetUnit: string;

  @ApiProperty({ 
    description: 'Giới hạn thời gian (days)',
    example: 30
  })
  @IsNumber()
  timeLimit: number;

  @ApiPropertyOptional({ 
    description: 'Số lần tối thiểu',
    example: 1,
    default: 1
  })
  @IsOptional()
  @IsNumber()
  minOccurrences?: number = 1;

  @ApiPropertyOptional({ 
    description: 'Chuỗi liên tiếp tối thiểu',
    example: 1,
    default: 1
  })
  @IsOptional()
  @IsNumber()
  minStreak?: number = 1;

  @ApiPropertyOptional({ 
    description: 'Khoảng cách tối thiểu mỗi lần (km)',
    example: 5
  })
  @IsOptional()
  @IsNumber()
  minDistance?: number;

  @ApiPropertyOptional({ 
    description: 'Khoảng cách tối đa mỗi lần (km)',
    example: 42
  })
  @IsOptional()
  @IsNumber()
  maxDistance?: number;

  @ApiPropertyOptional({ 
    description: 'ID huy chương liên kết'
  })
  @IsOptional()
  @IsString()
  achievementId?: string;


  @ApiPropertyOptional({ 
    description: 'Điểm thưởng',
    example: 100,
    default: 0
  })
  @IsOptional()
  @IsNumber()
  points?: number = 0;

  @ApiPropertyOptional({ 
    description: 'Có cấp giấy chứng nhận điện tử',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  hasDigitalGiayChungNhan?: boolean;

  @ApiPropertyOptional({ 
    description: 'Điều kiện thử thách (JSON)',
    example: { minPace: 6.0, maxHeartRate: 180 }
  })
  @IsOptional()
  conditions?: any;

  @ApiPropertyOptional({ 
    description: 'Phần thưởng thử thách (JSON)',
    example: { points: 1000, badge: '100km_runner' }
  })
  @IsOptional()
  rewards?: any;

  @ApiPropertyOptional({ 
    description: 'Quy tắc thử thách',
    example: 'Chỉ tính các hoạt động chạy bộ, không tính đi bộ'
  })
  @IsOptional()
  @IsString()
  rules?: string;

  @ApiPropertyOptional({ 
    description: 'Ảnh bìa thử thách',
    example: 'https://example.com/challenge-cover.jpg'
  })
  @IsOptional()
  @IsUrl()
  coverImageUrl?: string;

  @ApiPropertyOptional({ 
    description: 'Tags thử thách',
    example: ['chạy bộ', '100km', 'tháng 2']
  })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional({ 
    description: 'Cho phép đăng ký tự do',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  allowFreeRegistration?: boolean;

  @ApiPropertyOptional({ 
    description: 'Mật khẩu phê duyệt tự động'
  })
  @IsOptional()
  @IsString()
  autoApprovalPassword?: string;

}
