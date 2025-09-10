import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ChallengeStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  PUBLISHED = 'published'
}

export enum ChallengeType {
  DISTANCE = 'distance',
  FREQUENCY = 'frequency',
  SPEED = 'speed',
  TIME = 'time',
  STREAK = 'streak',
  COMBINED = 'combined',
  CUSTOM = 'custom'
}

export enum ChallengeCategory {
  INDIVIDUAL = 'individual',
  TEAM = 'team'
}

export enum ChallengeDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXTREME = 'extreme'
}

export enum ChallengeVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  CLUB_ONLY = 'club_only',
  INVITE_ONLY = 'invite_only'
}

@Entity('challenges')
export class Challenge {
  @ApiProperty({ description: 'ID duy nhất của thử thách' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Mã thử thách (duy nhất)' })
  @Column({ unique: true, length: 20 })
  @Index()
  challengeCode: string;

  @ApiProperty({ description: 'Tên thử thách' })
  @Column({ length: 255 })
  name: string;

  @ApiPropertyOptional({ description: 'Mô tả thử thách' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Loại thử thách' })
  @Column({
    type: 'enum',
    enum: ChallengeType,
    default: ChallengeType.DISTANCE
  })
  type: ChallengeType;

  @ApiProperty({ description: 'Trạng thái thử thách' })
  @Column({
    type: 'enum',
    enum: ChallengeStatus,
    default: ChallengeStatus.PUBLISHED
  })
  status: ChallengeStatus;

  @ApiProperty({ description: 'Độ khó thử thách' })
  @Column({
    type: 'enum',
    enum: ChallengeDifficulty,
    default: ChallengeDifficulty.MEDIUM
  })
  difficulty: ChallengeDifficulty;

  @ApiProperty({ description: 'Quyền riêng tư thử thách' })
  @Column({
    type: 'enum',
    enum: ChallengeVisibility,
    default: ChallengeVisibility.PUBLIC
  })
  visibility: ChallengeVisibility;

  @ApiProperty({ description: 'Phân loại thử thách' })
  @Column({
    type: 'enum',
    enum: ChallengeCategory,
    default: ChallengeCategory.INDIVIDUAL
  })
  category: ChallengeCategory;

  @ApiProperty({ description: 'ID câu lạc bộ tạo thử thách' })
  @Column({ nullable: true })
  @Index()
  clubId?: string;

  @ApiPropertyOptional({ description: 'ID sự kiện liên quan' })
  @Column({ nullable: true })
  @Index()
  eventId?: string;

  @ApiProperty({ description: 'ID người tạo thử thách' })
  @Column()
  @Index()
  createdBy: string;

  @ApiProperty({ description: 'Thời gian bắt đầu thử thách' })
  @Column({ type: 'timestamp' })
  startDate: Date;

  @ApiProperty({ description: 'Thời gian kết thúc thử thách' })
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

  @ApiPropertyOptional({ description: 'Số lượng thành viên tối đa mỗi team' })
  @Column({ type: 'int', nullable: true })
  maxTeamMembers?: number;

  @ApiPropertyOptional({ description: 'Số lượng team tối đa' })
  @Column({ type: 'int', nullable: true })
  maxTeams?: number;

  @ApiPropertyOptional({ description: 'Khoảng cách tối thiểu mỗi tracklog (km)' })
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  minTracklogDistance?: number;

  @ApiPropertyOptional({ description: 'Khoảng cách tối đa mỗi cá nhân được tính (km)' })
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  maxIndividualContribution?: number;

  @ApiPropertyOptional({ description: 'Khoảng cách mục tiêu (mét)' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  targetDistance?: number;

  @ApiPropertyOptional({ description: 'Thời gian mục tiêu (giây)' })
  @Column({ type: 'int', nullable: true })
  targetTime?: number;

  @ApiPropertyOptional({ description: 'Số lần thực hiện mục tiêu' })
  @Column({ type: 'int', nullable: true })
  targetFrequency?: number;

  @ApiPropertyOptional({ description: 'Số ngày liên tiếp mục tiêu' })
  @Column({ type: 'int', nullable: true })
  targetStreak?: number;

  @ApiProperty({ description: 'Giá trị mục tiêu' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  targetValue: number;

  @ApiProperty({ description: 'Đơn vị mục tiêu' })
  @Column({ length: 20 })
  targetUnit: string;

  @ApiProperty({ description: 'Giới hạn thời gian (days)' })
  @Column({ type: 'int' })
  timeLimit: number;

  @ApiPropertyOptional({ description: 'Số lần tối thiểu' })
  @Column({ type: 'int', default: 1 })
  minOccurrences: number;

  @ApiPropertyOptional({ description: 'Chuỗi liên tiếp tối thiểu' })
  @Column({ type: 'int', default: 1 })
  minStreak: number;

  @ApiPropertyOptional({ description: 'Khoảng cách tối thiểu mỗi lần (km)' })
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  minDistance?: number;

  @ApiPropertyOptional({ description: 'Khoảng cách tối đa mỗi lần (km)' })
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  maxDistance?: number;

  @ApiPropertyOptional({ description: 'ID huy chương liên kết' })
  @Column({ nullable: true })
  achievementId?: string;


  @ApiProperty({ description: 'Điểm thưởng' })
  @Column({ type: 'int', default: 0 })
  points: number;

  @ApiPropertyOptional({ description: 'Có cấp giấy chứng nhận điện tử' })
  @Column({ default: false })
  hasDigitalCertificate: boolean;

  @ApiPropertyOptional({ description: 'Điều kiện thử thách (JSON)' })
  @Column({ type: 'jsonb', nullable: true })
  conditions?: any;

  @ApiPropertyOptional({ description: 'Phần thưởng thử thách' })
  @Column({ type: 'jsonb', nullable: true })
  rewards?: any;

  @ApiPropertyOptional({ description: 'Quy tắc thử thách' })
  @Column({ type: 'text', nullable: true })
  rules?: string;

  @ApiPropertyOptional({ description: 'Ảnh bìa thử thách' })
  @Column({ nullable: true })
  coverImageUrl?: string;

  @ApiPropertyOptional({ description: 'Tags thử thách' })
  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Danh sách người tham gia' })
  @Column({ type: 'simple-array', nullable: true })
  participants?: string[];

  @ApiPropertyOptional({ description: 'Danh sách người hoàn thành' })
  @Column({ type: 'simple-array', nullable: true })
  completers?: string[];

  @ApiPropertyOptional({ description: 'Thống kê thử thách' })
  @Column({ type: 'jsonb', nullable: true })
  stats?: any;

  @ApiPropertyOptional({ description: 'Cài đặt thử thách' })
  @Column({ type: 'jsonb', nullable: true })
  settings?: any;

  @ApiProperty({ description: 'Số người tham gia' })
  @Column({ type: 'int', default: 0 })
  participantCount: number;

  @ApiProperty({ description: 'Số người hoàn thành' })
  @Column({ type: 'int', default: 0 })
  completedCount: number;

  @ApiProperty({ description: 'Cho phép đăng ký tự do' })
  @Column({ default: true })
  allowFreeRegistration: boolean;

  @ApiPropertyOptional({ description: 'Mật khẩu phê duyệt tự động' })
  @Column({ nullable: true })
  autoApprovalPassword?: string;


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
