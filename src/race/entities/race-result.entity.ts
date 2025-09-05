import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ResultStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  DISQUALIFIED = 'disqualified',
  UNDER_REVIEW = 'under_review'
}

export enum ResultSource {
  MANUAL = 'manual',
  STRAVA = 'strava',
  GARMIN = 'garmin',
  APPLE_HEALTH = 'apple_health',
  GOOGLE_FIT = 'google_fit',
  GPS_DEVICE = 'gps_device',
  OTHER = 'other'
}

@Entity('race_results')
export class RaceResult {
  @ApiProperty({ description: 'ID duy nhất của kết quả' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID giải chạy' })
  @Column()
  @Index()
  raceId: string;

  @ApiProperty({ description: 'ID người tham gia' })
  @Column()
  @Index()
  participantId: string;

  @ApiProperty({ description: 'ID người dùng' })
  @Column()
  @Index()
  userId: string;

  @ApiProperty({ description: 'Số báo danh' })
  @Column({ nullable: true })
  @Index()
  bibNumber?: string;

  @ApiProperty({ description: 'Trạng thái kết quả' })
  @Column({
    type: 'enum',
    enum: ResultStatus,
    default: ResultStatus.PENDING
  })
  status: ResultStatus;

  @ApiProperty({ description: 'Nguồn dữ liệu kết quả' })
  @Column({
    type: 'enum',
    enum: ResultSource,
    default: ResultSource.MANUAL
  })
  source: ResultSource;

  @ApiPropertyOptional({ description: 'ID hoạt động từ nguồn bên ngoài' })
  @Column({ nullable: true })
  @Index()
  externalActivityId?: string;

  @ApiPropertyOptional({ description: 'Thời gian bắt đầu' })
  @Column({ type: 'timestamp', nullable: true })
  startTime?: Date;

  @ApiPropertyOptional({ description: 'Thời gian kết thúc' })
  @Column({ type: 'timestamp', nullable: true })
  finishTime?: Date;

  @ApiPropertyOptional({ description: 'Thời gian hoàn thành (giây)' })
  @Column({ type: 'int', nullable: true })
  duration?: number;

  @ApiPropertyOptional({ description: 'Khoảng cách thực tế (mét)' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  distance?: number;

  @ApiPropertyOptional({ description: 'Pace trung bình (giây/km)' })
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  averagePace?: number;

  @ApiPropertyOptional({ description: 'Tốc độ trung bình (km/h)' })
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  averageSpeed?: number;

  @ApiPropertyOptional({ description: 'Pace nhanh nhất (giây/km)' })
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  bestPace?: number;

  @ApiPropertyOptional({ description: 'Tốc độ nhanh nhất (km/h)' })
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  maxSpeed?: number;

  @ApiPropertyOptional({ description: 'Độ cao tích lũy (mét)' })
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  elevationGain?: number;

  @ApiPropertyOptional({ description: 'Độ cao mất đi (mét)' })
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  elevationLoss?: number;

  @ApiPropertyOptional({ description: 'Nhịp tim trung bình (bpm)' })
  @Column({ type: 'int', nullable: true })
  averageHeartRate?: number;

  @ApiPropertyOptional({ description: 'Nhịp tim tối đa (bpm)' })
  @Column({ type: 'int', nullable: true })
  maxHeartRate?: number;

  @ApiPropertyOptional({ description: 'Calories đốt cháy' })
  @Column({ type: 'int', nullable: true })
  calories?: number;

  @ApiPropertyOptional({ description: 'Thứ hạng tổng thể' })
  @Column({ type: 'int', nullable: true })
  overallRank?: number;

  @ApiPropertyOptional({ description: 'Thứ hạng theo danh mục' })
  @Column({ type: 'int', nullable: true })
  categoryRank?: number;

  @ApiPropertyOptional({ description: 'Thứ hạng theo giới tính' })
  @Column({ type: 'int', nullable: true })
  genderRank?: number;

  @ApiPropertyOptional({ description: 'Thứ hạng theo độ tuổi' })
  @Column({ type: 'int', nullable: true })
  ageGroupRank?: number;

  @ApiPropertyOptional({ description: 'Điểm số' })
  @Column({ type: 'int', default: 0 })
  points: number;

  @ApiPropertyOptional({ description: 'Phần trăm hoàn thành' })
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  completionPercentage: number;

  @ApiProperty({ description: 'Đã hoàn thành' })
  @Column({ default: false })
  isCompleted: boolean;

  @ApiPropertyOptional({ description: 'Thời gian hoàn thành' })
  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @ApiPropertyOptional({ description: 'Lý do không hoàn thành' })
  @Column({ type: 'text', nullable: true })
  nonCompletionReason?: string;

  @ApiPropertyOptional({ description: 'Dữ liệu GPS' })
  @Column({ type: 'jsonb', nullable: true })
  gpsData?: any;

  @ApiPropertyOptional({ description: 'Dữ liệu từ thiết bị' })
  @Column({ type: 'jsonb', nullable: true })
  deviceData?: any;

  @ApiPropertyOptional({ description: 'Dữ liệu từ nguồn bên ngoài' })
  @Column({ type: 'jsonb', nullable: true })
  externalData?: any;

  @ApiPropertyOptional({ description: 'Ghi chú kết quả' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiPropertyOptional({ description: 'Lý do bị loại' })
  @Column({ type: 'text', nullable: true })
  disqualificationReason?: string;

  @ApiPropertyOptional({ description: 'Thời gian bị loại' })
  @Column({ type: 'timestamp', nullable: true })
  disqualifiedAt?: Date;

  @ApiPropertyOptional({ description: 'Người xác nhận kết quả' })
  @Column({ nullable: true })
  verifiedBy?: string;

  @ApiPropertyOptional({ description: 'Thời gian xác nhận' })
  @Column({ type: 'timestamp', nullable: true })
  verifiedAt?: Date;

  @ApiPropertyOptional({ description: 'Metadata kết quả' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @ApiPropertyOptional({ description: 'Tags kết quả' })
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
