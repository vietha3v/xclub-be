import { ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsOptional, 
  IsEnum, 
  IsString, 
  IsInt, 
  IsDateString,
  IsUUID,
  Min,
  Max
} from 'class-validator';
import { Transform } from 'class-transformer';
import { RaceType, RaceStatus, RaceVisibility } from '../entities/race.entity';

export class QueryRaceDto {
  @ApiPropertyOptional({ 
    description: 'Trang hiện tại',
    example: 1,
    minimum: 1,
    default: 1
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ 
    description: 'Số lượng item mỗi trang',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ 
    description: 'Từ khóa tìm kiếm',
    example: 'marathon hanoi'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ 
    description: 'Loại giải chạy',
    enum: RaceType
  })
  @IsOptional()
  @IsEnum(RaceType)
  type?: RaceType;

  @ApiPropertyOptional({ 
    description: 'Trạng thái giải chạy',
    enum: RaceStatus
  })
  @IsOptional()
  @IsEnum(RaceStatus)
  status?: RaceStatus;

  @ApiPropertyOptional({ 
    description: 'Quyền riêng tư giải chạy',
    enum: RaceVisibility
  })
  @IsOptional()
  @IsEnum(RaceVisibility)
  visibility?: RaceVisibility;

  @ApiPropertyOptional({ 
    description: 'ID câu lạc bộ',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsOptional()
  @IsUUID()
  clubId?: string;

  @ApiPropertyOptional({ 
    description: 'ID người tạo',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsOptional()
  @IsUUID()
  createdBy?: string;

  @ApiPropertyOptional({ 
    description: 'Ngày bắt đầu từ',
    example: '2024-01-01T00:00:00.000Z'
  })
  @IsOptional()
  @IsDateString()
  startDateFrom?: string;

  @ApiPropertyOptional({ 
    description: 'Ngày bắt đầu đến',
    example: '2024-12-31T23:59:59.000Z'
  })
  @IsOptional()
  @IsDateString()
  startDateTo?: string;

  @ApiPropertyOptional({ 
    description: 'Khoảng cách tối thiểu (mét)',
    example: 5000,
    minimum: 0
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsInt()
  @Min(0)
  minDistance?: number;

  @ApiPropertyOptional({ 
    description: 'Khoảng cách tối đa (mét)',
    example: 42195,
    minimum: 0
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsInt()
  @Min(0)
  maxDistance?: number;

  @ApiPropertyOptional({ 
    description: 'Phí đăng ký tối thiểu',
    example: 0,
    minimum: 0
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsInt()
  @Min(0)
  minFee?: number;

  @ApiPropertyOptional({ 
    description: 'Phí đăng ký tối đa',
    example: 1000000,
    minimum: 0
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsInt()
  @Min(0)
  maxFee?: number;

  @ApiPropertyOptional({ 
    description: 'Sắp xếp theo',
    example: 'startDate',
    enum: ['startDate', 'createdAt', 'name', 'registrationFee', 'maxParticipants']
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'startDate';

  @ApiPropertyOptional({ 
    description: 'Thứ tự sắp xếp',
    example: 'ASC',
    enum: ['ASC', 'DESC']
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'ASC';

  @ApiPropertyOptional({ 
    description: 'Chỉ lấy giải chạy sắp diễn ra',
    example: true
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  upcoming?: boolean;

  @ApiPropertyOptional({ 
    description: 'Chỉ lấy giải chạy đang mở đăng ký',
    example: true
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  registrationOpen?: boolean;
}
