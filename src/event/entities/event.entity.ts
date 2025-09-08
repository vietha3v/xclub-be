import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum EventStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum EventType {
  TRAINING = 'training',
  COMPETITION = 'competition',
  SOCIAL = 'social',
  CHARITY = 'charity',
  WORKSHOP = 'workshop',
  MEETUP = 'meetup',
  KNOWLEDGE_SHARING = 'knowledge_sharing',
  BIRTHDAY = 'birthday',
  CELEBRATION = 'celebration',
  TEAM_BUILDING = 'team_building',
  HEALTH_CHECK = 'health_check',
  NUTRITION_TALK = 'nutrition_talk',
  EQUIPMENT_REVIEW = 'equipment_review',
  ROUTE_EXPLORATION = 'route_exploration',
  OTHER = 'other'
}

export enum EventVisibility {
  CLUB_ONLY = 'club_only',
  PUBLIC = 'public'
}

@Entity('events')
export class Event {
  @ApiProperty({ description: 'ID duy nhất của sự kiện' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Mã sự kiện (duy nhất)' })
  @Column({ unique: true, length: 20 })
  @Index()
  eventCode: string;

  @ApiProperty({ description: 'Tên sự kiện' })
  @Column({ length: 255 })
  name: string;

  @ApiPropertyOptional({ description: 'Mô tả sự kiện' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Loại sự kiện' })
  @Column({
    type: 'enum',
    enum: EventType,
    default: EventType.TRAINING
  })
  type: EventType;

  @ApiProperty({ description: 'Trạng thái sự kiện' })
  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.UPCOMING
  })
  status: EventStatus;

  @ApiProperty({ description: 'Quyền riêng tư sự kiện' })
  @Column({
    type: 'enum',
    enum: EventVisibility,
    default: EventVisibility.CLUB_ONLY
  })
  visibility: EventVisibility;

  @ApiPropertyOptional({ description: 'ID câu lạc bộ tổ chức' })
  @Column({ nullable: true })
  @Index()
  clubId?: string;

  // Relation với Club
  @ManyToOne('Club', { nullable: true })
  @JoinColumn({ name: 'clubId' })
  club?: any;

  @ApiProperty({ description: 'ID người tạo sự kiện' })
  @Column()
  @Index()
  createdBy: string;

  @ApiProperty({ description: 'Thời gian bắt đầu sự kiện' })
  @Column({ type: 'timestamp' })
  startDate: Date;

  @ApiPropertyOptional({ description: 'Thời gian kết thúc sự kiện' })
  @Column({ type: 'timestamp', nullable: true })
  endDate?: Date;

  @ApiPropertyOptional({ description: 'Thời gian đăng ký bắt đầu' })
  @Column({ type: 'timestamp', nullable: true })
  registrationStartDate?: Date;

  @ApiPropertyOptional({ description: 'Thời gian đăng ký kết thúc' })
  @Column({ type: 'timestamp', nullable: true })
  registrationEndDate?: Date;

  @ApiPropertyOptional({ description: 'Địa điểm sự kiện' })
  @Column({ nullable: true })
  location?: string;

  @ApiPropertyOptional({ description: 'Tọa độ địa điểm (latitude)' })
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @ApiPropertyOptional({ description: 'Tọa độ địa điểm (longitude)' })
  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number;

  @ApiPropertyOptional({ description: 'Địa chỉ chi tiết' })
  @Column({ type: 'text', nullable: true })
  address?: string;

  @ApiPropertyOptional({ description: 'Thông tin liên hệ' })
  @Column({ type: 'jsonb', nullable: true })
  contactInfo?: any;

  @ApiPropertyOptional({ description: 'Ảnh bìa sự kiện' })
  @Column({ nullable: true })
  coverImageUrl?: string;

  @ApiPropertyOptional({ description: 'Ảnh bổ sung' })
  @Column({ type: 'simple-array', nullable: true })
  additionalImages?: string[];

  @ApiPropertyOptional({ description: 'Tags sự kiện' })
  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Số lượng người tham gia tối đa' })
  @Column({ type: 'int', nullable: true })
  maxParticipants?: number;

  @ApiPropertyOptional({ description: 'Phí đăng ký (VND)' })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  registrationFee?: number;

  @ApiPropertyOptional({ description: 'Hình thức tổ chức' })
  @Column({ 
    type: 'enum', 
    enum: ['online', 'offline', 'hybrid'], 
    default: 'offline',
    nullable: true 
  })
  format?: 'online' | 'offline' | 'hybrid';

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
