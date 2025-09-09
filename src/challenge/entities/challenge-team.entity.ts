import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Challenge } from './challenge.entity';

@Entity('challenge_teams')
@Index(['challengeId', 'clubId'], { unique: true })
export class ChallengeTeam {
  @ApiProperty({ description: 'ID duy nhất của team' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID thử thách' })
  @Column({ type: 'uuid' })
  @Index()
  challengeId: string;

  @ApiProperty({ description: 'ID câu lạc bộ' })
  @Column({ type: 'uuid' })
  @Index()
  clubId: string;

  @ApiProperty({ description: 'Tên team' })
  @Column({ length: 255 })
  teamName: string;

  @ApiProperty({ description: 'Tổng khoảng cách đã chạy (km)' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalDistance: number;

  @ApiProperty({ description: 'Số lượng thành viên' })
  @Column({ type: 'int', default: 0 })
  memberCount: number;

  @ApiPropertyOptional({ description: 'Xếp hạng cuối cùng' })
  @Column({ type: 'int', nullable: true })
  finalRank?: number;

  @ApiPropertyOptional({ description: 'Điểm số cuối cùng' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  finalScore?: number;

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

  @OneToMany('ChallengeTeamMember', 'team')
  members: any[];
}
