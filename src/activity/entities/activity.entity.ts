import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ActivityType {
  RUNNING = 'Run',
  WALKING = 'Walk',
  HIKING = 'Hike',
  TRAIL_RUNNING = 'TrailRun',
  JOGGING = 'Jog',
  CYCLING = 'Ride',
  MOUNTAIN_BIKING = 'MountainBikeRide',
  SWIMMING = 'Swim',
  YOGA = 'Yoga',
  WEIGHT_TRAINING = 'WeightTraining',
  OTHER = 'Other'
}

export enum ActivityStatus {
  SYNCED = 'synced',
  PROCESSING = 'processing',
  ERROR = 'error'
}

export enum ActivityVisibility {
  PRIVATE = 'private',
  FRIENDS = 'friends',
  CLUB = 'club',
  PUBLIC = 'public'
}

@Entity('activities')
export class Activity {
  @ApiProperty({ description: 'ID duy nhất của hoạt động' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Mã hoạt động (duy nhất)' })
  @Column({ unique: true, length: 20 })
  @Index()
  activityCode: string;

  @ApiProperty({ description: 'Tên hoạt động' })
  @Column({ length: 255 })
  name: string;

  @ApiPropertyOptional({ description: 'Mô tả hoạt động' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Loại hoạt động (theo Strava)' })
  @Column({
    type: 'enum',
    enum: ActivityType,
    default: ActivityType.RUNNING
  })
  type: ActivityType;

  @ApiProperty({ description: 'Loại thể thao (theo Strava sport_type)' })
  @Column({ length: 50 })
  sportType: string;

  @ApiProperty({ description: 'Trạng thái đồng bộ' })
  @Column({
    type: 'enum',
    enum: ActivityStatus,
    default: ActivityStatus.SYNCED
  })
  status: ActivityStatus;

  @ApiProperty({ description: 'Mức độ hiển thị' })
  @Column({
    type: 'enum',
    enum: ActivityVisibility,
    default: ActivityVisibility.PRIVATE
  })
  visibility: ActivityVisibility;

  @ApiProperty({ description: 'Cho phép xem công khai' })
  @Column({ default: false })
  isPublic: boolean;

  @ApiProperty({ description: 'ID người dùng thực hiện' })
  @Column()
  @Index()
  userId: string;

  @ApiProperty({ description: 'Nguồn dữ liệu (strava, garmin, apple_health, google_fit)' })
  @Column({ length: 50 })
  @Index()
  source: string;

  @ApiProperty({ description: 'ID hoạt động từ nguồn gốc' })
  @Column({ length: 100 })
  @Index()
  sourceActivityId: string;

  @ApiPropertyOptional({ description: 'Thời gian đồng bộ cuối cùng' })
  @Column({ type: 'timestamp', nullable: true })
  lastSyncedAt?: Date;

  @ApiPropertyOptional({ description: 'ID upload (theo Strava upload_id_str)' })
  @Column({ length: 100, nullable: true })
  uploadId?: string;

  @ApiPropertyOptional({ description: 'ID câu lạc bộ liên quan' })
  @Column({ nullable: true })
  @Index()
  clubId?: string;

  @ApiPropertyOptional({ description: 'ID thử thách liên quan' })
  @Column({ nullable: true })
  @Index()
  challengeId?: string;

  @ApiPropertyOptional({ description: 'ID sự kiện liên quan' })
  @Column({ nullable: true })
  @Index()
  eventId?: string;

  @ApiPropertyOptional({ description: 'ID giải chạy liên quan' })
  @Column({ nullable: true })
  @Index()
  raceId?: string;

  @ApiPropertyOptional({ description: 'Thời gian bắt đầu' })
  @Column({ type: 'timestamp', nullable: true })
  startTime?: Date;

  @ApiPropertyOptional({ description: 'Thời gian kết thúc' })
  @Column({ type: 'timestamp', nullable: true })
  endTime?: Date;

  @ApiPropertyOptional({ description: 'Thời gian thực hiện (giây)' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  duration?: number;

  @ApiPropertyOptional({ description: 'Thời gian thực hiện (giây) - theo Strava elapsed_time' })
  @Column({ type: 'int', nullable: true })
  elapsedTime?: number;

  @ApiPropertyOptional({ description: 'Khoảng cách (km)' })
  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  distance?: number;

  @ApiPropertyOptional({ description: 'Tốc độ trung bình (km/h)' })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  averageSpeed?: number;

  @ApiPropertyOptional({ description: 'Pace trung bình (s/km)' })
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  averagePace?: number;

  @ApiPropertyOptional({ description: 'Tốc độ tối đa (km/h)' })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  maxSpeed?: number;

  @ApiPropertyOptional({ description: 'Nhịp tim trung bình (BPM)' })
  @Column({ type: 'int', nullable: true })
  averageHeartRate?: number;

  @ApiPropertyOptional({ description: 'Nhịp tim tối đa (BPM)' })
  @Column({ type: 'int', nullable: true })
  maxHeartRate?: number;

  @ApiPropertyOptional({ description: 'Calories tiêu thụ' })
  @Column({ type: 'int', nullable: true })
  calories?: number;

  @ApiPropertyOptional({ description: 'Độ cao tăng (m)' })
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  elevationGain?: number;

  @ApiPropertyOptional({ description: 'Tổng độ cao tăng (m) - theo Strava total_elevation_gain' })
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  totalElevationGain?: number;

  @ApiPropertyOptional({ description: 'Độ cao giảm (m)' })
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  elevationLoss?: number;

  @ApiPropertyOptional({ description: 'Độ cao tối đa (m)' })
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  maxElevation?: number;

  @ApiPropertyOptional({ description: 'Độ cao tối thiểu (m)' })
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  minElevation?: number;

  @ApiPropertyOptional({ description: 'Tọa độ bắt đầu (latitude)' })
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  startLatitude?: number;

  @ApiPropertyOptional({ description: 'Tọa độ bắt đầu (longitude)' })
  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  startLongitude?: number;

  @ApiPropertyOptional({ description: 'Tọa độ kết thúc (latitude)' })
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  endLatitude?: number;

  @ApiPropertyOptional({ description: 'Tọa độ kết thúc (longitude)' })
  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  endLongitude?: number;

  @ApiPropertyOptional({ description: 'Địa điểm bắt đầu' })
  @Column({ length: 255, nullable: true })
  startLocation?: string;

  @ApiPropertyOptional({ description: 'Địa điểm kết thúc' })
  @Column({ length: 255, nullable: true })
  endLocation?: string;

  @ApiPropertyOptional({ description: 'Dữ liệu GPS (GeoJSON)' })
  @Column({ type: 'jsonb', nullable: true })
  gpsData?: any;

  @ApiPropertyOptional({ description: 'Dữ liệu nhịp tim' })
  @Column({ type: 'jsonb', nullable: true })
  heartRateData?: any;

  @ApiPropertyOptional({ description: 'Dữ liệu tốc độ' })
  @Column({ type: 'jsonb', nullable: true })
  speedData?: any;

  @ApiPropertyOptional({ description: 'Dữ liệu độ cao' })
  @Column({ type: 'jsonb', nullable: true })
  elevationData?: any;

  @ApiPropertyOptional({ description: 'Dữ liệu cadence (bước/phút)' })
  @Column({ type: 'jsonb', nullable: true })
  cadenceData?: any;

  @ApiPropertyOptional({ description: 'Dữ liệu power (watts)' })
  @Column({ type: 'jsonb', nullable: true })
  powerData?: any;

  @ApiPropertyOptional({ description: 'Thời tiết' })
  @Column({ type: 'jsonb', nullable: true })
  weather?: any;

  @ApiPropertyOptional({ description: 'Nhiệt độ (Celsius)' })
  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  temperature?: number;

  @ApiPropertyOptional({ description: 'Độ ẩm (%)' })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  humidity?: number;

  @ApiPropertyOptional({ description: 'Gió (km/h)' })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  windSpeed?: number;

  @ApiPropertyOptional({ description: 'Điều kiện đường' })
  @Column({ length: 100, nullable: true })
  roadCondition?: string;

  @ApiPropertyOptional({ description: 'Thiết bị sử dụng' })
  @Column({ length: 255, nullable: true })
  equipment?: string;

  @ApiPropertyOptional({ description: 'ID thiết bị (theo Strava gear_id)' })
  @Column({ length: 100, nullable: true })
  gearId?: string;

  @ApiPropertyOptional({ description: 'Tổng công suất (kilojoules) - theo Strava' })
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  kilojoules?: number;

  @ApiPropertyOptional({ description: 'Công suất trung bình (watts) - theo Strava' })
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  averageWatts?: number;

  @ApiPropertyOptional({ description: 'Công suất tối đa (watts) - theo Strava' })
  @Column({ type: 'int', nullable: true })
  maxWatts?: number;

  @ApiPropertyOptional({ description: 'Công suất chuẩn hóa (watts) - theo Strava' })
  @Column({ type: 'int', nullable: true })
  weightedAverageWatts?: number;

  @ApiPropertyOptional({ description: 'Hoạt động thủ công (theo Strava manual)' })
  @Column({ default: false })
  manual: boolean;

  @ApiPropertyOptional({ description: 'Hoạt động riêng tư (theo Strava private)' })
  @Column({ default: false })
  private: boolean;

  @ApiPropertyOptional({ description: 'Hoạt động bị đánh dấu (theo Strava flagged)' })
  @Column({ default: false })
  flagged: boolean;

  @ApiPropertyOptional({ description: 'Loại workout (theo Strava workout_type)' })
  @Column({ type: 'int', nullable: true })
  workoutType?: number;

  @ApiPropertyOptional({ description: 'Ghi chú cá nhân' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiPropertyOptional({ description: 'Tags hoạt động' })
  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Cài đặt hoạt động' })
  @Column({ type: 'jsonb', nullable: true })
  settings?: any;

  @ApiPropertyOptional({ description: 'Dữ liệu bổ sung' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

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
