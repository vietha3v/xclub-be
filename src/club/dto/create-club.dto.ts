import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsBoolean, IsNumber, IsUrl, IsDateString } from 'class-validator';
import { ClubType, ClubStatus } from '../entities/club.entity';

export class CreateClubDto {
  @ApiProperty({ 
    description: 'Tên câu lạc bộ',
    example: 'Câu lạc bộ chạy bộ Hà Nội'
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({ 
    description: 'Tên viết tắt',
    example: 'CLB HB HN'
  })
  @IsOptional()
  @IsString()
  shortName?: string;

  @ApiPropertyOptional({ 
    description: 'Mô tả câu lạc bộ',
    example: 'Câu lạc bộ dành cho những người yêu thích chạy bộ tại Hà Nội'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Loại câu lạc bộ',
    enum: ClubType,
    default: ClubType.RUNNING
  })
  @IsOptional()
  @IsEnum(ClubType)
  type?: ClubType;

  @ApiPropertyOptional({ 
    description: 'Logo câu lạc bộ',
    example: 'https://example.com/logo.png'
  })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({ 
    description: 'Ảnh bìa câu lạc bộ',
    example: 'https://example.com/cover.jpg'
  })
  @IsOptional()
  @IsUrl()
  coverImageUrl?: string;

  @ApiPropertyOptional({ 
    description: 'Website chính thức',
    example: 'https://example.com'
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ 
    description: 'Email liên hệ',
    example: 'contact@example.com'
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ 
    description: 'Số điện thoại liên hệ',
    example: '0123456789'
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ 
    description: 'Địa chỉ trụ sở',
    example: '123 Đường ABC, Quận XYZ'
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ 
    description: 'Thành phố',
    example: 'Hà Nội'
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ 
    description: 'Tỉnh/Thành phố',
    example: 'Hà Nội'
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ 
    description: 'Quốc gia',
    example: 'Việt Nam'
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ 
    description: 'Mã bưu điện',
    example: '100000'
  })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({ 
    description: 'Vĩ độ',
    example: 21.0285
  })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ 
    description: 'Kinh độ',
    example: 105.8542
  })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ 
    description: 'Thời gian thành lập (ISO 8601)',
    example: '2020-01-01T00:00:00Z'
  })
  @IsOptional()
  @IsDateString()
  foundedAt?: string;

  @ApiPropertyOptional({ 
    description: 'Số lượng thành viên tối đa',
    example: 100
  })
  @IsOptional()
  @IsNumber()
  maxMembers?: number;

  @ApiPropertyOptional({ 
    description: 'Phí thành viên hàng tháng (VND)',
    example: 50000
  })
  @IsOptional()
  @IsNumber()
  monthlyFee?: number;

  @ApiPropertyOptional({ 
    description: 'Phí thành viên hàng năm (VND)',
    example: 500000
  })
  @IsOptional()
  @IsNumber()
  yearlyFee?: number;

  @ApiPropertyOptional({ 
    description: 'Quy tắc câu lạc bộ',
    example: 'Tuân thủ luật giao thông, hỗ trợ lẫn nhau...'
  })
  @IsOptional()
  @IsString()
  rules?: string;

  @ApiPropertyOptional({ 
    description: 'Lịch hoạt động',
    example: 'Thứ 3, 5, 7: 6h sáng tại công viên'
  })
  @IsOptional()
  @IsString()
  schedule?: string;

  @ApiPropertyOptional({ 
    description: 'Công khai hay riêng tư',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ 
    description: 'Cho phép đăng ký thành viên mới',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  allowNewMembers?: boolean;

  @ApiPropertyOptional({ 
    description: 'Yêu cầu phê duyệt thành viên mới',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  requireApproval?: boolean;
}
