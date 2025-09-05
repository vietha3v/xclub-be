import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Challenge } from './challenge.entity';

@Entity('challenge_leaderboards')
@Index(['challengeId', 'rank'], { unique: true })
@Index(['challengeId', 'userId'])
@Index(['challengeId', 'score'])
export class ChallengeLeaderboard {
  @ApiProperty({ description: 'ID duy nhất của bảng xếp hạng' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID thử thách' })
  @Column({ type: 'uuid' })
  @Index()
  challengeId: string;

  @ApiProperty({ description: 'Xếp hạng' })
  @Column({ type: 'int' })
  rank: number;

  @ApiProperty({ description: 'ID người dùng' })
  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @ApiProperty({ description: 'Điểm số' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  score: number;

  @ApiProperty({ description: 'Tiến độ hiện tại' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  progress: number;

  @ApiProperty({ description: 'Chuỗi hiện tại' })
  @Column({ type: 'int' })
  streak: number;

  @ApiPropertyOptional({ description: 'Thời gian hoàn thành (seconds)' })
  @Column({ type: 'int', nullable: true })
  completionTime?: number;

  @ApiPropertyOptional({ description: 'Thời gian cập nhật cuối' })
  @Column({ type: 'timestamp', nullable: true })
  lastUpdatedAt?: Date;

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
