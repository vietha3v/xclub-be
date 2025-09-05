import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum NotificationType {
  SYSTEM = 'system',
  USER = 'user',
  CLUB = 'club',
  ACTIVITY = 'activity',
  CHALLENGE = 'challenge',
  EVENT = 'event',
  RACE = 'race',
  ACHIEVEMENT = 'achievement',
  FRIEND = 'friend',
  PAYMENT = 'payment',
  SECURITY = 'security',
  OTHER = 'other'
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  WEBHOOK = 'webhook'
}

@Entity('notifications')
export class Notification {
  @ApiProperty({ description: 'ID duy nhất của thông báo' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Mã thông báo (duy nhất)' })
  @Column({ unique: true, length: 20 })
  @Index()
  notificationCode: string;

  @ApiProperty({ description: 'Tiêu đề thông báo' })
  @Column({ length: 255 })
  title: string;

  @ApiPropertyOptional({ description: 'Nội dung thông báo' })
  @Column({ type: 'text', nullable: true })
  content?: string;

  @ApiProperty({ description: 'Loại thông báo' })
  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.OTHER
  })
  type: NotificationType;

  @ApiProperty({ description: 'Trạng thái thông báo' })
  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING
  })
  status: NotificationStatus;

  @ApiProperty({ description: 'Mức độ ưu tiên' })
  @Column({
    type: 'enum',
    enum: NotificationPriority,
    default: NotificationPriority.NORMAL
  })
  priority: NotificationPriority;

  @ApiProperty({ description: 'Kênh thông báo' })
  @Column({
    type: 'enum',
    enum: NotificationChannel,
    default: NotificationChannel.IN_APP
  })
  channel: NotificationChannel;

  @ApiProperty({ description: 'ID người nhận thông báo' })
  @Column()
  @Index()
  recipientId: string;

  @ApiPropertyOptional({ description: 'ID người gửi thông báo' })
  @Column({ nullable: true })
  @Index()
  senderId?: string;

  @ApiPropertyOptional({ description: 'ID câu lạc bộ liên quan' })
  @Column({ nullable: true })
  @Index()
  clubId?: string;

  @ApiPropertyOptional({ description: 'ID đối tượng liên quan' })
  @Column({ nullable: true })
  @Index()
  relatedObjectId?: string;

  @ApiPropertyOptional({ description: 'Loại đối tượng liên quan' })
  @Column({ length: 50, nullable: true })
  relatedObjectType?: string;

  @ApiPropertyOptional({ description: 'Dữ liệu bổ sung' })
  @Column({ type: 'jsonb', nullable: true })
  data?: any;

  @ApiPropertyOptional({ description: 'Thời gian gửi' })
  @Column({ type: 'timestamp', nullable: true })
  sentAt?: Date;

  @ApiPropertyOptional({ description: 'Thời gian giao' })
  @Column({ type: 'timestamp', nullable: true })
  deliveredAt?: Date;

  @ApiPropertyOptional({ description: 'Thời gian đọc' })
  @Column({ type: 'timestamp', nullable: true })
  readAt?: Date;

  @ApiPropertyOptional({ description: 'Thời gian hết hạn' })
  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @ApiPropertyOptional({ description: 'Lỗi gửi thông báo' })
  @Column({ type: 'jsonb', nullable: true })
  error?: any;

  @ApiPropertyOptional({ description: 'Số lần thử gửi' })
  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @ApiPropertyOptional({ description: 'Thời gian thử gửi tiếp theo' })
  @Column({ type: 'timestamp', nullable: true })
  nextRetryAt?: Date;

  @ApiPropertyOptional({ description: 'Cài đặt thông báo' })
  @Column({ type: 'jsonb', nullable: true })
  settings?: any;

  @ApiPropertyOptional({ description: 'Ghi chú thông báo' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiPropertyOptional({ description: 'Tags thông báo' })
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
