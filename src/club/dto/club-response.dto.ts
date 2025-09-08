import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClubStatus, ClubType } from '../entities/club.entity';
import { MemberRole } from '../entities/club-member.entity';

export class ClubResponseDto {
  @ApiProperty({ description: 'ID duy nhất của câu lạc bộ' })
  id: string;

  @ApiProperty({ description: 'Mã câu lạc bộ (duy nhất)' })
  clubCode: string;

  @ApiProperty({ description: 'Tên câu lạc bộ' })
  name: string;

  @ApiPropertyOptional({ description: 'Tên viết tắt' })
  shortName?: string;

  @ApiPropertyOptional({ description: 'Mô tả câu lạc bộ' })
  description?: string;

  @ApiProperty({ description: 'Loại câu lạc bộ' })
  type: ClubType;

  @ApiProperty({ description: 'Trạng thái câu lạc bộ' })
  status: ClubStatus;

  @ApiPropertyOptional({ description: 'Logo câu lạc bộ' })
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Ảnh bìa câu lạc bộ' })
  coverImageUrl?: string;

  @ApiPropertyOptional({ description: 'Website chính thức' })
  website?: string;

  @ApiPropertyOptional({ description: 'Email liên hệ' })
  email?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại liên hệ' })
  phone?: string;

  @ApiPropertyOptional({ description: 'Địa chỉ trụ sở' })
  address?: string;

  @ApiPropertyOptional({ description: 'Thành phố' })
  city?: string;

  @ApiPropertyOptional({ description: 'Tỉnh/Thành phố' })
  state?: string;

  @ApiPropertyOptional({ description: 'Quốc gia' })
  country?: string;

  @ApiPropertyOptional({ description: 'Mã bưu điện' })
  postalCode?: string;

  @ApiPropertyOptional({ description: 'Vĩ độ' })
  latitude?: number;

  @ApiPropertyOptional({ description: 'Kinh độ' })
  longitude?: number;

  @ApiPropertyOptional({ description: 'Thời gian thành lập' })
  foundedAt?: Date;

  @ApiPropertyOptional({ description: 'Số lượng thành viên tối đa' })
  maxMembers?: number;

  @ApiPropertyOptional({ description: 'Phí thành viên hàng tháng (VND)' })
  monthlyFee?: number;

  @ApiPropertyOptional({ description: 'Phí thành viên hàng năm (VND)' })
  yearlyFee?: number;

  @ApiPropertyOptional({ description: 'Quy tắc câu lạc bộ' })
  rules?: string;

  @ApiPropertyOptional({ description: 'Lịch hoạt động' })
  schedule?: string;

  @ApiPropertyOptional({ description: 'Thông tin liên hệ khác' })
  contactInfo?: any;

  @ApiPropertyOptional({ description: 'Mạng xã hội' })
  socialMedia?: any;

  @ApiPropertyOptional({ description: 'Cài đặt câu lạc bộ' })
  settings?: any;

  @ApiProperty({ description: 'Cho phép đăng ký thành viên mới' })
  allowNewMembers: boolean;

  @ApiProperty({ description: 'Yêu cầu phê duyệt thành viên mới' })
  requireApproval: boolean;

  @ApiProperty({ description: 'Thời gian tạo' })
  createdAt: Date;

  @ApiProperty({ description: 'Thời gian cập nhật' })
  updatedAt: Date;

  // User-specific fields
  @ApiPropertyOptional({ description: 'Vai trò của người dùng hiện tại trong CLB' })
  userRole?: MemberRole[] | null;

  // Statistics
  @ApiProperty({ description: 'Số lượng thành viên' })
  memberCount: number;

  @ApiProperty({ description: 'Số lượng admin' })
  adminCount: number;

  @ApiProperty({ description: 'Số lượng moderator' })
  moderatorCount: number;

  @ApiProperty({ description: 'Số lượng sự kiện' })
  eventCount: number;

  @ApiProperty({ description: 'Số lượng thử thách' })
  challengeCount: number;

  // Related data
  @ApiPropertyOptional({ description: 'Danh sách thành viên' })
  members?: any[];

  @ApiPropertyOptional({ description: 'Danh sách sự kiện' })
  events?: any[];

  @ApiPropertyOptional({ description: 'Danh sách thử thách' })
  challenges?: any[];
}
