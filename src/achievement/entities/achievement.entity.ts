import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AchievementType {
  DISTANCE = 'distance',
  TIME = 'time',
  FREQUENCY = 'frequency',
  STREAK = 'streak',
  SPEED = 'speed',
  ELEVATION = 'elevation',
  CALORIES = 'calories',
  SOCIAL = 'social',
  CHALLENGE = 'challenge',
  EVENT = 'event',
  CUSTOM = 'custom'
}

export enum AchievementTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond'
}

export enum AchievementStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DEPRECATED = 'deprecated'
}

@Entity('achievements')
export class Achievement {
  @ApiProperty({ description: 'ID duy nhất của thành tích' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Mã thành tích (duy nhất)' })
  @Column({ unique: true, length: 20 })
  @Index()
  achievementCode: string;

  @ApiProperty({ description: 'Tên thành tích' })
  @Column({ length: 255 })
  name: string;

  @ApiPropertyOptional({ description: 'Mô tả thành tích' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Loại thành tích' })
  @Column({
    type: 'enum',
    enum: AchievementType,
    default: AchievementType.CUSTOM
  })
  type: AchievementType;

  @ApiProperty({ description: 'Cấp độ thành tích' })
  @Column({
    type: 'enum',
    enum: AchievementTier,
    default: AchievementTier.BRONZE
  })
  tier: AchievementTier;

  @ApiProperty({ description: 'Trạng thái thành tích' })
  @Column({
    type: 'enum',
    enum: AchievementStatus,
    default: AchievementStatus.ACTIVE
  })
  status: AchievementStatus;

  @ApiPropertyOptional({ description: 'ID câu lạc bộ tạo thành tích' })
  @Column({ nullable: true })
  @Index()
  clubId?: string;

  @ApiProperty({ description: 'ID người tạo thành tích' })
  @Column()
  @Index()
  createdBy: string;

  @ApiPropertyOptional({ description: 'Điều kiện để đạt được thành tích' })
  @Column({ type: 'jsonb', nullable: true })
  conditions?: any;

  @ApiPropertyOptional({ description: 'Giá trị mục tiêu' })
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  targetValue?: number;

  @ApiPropertyOptional({ description: 'Đơn vị của giá trị mục tiêu' })
  @Column({ length: 20, nullable: true })
  targetUnit?: string;

  @ApiPropertyOptional({ description: 'Thời gian giới hạn (giây)' })
  @Column({ type: 'int', nullable: true })
  timeLimit?: number;

  @ApiPropertyOptional({ description: 'Số lần thực hiện tối thiểu' })
  @Column({ type: 'int', nullable: true })
  minOccurrences?: number;

  @ApiPropertyOptional({ description: 'Số ngày liên tiếp tối thiểu' })
  @Column({ type: 'int', nullable: true })
  minStreak?: number;

  @ApiPropertyOptional({ description: 'Điểm thưởng khi đạt được' })
  @Column({ type: 'int', default: 0 })
  points: number;

  @ApiPropertyOptional({ description: 'Huy hiệu thành tích' })
  @Column({ nullable: true })
  badgeUrl?: string;

  @ApiPropertyOptional({ description: 'Chứng chỉ thành tích' })
  @Column({ nullable: true })
  certificateUrl?: string;

  @ApiPropertyOptional({ description: 'Phần thưởng bổ sung' })
  @Column({ type: 'jsonb', nullable: true })
  rewards?: any;

  @ApiPropertyOptional({ description: 'Ảnh minh họa thành tích' })
  @Column({ nullable: true })
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Tags thành tích' })
  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Thống kê thành tích' })
  @Column({ type: 'jsonb', nullable: true })
  stats?: any;

  @ApiPropertyOptional({ description: 'Cài đặt thành tích' })
  @Column({ type: 'jsonb', nullable: true })
  settings?: any;

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
