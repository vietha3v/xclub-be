import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ParticipantStatus {
  REGISTERED = 'registered',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  WITHDRAWN = 'withdrawn',
  DISQUALIFIED = 'disqualified'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

export enum RegistrationCategory {
  MALE_18_29 = 'male_18_29',
  MALE_30_39 = 'male_30_39',
  MALE_40_49 = 'male_40_49',
  MALE_50_59 = 'male_50_59',
  MALE_60_PLUS = 'male_60_plus',
  FEMALE_18_29 = 'female_18_29',
  FEMALE_30_39 = 'female_30_39',
  FEMALE_40_49 = 'female_40_49',
  FEMALE_50_59 = 'female_50_59',
  FEMALE_60_PLUS = 'female_60_plus',
  YOUTH = 'youth',
  SENIOR = 'senior',
  ELITE = 'elite',
  WHEELCHAIR = 'wheelchair',
  OTHER = 'other'
}

@Entity('race_participants')
export class RaceParticipant {
  @ApiProperty({ description: 'ID duy nhất của người tham gia' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID giải chạy' })
  @Column()
  @Index()
  raceId: string;

  @ApiProperty({ description: 'ID người dùng' })
  @Column()
  @Index()
  userId: string;

  @ApiProperty({ description: 'Số báo danh' })
  @Column({ unique: true, nullable: true })
  @Index()
  bibNumber?: string;

  @ApiProperty({ description: 'Trạng thái tham gia' })
  @Column({
    type: 'enum',
    enum: ParticipantStatus,
    default: ParticipantStatus.REGISTERED
  })
  status: ParticipantStatus;

  @ApiProperty({ description: 'Danh mục tham gia' })
  @Column({
    type: 'enum',
    enum: RegistrationCategory,
    default: RegistrationCategory.OTHER
  })
  category: RegistrationCategory;

  @ApiProperty({ description: 'Khoảng cách đăng ký (mét)' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  registeredDistance?: number;

  @ApiProperty({ description: 'Thời gian đăng ký' })
  @Column({ type: 'timestamp' })
  registrationDate: Date;

  @ApiPropertyOptional({ description: 'Thời gian xác nhận' })
  @Column({ type: 'timestamp', nullable: true })
  confirmationDate?: Date;

  @ApiPropertyOptional({ description: 'Thời gian hoàn thành' })
  @Column({ type: 'timestamp', nullable: true })
  completionDate?: Date;

  @ApiPropertyOptional({ description: 'Thời gian rút lui' })
  @Column({ type: 'timestamp', nullable: true })
  withdrawalDate?: Date;

  @ApiProperty({ description: 'Trạng thái thanh toán' })
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING
  })
  paymentStatus: PaymentStatus;

  @ApiPropertyOptional({ description: 'Số tiền thanh toán' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  paymentAmount?: number;

  @ApiPropertyOptional({ description: 'Mã giao dịch thanh toán' })
  @Column({ nullable: true })
  @Index()
  paymentTransactionId?: string;

  @ApiPropertyOptional({ description: 'Thời gian thanh toán' })
  @Column({ type: 'timestamp', nullable: true })
  paymentDate?: Date;

  @ApiPropertyOptional({ description: 'Số điện thoại liên hệ' })
  @Column({ nullable: true })
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Địa chỉ liên hệ' })
  @Column({ type: 'text', nullable: true })
  address?: string;

  @ApiPropertyOptional({ description: 'Thông tin y tế' })
  @Column({ type: 'text', nullable: true })
  medicalInfo?: string;

  @ApiPropertyOptional({ description: 'Kinh nghiệm chạy bộ' })
  @Column({ type: 'text', nullable: true })
  runningExperience?: string;

  @ApiPropertyOptional({ description: 'Thời gian dự kiến hoàn thành (phút)' })
  @Column({ type: 'int', nullable: true })
  expectedFinishTime?: number;

  @ApiPropertyOptional({ description: 'Thời gian thực tế hoàn thành (giây)' })
  @Column({ type: 'int', nullable: true })
  actualFinishTime?: number;

  @ApiPropertyOptional({ description: 'Khoảng cách thực tế (mét)' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  actualDistance?: number;

  @ApiPropertyOptional({ description: 'Pace trung bình (giây/km)' })
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  averagePace?: number;

  @ApiPropertyOptional({ description: 'Tốc độ trung bình (km/h)' })
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  averageSpeed?: number;

  @ApiPropertyOptional({ description: 'Thứ hạng trong danh mục' })
  @Column({ type: 'int', nullable: true })
  categoryRank?: number;

  @ApiPropertyOptional({ description: 'Thứ hạng tổng thể' })
  @Column({ type: 'int', nullable: true })
  overallRank?: number;

  @ApiPropertyOptional({ description: 'Thứ hạng theo giới tính' })
  @Column({ type: 'int', nullable: true })
  genderRank?: number;

  @ApiPropertyOptional({ description: 'Thứ hạng theo độ tuổi' })
  @Column({ type: 'int', nullable: true })
  ageGroupRank?: number;

  @ApiPropertyOptional({ description: 'Điểm số' })
  @Column({ type: 'int', default: 0 })
  points: number;

  @ApiPropertyOptional({ description: 'Ghi chú đặc biệt' })
  @Column({ type: 'text', nullable: true })
  specialNotes?: string;

  @ApiPropertyOptional({ description: 'Lý do rút lui' })
  @Column({ type: 'text', nullable: true })
  withdrawalReason?: string;

  @ApiPropertyOptional({ description: 'Thông tin bổ sung' })
  @Column({ type: 'jsonb', nullable: true })
  additionalInfo?: any;

  @ApiPropertyOptional({ description: 'Metadata tham gia' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @ApiPropertyOptional({ description: 'Tags tham gia' })
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
