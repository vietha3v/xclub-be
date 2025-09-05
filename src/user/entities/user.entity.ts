import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Activity } from '../../activity/entities/activity.entity';

export enum UserRole {
  RUNNER = 'runner',
  CLUB_MEMBER = 'club_member',
  CLUB_ADMIN = 'club_admin',
  EVENT_ORGANIZER = 'event_organizer',
  RACE_ORGANIZER = 'race_organizer',
  SYSTEM_ADMIN = 'system_admin',
  ENTERPRISE = 'enterprise'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  BANNED = 'banned'
}

export enum UserGender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
}

export enum UserExperience {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

@Entity('users')
export class User {
  @ApiProperty({ description: 'ID duy nhất của người dùng' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Username đăng nhập (duy nhất)' })
  @Column({ unique: true, nullable: false, length: 50 })
  @Index()
  username: string;

  @ApiProperty({ description: 'Email đăng nhập (duy nhất)' })
  @Column({ unique: true, nullable: false })
  @Index()
  email: string;

  @ApiProperty({ description: 'Mật khẩu đã mã hóa' })
  @Column({ nullable: false })
  @Exclude()
  password: string;

  @ApiPropertyOptional({ description: 'Số điện thoại' })
  @Column({ nullable: true })
  phoneNumber?: string;

  @ApiProperty({ description: 'Tên người dùng' })
  @Column({ nullable: false })
  firstName: string;

  @ApiProperty({ description: 'Họ người dùng' })
  @Column({ nullable: false })
  lastName: string;

  @ApiPropertyOptional({ description: 'Ngày sinh (ISO 8601: YYYY-MM-DD)' })
  @Column({ nullable: true, type: 'timestamp' })
  dateOfBirth?: Date;

  @ApiPropertyOptional({ description: 'Giới tính' })
  @Column({ 
    type: 'enum', 
    enum: UserGender, 
    nullable: true 
  })
  gender?: UserGender;

  @ApiPropertyOptional({ description: 'URL avatar' })
  @Column({ nullable: true })
  avatar?: string;

  @ApiPropertyOptional({ description: 'Chiều cao (cm)' })
  @Column({ nullable: true, type: 'int' })
  height?: number;

  @ApiPropertyOptional({ description: 'Cân nặng (kg)' })
  @Column({ nullable: true, type: 'decimal', precision: 5, scale: 2 })
  weight?: number;

  @ApiProperty({ description: 'Kinh nghiệm chạy bộ (mặc định: beginner)' })
  @Column({ 
    type: 'enum', 
    enum: UserExperience, 
    default: UserExperience.BEGINNER 
  })
  experience: UserExperience = UserExperience.BEGINNER;

  @ApiProperty({ description: 'Trạng thái tài khoản (mặc định: active)' })
  @Column({ 
    type: 'enum', 
    enum: UserStatus, 
    default: UserStatus.ACTIVE 
  })
  status: UserStatus = UserStatus.ACTIVE;

  @ApiPropertyOptional({ description: 'Tiểu sử cá nhân' })
  @Column({ nullable: true })
  bio?: string;

  @ApiPropertyOptional({ description: 'Địa điểm' })
  @Column({ nullable: true })
  location?: string;

  @ApiPropertyOptional({ description: 'Vĩ độ' })
  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 7 })
  latitude?: number;

  @ApiPropertyOptional({ description: 'Kinh độ' })
  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 7 })
  longitude?: number;

  @ApiPropertyOptional({ description: 'Múi giờ' })
  @Column({ nullable: true })
  timezone?: string;

  @ApiPropertyOptional({ description: 'Ngôn ngữ ưa thích' })
  @Column({ nullable: true })
  language?: string;

  @ApiPropertyOptional({ description: 'Đơn vị tiền tệ' })
  @Column({ nullable: true })
  currency?: string;

  @ApiPropertyOptional({ description: 'Đơn vị đo lường (metric/imperial)' })
  @Column({ nullable: true })
  units?: string;

  @ApiProperty({ description: 'Tài khoản đã xác thực' })
  @Column({ default: false })
  isVerified: boolean;

  @ApiProperty({ description: 'Hồ sơ công khai' })
  @Column({ default: false })
  isPublic: boolean;

  @ApiPropertyOptional({ description: 'Lần đăng nhập cuối (ISO 8601)' })
  @Column({ nullable: true, type: 'timestamp' })
  lastLoginAt?: Date;

  @ApiPropertyOptional({ description: 'Hoạt động cuối cùng (ISO 8601)' })
  @Column({ nullable: true, type: 'timestamp' })
  lastActivityAt?: Date;

  @ApiProperty({ description: 'Thời gian tạo tài khoản (ISO 8601)' })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Thời gian cập nhật cuối (ISO 8601)' })
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Danh sách vai trò (mặc định: runner)' })
  @Column('simple-array', { default: ['runner'] })
  roles: string[];

  @ApiPropertyOptional({ description: 'Gói đăng ký' })
  @Column({ nullable: true })
  subscriptionPlan?: string;

  @ApiPropertyOptional({ description: 'Trạng thái đăng ký' })
  @Column({ nullable: true })
  subscriptionStatus?: string;

  @ApiPropertyOptional({ description: 'Thời gian hết hạn đăng ký (ISO 8601)' })
  @Column({ nullable: true, type: 'timestamp' })
  subscriptionExpiresAt?: Date;

  @ApiPropertyOptional({ description: 'Mã giới thiệu' })
  @Column({ nullable: true })
  referralCode?: string;

  @ApiProperty({ description: 'Trạng thái xóa mềm' })
  @Column({ default: false })
  isDeleted: boolean;

  @ApiPropertyOptional({ description: 'Thời gian xóa' })
  @Column({ nullable: true, type: 'timestamp' })
  deletedAt?: Date;

  @ApiPropertyOptional({ description: 'Người xóa' })
  @Column({ nullable: true })
  deletedBy?: string;

  // Relationships
  @OneToMany('Activity', 'user')
  activities: Activity[];
}
