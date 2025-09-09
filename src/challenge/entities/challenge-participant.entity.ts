import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Challenge } from './challenge.entity';

export enum ParticipantStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DROPPED = 'dropped',
  DISQUALIFIED = 'disqualified'
}

@Entity('challenge_participants')
@Index(['challengeId', 'userId'], { unique: true })
@Index(['challengeId', 'status'])
@Index(['userId', 'status'])
export class ChallengeParticipant {
  @ApiProperty({ description: 'ID duy nhất của người tham gia' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID thử thách' })
  @Column({ type: 'uuid' })
  @Index()
  challengeId: string;

  @ApiProperty({ description: 'ID người dùng' })
  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @ApiProperty({ description: 'Trạng thái tham gia' })
  @Column({
    type: 'enum',
    enum: ParticipantStatus,
    default: ParticipantStatus.PENDING
  })
  status: ParticipantStatus;

  @ApiProperty({ description: 'Thời gian tham gia' })
  @CreateDateColumn()
  joinedAt: Date;

  @ApiPropertyOptional({ description: 'Thời gian hoàn thành' })
  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @ApiProperty({ description: 'Tiến độ hiện tại' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentProgress: number;

  @ApiProperty({ description: 'Chuỗi hiện tại' })
  @Column({ type: 'int', default: 0 })
  currentStreak: number;

  @ApiPropertyOptional({ description: 'Hoạt động cuối cùng' })
  @Column({ type: 'timestamp', nullable: true })
  lastActivityAt?: Date;

  @ApiPropertyOptional({ description: 'Xếp hạng cuối cùng' })
  @Column({ type: 'int', nullable: true })
  finalRank?: number;

  @ApiPropertyOptional({ description: 'Điểm số cuối cùng' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  finalScore?: number;

  @ApiPropertyOptional({ description: 'Thời gian hoàn thành (seconds)' })
  @Column({ type: 'int', nullable: true })
  completionTime?: number;

  @ApiPropertyOptional({ description: 'Hoạt động liên quan' })
  @Column({ type: 'simple-array', nullable: true })
  relatedActivities?: string[];

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

  // Relationships
  @ManyToOne(() => Challenge, challenge => challenge.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'challengeId' })
  challenge: Challenge;
}
