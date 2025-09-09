import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Challenge } from './challenge.entity';
import { ChallengeTeam } from './challenge-team.entity';

@Entity('challenge_team_leaderboards')
@Index(['challengeId', 'rank'], { unique: true })
@Index(['challengeId', 'teamId'])
export class ChallengeTeamLeaderboard {
  @ApiProperty({ description: 'ID duy nhất của bảng xếp hạng team' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID thử thách' })
  @Column({ type: 'uuid' })
  @Index()
  challengeId: string;

  @ApiProperty({ description: 'Xếp hạng' })
  @Column({ type: 'int' })
  rank: number;

  @ApiProperty({ description: 'ID team' })
  @Column({ type: 'uuid' })
  @Index()
  teamId: string;

  @ApiProperty({ description: 'Tổng khoảng cách (km)' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalDistance: number;

  @ApiProperty({ description: 'Số lượng thành viên' })
  @Column({ type: 'int' })
  memberCount: number;

  @ApiProperty({ description: 'Khoảng cách trung bình (km)' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  averageDistance: number;

  @ApiPropertyOptional({ description: 'Thời gian cập nhật cuối' })
  @Column({ type: 'timestamp', nullable: true })
  lastUpdatedAt?: Date;

  @ApiProperty({ description: 'Trạng thái xóa mềm' })
  @Column({ default: false })
  isDeleted: boolean;

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

  @ManyToOne(() => ChallengeTeam, team => team.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teamId' })
  team: ChallengeTeam;
}
