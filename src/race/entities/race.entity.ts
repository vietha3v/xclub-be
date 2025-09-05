import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum RaceStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  REGISTRATION_OPEN = 'registration_open',
  REGISTRATION_CLOSED = 'registration_closed',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum RaceType {
  ROAD_RACE = 'road_race',
  TRAIL_RACE = 'trail_race',
  ULTRA_MARATHON = 'ultra_marathon',
  MARATHON = 'marathon',
  HALF_MARATHON = 'half_marathon',
  TEN_K = 'ten_k',
  FIVE_K = 'five_k',
  FUN_RUN = 'fun_run',
  RELAY = 'relay',
  OBSTACLE = 'obstacle',
  OTHER = 'other'
}

export enum RaceCategory {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  ELITE = 'elite',
  MASTER = 'master',
  YOUTH = 'youth'
}

export enum RaceVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  CLUB_ONLY = 'club_only',
  INVITE_ONLY = 'invite_only'
}

@Entity('races')
export class Race {
  @ApiProperty({ description: 'ID duy nhất của giải chạy' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Mã giải chạy (duy nhất)' })
  @Column({ unique: true, length: 20 })
  @Index()
  raceCode: string;

  @ApiProperty({ description: 'Tên giải chạy' })
  @Column({ length: 255 })
  name: string;

  @ApiPropertyOptional({ description: 'Mô tả giải chạy' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Loại giải chạy' })
  @Column({
    type: 'enum',
    enum: RaceType,
    default: RaceType.OTHER
  })
  type: RaceType;

  @ApiProperty({ description: 'Trạng thái giải chạy' })
  @Column({
    type: 'enum',
    enum: RaceStatus,
    default: RaceStatus.DRAFT
  })
  status: RaceStatus;

  @ApiProperty({ description: 'Quyền riêng tư giải chạy' })
  @Column({
    type: 'enum',
    enum: RaceVisibility,
    default: RaceVisibility.PUBLIC
  })
  visibility: RaceVisibility;

  @ApiPropertyOptional({ description: 'ID câu lạc bộ tổ chức' })
  @Column({ nullable: true })
  @Index()
  clubId?: string;

  @ApiProperty({ description: 'ID người tạo giải chạy' })
  @Column()
  @Index()
  createdBy: string;

  @ApiProperty({ description: 'Thời gian bắt đầu giải chạy' })
  @Column({ type: 'timestamp' })
  startDate: Date;

  @ApiProperty({ description: 'Thời gian kết thúc giải chạy' })
  @Column({ type: 'timestamp' })
  endDate: Date;

  @ApiPropertyOptional({ description: 'Thời gian đăng ký bắt đầu' })
  @Column({ type: 'timestamp', nullable: true })
  registrationStartDate?: Date;

  @ApiPropertyOptional({ description: 'Thời gian đăng ký kết thúc' })
  @Column({ type: 'timestamp', nullable: true })
  registrationEndDate?: Date;

  @ApiPropertyOptional({ description: 'Số lượng người tham gia tối đa' })
  @Column({ type: 'int', nullable: true })
  maxParticipants?: number;

  @ApiPropertyOptional({ description: 'Số lượng người tham gia tối thiểu' })
  @Column({ type: 'int', nullable: true })
  minParticipants?: number;

  @ApiPropertyOptional({ description: 'Khoảng cách chính (mét)' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  mainDistance?: number;

  @ApiPropertyOptional({ description: 'Khoảng cách phụ (mét)' })
  @Column({ type: 'simple-array', nullable: true })
  additionalDistances?: number[];

  @ApiPropertyOptional({ description: 'Thời gian giới hạn (giây)' })
  @Column({ type: 'int', nullable: true })
  timeLimit?: number;

  @ApiPropertyOptional({ description: 'Địa điểm xuất phát' })
  @Column({ nullable: true })
  startLocation?: string;

  @ApiPropertyOptional({ description: 'Địa điểm kết thúc' })
  @Column({ nullable: true })
  finishLocation?: string;

  @ApiPropertyOptional({ description: 'Tọa độ xuất phát (latitude)' })
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  startLatitude?: number;

  @ApiPropertyOptional({ description: 'Tọa độ xuất phát (longitude)' })
  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  startLongitude?: number;

  @ApiPropertyOptional({ description: 'Tọa độ kết thúc (latitude)' })
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  finishLatitude?: number;

  @ApiPropertyOptional({ description: 'Tọa độ kết thúc (longitude)' })
  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  finishLongitude?: number;

  @ApiPropertyOptional({ description: 'Địa chỉ chi tiết' })
  @Column({ type: 'text', nullable: true })
  address?: string;

  @ApiPropertyOptional({ description: 'Thông tin liên hệ' })
  @Column({ type: 'jsonb', nullable: true })
  contactInfo?: any;

  @ApiPropertyOptional({ description: 'Phí đăng ký' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  registrationFee?: number;

  @ApiPropertyOptional({ description: 'Đơn vị tiền tệ', default: 'VND' })
  @Column({ length: 3, default: 'VND' })
  currency: string;

  @ApiPropertyOptional({ description: 'Quy tắc giải chạy' })
  @Column({ type: 'text', nullable: true })
  rules?: string;

  @ApiPropertyOptional({ description: 'Yêu cầu tham gia' })
  @Column({ type: 'text', nullable: true })
  requirements?: string;

  @ApiPropertyOptional({ description: 'Phần thưởng giải chạy' })
  @Column({ type: 'jsonb', nullable: true })
  rewards?: any;

  @ApiPropertyOptional({ description: 'Ảnh bìa giải chạy' })
  @Column({ nullable: true })
  coverImageUrl?: string;

  @ApiPropertyOptional({ description: 'Ảnh bổ sung' })
  @Column({ type: 'simple-array', nullable: true })
  additionalImages?: string[];

  @ApiPropertyOptional({ description: 'Tags giải chạy' })
  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Danh sách người tham gia' })
  @Column({ type: 'simple-array', nullable: true })
  participants?: string[];

  @ApiPropertyOptional({ description: 'Danh sách người hoàn thành' })
  @Column({ type: 'simple-array', nullable: true })
  completers?: string[];

  @ApiPropertyOptional({ description: 'Thống kê giải chạy' })
  @Column({ type: 'jsonb', nullable: true })
  stats?: any;

  @ApiPropertyOptional({ description: 'Cài đặt giải chạy' })
  @Column({ type: 'jsonb', nullable: true })
  settings?: any;

  @ApiProperty({ description: 'Cho phép đăng ký' })
  @Column({ default: true })
  allowRegistration: boolean;

  @ApiProperty({ description: 'Yêu cầu phê duyệt tham gia' })
  @Column({ default: false })
  requireApproval: boolean;

  @ApiProperty({ description: 'Cho phép rút lui' })
  @Column({ default: true })
  allowWithdrawal: boolean;

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
}
