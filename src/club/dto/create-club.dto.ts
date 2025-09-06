import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsBoolean, IsNumber, IsDateString, IsEmail, IsPhoneNumber, IsPostalCode, Min, Max, Length, Matches } from 'class-validator';
import { ClubType, ClubStatus } from '../entities/club.entity';

export class CreateClubDto {
  @ApiProperty({ 
    description: 'Tên câu lạc bộ',
    example: 'Câu lạc bộ chạy bộ Hà Nội'
  })
  @IsString()
  @Length(2, 100, { message: 'Tên CLB phải từ 2 đến 100 ký tự' })
  name: string;

  @ApiPropertyOptional({ 
    description: 'Tên viết tắt',
    example: 'CLB HB HN'
  })
  @IsOptional()
  @IsString()
  @Length(0, 50, { message: 'Tên viết tắt không được vượt quá 50 ký tự' })
  shortName?: string;

  @ApiPropertyOptional({ 
    description: 'Mô tả câu lạc bộ',
    example: 'Câu lạc bộ dành cho những người yêu thích chạy bộ tại Hà Nội'
  })
  @IsOptional()
  @IsString()
  @Length(0, 500, { message: 'Mô tả không được vượt quá 500 ký tự' })
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
  @IsString()
  @Matches(/^https?:\/\/.+/, { message: 'Logo URL phải là địa chỉ hợp lệ' })
  logoUrl?: string;

  @ApiPropertyOptional({ 
    description: 'Ảnh bìa câu lạc bộ',
    example: 'https://example.com/cover.jpg'
  })
  @IsOptional()
  @IsString()
  @Matches(/^https?:\/\/.+/, { message: 'Ảnh bìa URL phải là địa chỉ hợp lệ' })
  coverImageUrl?: string;

  @ApiPropertyOptional({ 
    description: 'Website chính thức',
    example: 'https://example.com'
  })
  @IsOptional()
  @IsString()
  @Matches(/^https?:\/\/.+/, { message: 'Website phải là địa chỉ hợp lệ' })
  website?: string;

  @ApiPropertyOptional({ 
    description: 'Email liên hệ',
    example: 'contact@example.com'
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @ApiPropertyOptional({ 
    description: 'Số điện thoại liên hệ',
    example: '0123456789'
  })
  @IsOptional()
  @IsString()
  @Matches(/^(\+84|84|0)[1-9][0-9]{8,9}$/, { message: 'Số điện thoại không hợp lệ' })
  phone?: string;

  @ApiPropertyOptional({ 
    description: 'Địa chỉ trụ sở',
    example: '123 Đường ABC, Quận XYZ'
  })
  @IsOptional()
  @IsString()
  @Length(0, 200, { message: 'Địa chỉ không được vượt quá 200 ký tự' })
  address?: string;

  @ApiPropertyOptional({ 
    description: 'Thành phố',
    example: 'Hà Nội'
  })
  @IsOptional()
  @IsString()
  @Length(0, 100, { message: 'Tên thành phố không được vượt quá 100 ký tự' })
  city?: string;

  @ApiPropertyOptional({ 
    description: 'Tỉnh/Thành phố',
    example: 'Hà Nội'
  })
  @IsOptional()
  @IsString()
  @Length(0, 100, { message: 'Tên tỉnh/thành phố không được vượt quá 100 ký tự' })
  state?: string;

  @ApiPropertyOptional({ 
    description: 'Quốc gia',
    example: 'Việt Nam'
  })
  @IsOptional()
  @IsString()
  @Length(0, 100, { message: 'Tên quốc gia không được vượt quá 100 ký tự' })
  country?: string;

  @ApiPropertyOptional({ 
    description: 'Mã bưu điện',
    example: '100000'
  })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{5,6}$/, { message: 'Mã bưu điện phải có 5-6 chữ số' })
  postalCode?: string;

  @ApiPropertyOptional({ 
    description: 'Vĩ độ',
    example: 21.0285
  })
  @IsOptional()
  @IsNumber({}, { message: 'Vĩ độ phải là số' })
  @Min(-90, { message: 'Vĩ độ phải từ -90 đến 90' })
  @Max(90, { message: 'Vĩ độ phải từ -90 đến 90' })
  latitude?: number;

  @ApiPropertyOptional({ 
    description: 'Kinh độ',
    example: 105.8542
  })
  @IsOptional()
  @IsNumber({}, { message: 'Kinh độ phải là số' })
  @Min(-180, { message: 'Kinh độ phải từ -180 đến 180' })
  @Max(180, { message: 'Kinh độ phải từ -180 đến 180' })
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
  @IsNumber({}, { message: 'Số thành viên tối đa phải là số' })
  @Min(1, { message: 'Số thành viên tối đa phải lớn hơn 0' })
  @Max(10000, { message: 'Số thành viên tối đa không được vượt quá 10,000' })
  maxMembers?: number;

  @ApiPropertyOptional({ 
    description: 'Phí thành viên hàng tháng (VND)',
    example: 50000
  })
  @IsOptional()
  @IsNumber({}, { message: 'Phí hàng tháng phải là số' })
  @Min(0, { message: 'Phí hàng tháng không được âm' })
  @Max(10000000, { message: 'Phí hàng tháng không được vượt quá 10,000,000 VND' })
  monthlyFee?: number;

  @ApiPropertyOptional({ 
    description: 'Phí thành viên hàng năm (VND)',
    example: 500000
  })
  @IsOptional()
  @IsNumber({}, { message: 'Phí hàng năm phải là số' })
  @Min(0, { message: 'Phí hàng năm không được âm' })
  @Max(100000000, { message: 'Phí hàng năm không được vượt quá 100,000,000 VND' })
  yearlyFee?: number;

  @ApiPropertyOptional({ 
    description: 'Quy tắc câu lạc bộ',
    example: 'Tuân thủ luật giao thông, hỗ trợ lẫn nhau...'
  })
  @IsOptional()
  @IsString()
  @Length(0, 2000, { message: 'Quy tắc không được vượt quá 2000 ký tự' })
  rules?: string;

  @ApiPropertyOptional({ 
    description: 'Lịch hoạt động',
    example: 'Thứ 3, 5, 7: 6h sáng tại công viên'
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000, { message: 'Lịch hoạt động không được vượt quá 1000 ký tự' })
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
