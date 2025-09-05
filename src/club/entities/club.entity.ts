import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClubMember } from './club-member.entity';

export enum ClubStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

export enum ClubType {
  RUNNING = 'running',
  MULTISPORT = 'multisport',
  FITNESS = 'fitness',
  SOCIAL = 'social',
  COMPETITIVE = 'competitive',
  CHARITY = 'charity'
}

@Entity('clubs')
export class Club {
  @ApiProperty({ description: 'ID duy nhất của câu lạc bộ' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Mã câu lạc bộ (duy nhất)' })
  @Column({ unique: true, length: 20 })
  @Index()
  clubCode: string;

  @ApiProperty({ description: 'Tên câu lạc bộ' })
  @Column({ length: 255 })
  name: string;

  @ApiPropertyOptional({ description: 'Tên viết tắt' })
  @Column({ length: 50, nullable: true })
  shortName?: string;

  @ApiPropertyOptional({ description: 'Mô tả câu lạc bộ' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Loại câu lạc bộ' })
  @Column({
    type: 'enum',
    enum: ClubType,
    default: ClubType.RUNNING
  })
  type: ClubType;

  @ApiProperty({ description: 'Trạng thái câu lạc bộ' })
  @Column({
    type: 'enum',
    enum: ClubStatus,
    default: ClubStatus.PENDING
  })
  status: ClubStatus;

  @ApiPropertyOptional({ description: 'Logo câu lạc bộ' })
  @Column({ nullable: true })
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Ảnh bìa câu lạc bộ' })
  @Column({ nullable: true })
  coverImageUrl?: string;

  @ApiPropertyOptional({ description: 'Website chính thức' })
  @Column({ nullable: true })
  website?: string;

  @ApiPropertyOptional({ description: 'Email liên hệ' })
  @Column({ nullable: true })
  email?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại liên hệ' })
  @Column({ nullable: true })
  phone?: string;

  @ApiPropertyOptional({ description: 'Địa chỉ trụ sở' })
  @Column({ type: 'text', nullable: true })
  address?: string;

  @ApiPropertyOptional({ description: 'Thành phố' })
  @Column({ length: 100, nullable: true })
  city?: string;

  @ApiPropertyOptional({ description: 'Tỉnh/Thành phố' })
  @Column({ length: 100, nullable: true })
  state?: string;

  @ApiPropertyOptional({ description: 'Quốc gia' })
  @Column({ length: 100, nullable: true })
  country?: string;

  @ApiPropertyOptional({ description: 'Mã bưu điện' })
  @Column({ length: 20, nullable: true })
  postalCode?: string;

  @ApiPropertyOptional({ description: 'Vĩ độ' })
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @ApiPropertyOptional({ description: 'Kinh độ' })
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: number;

  @ApiPropertyOptional({ description: 'Thời gian thành lập' })
  @Column({ type: 'timestamp', nullable: true })
  foundedAt?: Date;

  @ApiPropertyOptional({ description: 'Số lượng thành viên tối đa' })
  @Column({ type: 'int', nullable: true })
  maxMembers?: number;

  @ApiPropertyOptional({ description: 'Phí thành viên hàng tháng (VND)' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  monthlyFee?: number;

  @ApiPropertyOptional({ description: 'Phí thành viên hàng năm (VND)' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  yearlyFee?: number;

  @ApiPropertyOptional({ description: 'Quy tắc câu lạc bộ' })
  @Column({ type: 'text', nullable: true })
  rules?: string;

  @ApiPropertyOptional({ description: 'Lịch hoạt động' })
  @Column({ type: 'text', nullable: true })
  schedule?: string;

  @ApiPropertyOptional({ description: 'Thông tin liên hệ khác' })
  @Column({ type: 'jsonb', nullable: true })
  contactInfo?: any;

  @ApiPropertyOptional({ description: 'Mạng xã hội' })
  @Column({ type: 'jsonb', nullable: true })
  socialMedia?: any;

  @ApiPropertyOptional({ description: 'Cài đặt câu lạc bộ' })
  @Column({ type: 'jsonb', nullable: true })
  settings?: any;

  @ApiProperty({ description: 'Công khai hay riêng tư' })
  @Column({ default: true })
  isPublic: boolean;

  @ApiProperty({ description: 'Cho phép đăng ký thành viên mới' })
  @Column({ default: true })
  allowNewMembers: boolean;

  @ApiProperty({ description: 'Yêu cầu phê duyệt thành viên mới' })
  @Column({ default: false })
  requireApproval: boolean;

  @ApiProperty({ description: 'Trạng thái xóa mềm' })
  @Column({ default: false })
  isDeleted: boolean;

  @ApiPropertyOptional({ description: 'Thời gian xóa' })
  @Column({ type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @ApiPropertyOptional({ description: 'Người xóa' })
  @Column({ nullable: true })
  deletedBy?: string;

  @ApiProperty({ description: 'Thời gian tạo' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Thời gian cập nhật' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => ClubMember, member => member.club)
  members: ClubMember[];

  // Virtual properties for statistics
  get memberCount(): number {
    return this.members?.filter(m => m.status === 'active').length || 0;
  }

  get adminCount(): number {
    return this.members?.filter(m => m.role === 'admin' && m.status === 'active').length || 0;
  }

  get moderatorCount(): number {
    return this.members?.filter(m => m.role === 'moderator' && m.status === 'active').length || 0;
  }
}
