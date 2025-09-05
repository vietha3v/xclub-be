import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AnalyticsType {
  USER = 'user',
  CLUB = 'club',
  ACTIVITY = 'activity',
  CHALLENGE = 'challenge',
  EVENT = 'event',
  RACE = 'race',
  ACHIEVEMENT = 'achievement',
  PAYMENT = 'payment',
  SYSTEM = 'system',
  PERFORMANCE = 'performance',
  OTHER = 'other'
}

export enum AnalyticsPeriod {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom'
}

export enum AnalyticsStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PROCESSING = 'processing',
  ERROR = 'error',
  ARCHIVED = 'archived'
}

@Entity('analytics')
export class Analytics {
  @ApiProperty({ description: 'ID duy nhất của báo cáo phân tích' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Mã báo cáo (duy nhất)' })
  @Column({ unique: true, length: 20 })
  @Index()
  analyticsCode: string;

  @ApiProperty({ description: 'Tên báo cáo' })
  @Column({ length: 255 })
  name: string;

  @ApiPropertyOptional({ description: 'Mô tả báo cáo' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Loại báo cáo' })
  @Column({
    type: 'enum',
    enum: AnalyticsType,
    default: AnalyticsType.OTHER
  })
  type: AnalyticsType;

  @ApiProperty({ description: 'Chu kỳ báo cáo' })
  @Column({
    type: 'enum',
    enum: AnalyticsPeriod,
    default: AnalyticsPeriod.DAILY
  })
  period: AnalyticsPeriod;

  @ApiProperty({ description: 'Trạng thái báo cáo' })
  @Column({
    type: 'enum',
    enum: AnalyticsStatus,
    default: AnalyticsStatus.ACTIVE
  })
  status: AnalyticsStatus;

  @ApiPropertyOptional({ description: 'ID câu lạc bộ liên quan' })
  @Column({ nullable: true })
  @Index()
  clubId?: string;

  @ApiProperty({ description: 'ID người tạo báo cáo' })
  @Column()
  @Index()
  createdBy: string;

  @ApiProperty({ description: 'Thời gian bắt đầu báo cáo' })
  @Column({ type: 'timestamp' })
  startDate: Date;

  @ApiProperty({ description: 'Thời gian kết thúc báo cáo' })
  @Column({ type: 'timestamp' })
  endDate: Date;

  @ApiPropertyOptional({ description: 'Thời gian tạo cuối cùng' })
  @Column({ type: 'timestamp', nullable: true })
  lastGeneratedAt?: Date;

  @ApiPropertyOptional({ description: 'Thời gian cập nhật cuối cùng' })
  @Column({ type: 'timestamp', nullable: true })
  lastUpdatedAt?: Date;

  @ApiPropertyOptional({ description: 'Dữ liệu phân tích' })
  @Column({ type: 'jsonb', nullable: true })
  data?: any;

  @ApiPropertyOptional({ description: 'Cấu hình báo cáo' })
  @Column({ type: 'jsonb', nullable: true })
  configuration?: any;

  @ApiPropertyOptional({ description: 'Cài đặt báo cáo' })
  @Column({ type: 'jsonb', nullable: true })
  settings?: any;

  @ApiPropertyOptional({ description: 'Lỗi xử lý' })
  @Column({ type: 'jsonb', nullable: true })
  error?: any;

  @ApiPropertyOptional({ description: 'Thời gian lỗi cuối cùng' })
  @Column({ type: 'timestamp', nullable: true })
  lastErrorAt?: Date;

  @ApiPropertyOptional({ description: 'Ghi chú báo cáo' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiPropertyOptional({ description: 'Tags báo cáo' })
  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

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
