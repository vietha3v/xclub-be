import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Challenge } from './challenge.entity';

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired'
}

@Entity('challenge_invitations')
@Index(['challengeId', 'invitedClubId'], { unique: true })
export class ChallengeInvitation {
  @ApiProperty({ description: 'ID duy nhất của lời mời' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID thử thách' })
  @Column({ type: 'uuid' })
  @Index()
  challengeId: string;

  @ApiProperty({ description: 'ID câu lạc bộ được mời' })
  @Column({ type: 'uuid' })
  @Index()
  invitedClubId: string;

  @ApiProperty({ description: 'ID người gửi lời mời' })
  @Column({ type: 'uuid' })
  @Index()
  invitedBy: string;

  @ApiProperty({ description: 'Trạng thái lời mời' })
  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING
  })
  status: InvitationStatus;

  @ApiPropertyOptional({ description: 'Thời gian hết hạn' })
  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @ApiPropertyOptional({ description: 'Thời gian phản hồi' })
  @Column({ type: 'timestamp', nullable: true })
  respondedAt?: Date;

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
