import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsDateString, 
  IsInt, 
  IsNumber, 
  IsBoolean,
  IsArray,
  IsUUID,
  Length,
  Min,
  Max
} from 'class-validator';
import { RaceType, RaceVisibility } from '../entities/race.entity';

export class CreateRaceDto {
  @ApiProperty({ 
    description: 'Tên giải chạy',
    example: 'Hà Nội Marathon 2024',
    maxLength: 255
  })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiPropertyOptional({ 
    description: 'Mô tả giải chạy',
    example: 'Giải chạy marathon hàng năm tại Hà Nội với nhiều cự ly khác nhau'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    description: 'Loại giải chạy',
    enum: RaceType,
    example: RaceType.MARATHON
  })
  @IsEnum(RaceType)
  type: RaceType;

  @ApiProperty({ 
    description: 'Quyền riêng tư giải chạy',
    enum: RaceVisibility,
    example: RaceVisibility.PUBLIC
  })
  @IsEnum(RaceVisibility)
  visibility: RaceVisibility;

  @ApiPropertyOptional({ 
    description: 'ID câu lạc bộ tổ chức',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsOptional()
  @IsUUID()
  clubId?: string;

  @ApiProperty({ 
    description: 'Thời gian bắt đầu giải chạy',
    example: '2024-12-15T06:00:00.000Z'
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({ 
    description: 'Thời gian kết thúc giải chạy',
    example: '2024-12-15T18:00:00.000Z'
  })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ 
    description: 'Thời gian đăng ký bắt đầu',
    example: '2024-11-01T00:00:00.000Z'
  })
  @IsOptional()
  @IsDateString()
  registrationStartDate?: string;

  @ApiPropertyOptional({ 
    description: 'Thời gian đăng ký kết thúc',
    example: '2024-12-10T23:59:59.000Z'
  })
  @IsOptional()
  @IsDateString()
  registrationEndDate?: string;

  @ApiPropertyOptional({ 
    description: 'Số lượng người tham gia tối đa',
    example: 1000,
    minimum: 1
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxParticipants?: number;

  @ApiPropertyOptional({ 
    description: 'Số lượng người tham gia tối thiểu',
    example: 10,
    minimum: 1
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  minParticipants?: number;

  @ApiPropertyOptional({ 
    description: 'Khoảng cách chính (mét)',
    example: 42195,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  mainDistance?: number;

  @ApiPropertyOptional({ 
    description: 'Khoảng cách phụ (mét)',
    example: [5000, 10000, 21097.5],
    type: [Number]
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  additionalDistances?: number[];

  @ApiPropertyOptional({ 
    description: 'Thời gian giới hạn (giây)',
    example: 14400,
    minimum: 0
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  timeLimit?: number;

  @ApiPropertyOptional({ 
    description: 'Địa điểm xuất phát',
    example: 'Hồ Tây, Hà Nội'
  })
  @IsOptional()
  @IsString()
  startLocation?: string;

  @ApiPropertyOptional({ 
    description: 'Địa điểm kết thúc',
    example: 'Hồ Tây, Hà Nội'
  })
  @IsOptional()
  @IsString()
  finishLocation?: string;

  @ApiPropertyOptional({ 
    description: 'Tọa độ xuất phát (latitude)',
    example: 21.0285,
    minimum: -90,
    maximum: 90
  })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  startLatitude?: number;

  @ApiPropertyOptional({ 
    description: 'Tọa độ xuất phát (longitude)',
    example: 105.8542,
    minimum: -180,
    maximum: 180
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  startLongitude?: number;

  @ApiPropertyOptional({ 
    description: 'Tọa độ kết thúc (latitude)',
    example: 21.0285,
    minimum: -90,
    maximum: 90
  })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  finishLatitude?: number;

  @ApiPropertyOptional({ 
    description: 'Tọa độ kết thúc (longitude)',
    example: 105.8542,
    minimum: -180,
    maximum: 180
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  finishLongitude?: number;

  @ApiPropertyOptional({ 
    description: 'Địa chỉ chi tiết',
    example: 'Đường Lạc Long Quân, Quận Tây Hồ, Hà Nội'
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ 
    description: 'Phí đăng ký',
    example: 500000,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  registrationFee?: number;

  @ApiPropertyOptional({ 
    description: 'Đơn vị tiền tệ',
    example: 'VND',
    default: 'VND'
  })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional({ 
    description: 'Quy tắc giải chạy',
    example: 'Người tham gia phải tuân thủ quy tắc giao thông và an toàn'
  })
  @IsOptional()
  @IsString()
  rules?: string;

  @ApiPropertyOptional({ 
    description: 'Yêu cầu tham gia',
    example: 'Người tham gia phải có sức khỏe tốt và trên 18 tuổi'
  })
  @IsOptional()
  @IsString()
  requirements?: string;

  @ApiPropertyOptional({ 
    description: 'Ảnh bìa giải chạy',
    example: 'https://example.com/race-cover.jpg'
  })
  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @ApiPropertyOptional({ 
    description: 'Ảnh bổ sung',
    example: ['https://example.com/race1.jpg', 'https://example.com/race2.jpg'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  additionalImages?: string[];

  @ApiPropertyOptional({ 
    description: 'Tags giải chạy',
    example: ['marathon', 'hanoi', 'charity'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ 
    description: 'Cho phép đăng ký',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  allowRegistration?: boolean;

  @ApiPropertyOptional({ 
    description: 'Yêu cầu phê duyệt tham gia',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  requireApproval?: boolean;

  @ApiPropertyOptional({ 
    description: 'Cho phép rút lui',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  allowWithdrawal?: boolean;
}
