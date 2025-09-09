import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChallengeTeam } from './challenge-team.entity';

@Entity('challenge_team_members')
@Index(['teamId', 'userId'], { unique: true })
export class ChallengeTeamMember {
  @ApiProperty({ description: 'ID duy nhất của thành viên team' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID team' })
  @Column({ type: 'uuid' })
  @Index()
  teamId: string;

  @ApiProperty({ description: 'ID người dùng' })
  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @ApiProperty({ description: 'Khoảng cách đóng góp (km)' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  contributedDistance: number;

  @ApiProperty({ description: 'Số lượng hoạt động' })
  @Column({ type: 'int', default: 0 })
  activityCount: number;

  @ApiProperty({ description: 'Trạng thái xóa mềm' })
  @Column({ default: false })
  isDeleted: boolean;

  @ApiProperty({ description: 'Thời gian tham gia' })
  @CreateDateColumn()
  joinedAt: Date;

  @ApiProperty({ description: 'Thời gian cập nhật' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => ChallengeTeam, team => team.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teamId' })
  team: ChallengeTeam;
}
