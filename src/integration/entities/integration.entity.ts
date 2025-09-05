import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum IntegrationType {
  FITNESS_PLATFORM = 'fitness_platform',
  PAYMENT_GATEWAY = 'payment_gateway',
  EMAIL_SERVICE = 'email_service',
  PUSH_NOTIFICATION = 'push_notification',
  MAP_SERVICE = 'map_service',
  AI_SERVICE = 'ai_service',
  ANALYTICS = 'analytics',
  SOCIAL_MEDIA = 'social_media',
  STORAGE = 'storage',
  OTHER = 'other'
}

export enum IntegrationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  MAINTENANCE = 'maintenance',
  DEPRECATED = 'deprecated'
}

export enum IntegrationProvider {
  STRAVA = 'strava',
  GARMIN = 'garmin',
  APPLE_HEALTH = 'apple_health',
  GOOGLE_FIT = 'google_fit',
  VNPAY = 'vnpay',
  MOMO = 'momo',
  ZALOPAY = 'zalopay',
  SENDGRID = 'sendgrid',
  NODEMAILER = 'nodemailer',
  FIREBASE = 'firebase',
  GOOGLE_MAPS = 'google_maps',
  OPENSTREETMAP = 'openstreetmap',
  OPENAI = 'openai',
  GOOGLE_ANALYTICS = 'google_analytics',
  SENTRY = 'sentry',
  OTHER = 'other'
}

@Entity('integrations')
export class Integration {
  @ApiProperty({ description: 'ID duy nhất của tích hợp' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Mã tích hợp (duy nhất)' })
  @Column({ unique: true, length: 20 })
  @Index()
  integrationCode: string;

  @ApiProperty({ description: 'Tên tích hợp' })
  @Column({ length: 255 })
  name: string;

  @ApiPropertyOptional({ description: 'Mô tả tích hợp' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Loại tích hợp' })
  @Column({
    type: 'enum',
    enum: IntegrationType,
    default: IntegrationType.OTHER
  })
  type: IntegrationType;

  @ApiProperty({ description: 'Nhà cung cấp tích hợp' })
  @Column({
    type: 'enum',
    enum: IntegrationProvider,
    default: IntegrationProvider.OTHER
  })
  provider: IntegrationProvider;

  @ApiProperty({ description: 'Trạng thái tích hợp' })
  @Column({
    type: 'enum',
    enum: IntegrationStatus,
    default: IntegrationStatus.INACTIVE
  })
  status: IntegrationStatus;

  @ApiPropertyOptional({ description: 'ID câu lạc bộ sở hữu tích hợp' })
  @Column({ nullable: true })
  @Index()
  clubId?: string;

  @ApiProperty({ description: 'ID người tạo tích hợp' })
  @Column()
  @Index()
  createdBy: string;

  @ApiPropertyOptional({ description: 'API Key' })
  @Column({ nullable: true })
  apiKey?: string;

  @ApiPropertyOptional({ description: 'API Secret' })
  @Column({ nullable: true })
  apiSecret?: string;

  @ApiPropertyOptional({ description: 'Access Token' })
  @Column({ nullable: true })
  accessToken?: string;

  @ApiPropertyOptional({ description: 'Refresh Token' })
  @Column({ nullable: true })
  refreshToken?: string;

  @ApiPropertyOptional({ description: 'Token Expiry' })
  @Column({ type: 'timestamp', nullable: true })
  tokenExpiry?: Date;

  @ApiPropertyOptional({ description: 'Webhook URL' })
  @Column({ nullable: true })
  webhookUrl?: string;

  @ApiPropertyOptional({ description: 'Callback URL' })
  @Column({ nullable: true })
  callbackUrl?: string;

  @ApiPropertyOptional({ description: 'Cấu hình tích hợp' })
  @Column({ type: 'jsonb', nullable: true })
  configuration?: any;

  @ApiPropertyOptional({ description: 'Thông tin xác thực' })
  @Column({ type: 'jsonb', nullable: true })
  credentials?: any;

  @ApiPropertyOptional({ description: 'Cài đặt tích hợp' })
  @Column({ type: 'jsonb', nullable: true })
  settings?: any;

  @ApiPropertyOptional({ description: 'Phí sử dụng' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost?: number;

  @ApiPropertyOptional({ description: 'Đơn vị tiền tệ', default: 'VND' })
  @Column({ length: 3, default: 'VND' })
  currency: string;

  @ApiPropertyOptional({ description: 'Giới hạn sử dụng' })
  @Column({ type: 'jsonb', nullable: true })
  usageLimits?: any;

  @ApiPropertyOptional({ description: 'Thống kê sử dụng' })
  @Column({ type: 'jsonb', nullable: true })
  stats?: any;

  @ApiPropertyOptional({ description: 'Lỗi cuối cùng' })
  @Column({ type: 'jsonb', nullable: true })
  lastError?: any;

  @ApiPropertyOptional({ description: 'Thời gian lỗi cuối cùng' })
  @Column({ type: 'timestamp', nullable: true })
  lastErrorAt?: Date;

  @ApiPropertyOptional({ description: 'Ghi chú tích hợp' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiPropertyOptional({ description: 'Tags tích hợp' })
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
