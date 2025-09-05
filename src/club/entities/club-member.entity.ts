import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Club } from './club.entity';
import { User } from '../../user/entities/user.entity';

export enum MemberRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  MEMBER = 'member'
}

export enum MemberStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

@Entity('club_members')
@Index(['clubId', 'userId'], { unique: true })
@Index(['clubId', 'role'])
@Index(['userId', 'status'])
export class ClubMember {
  @ApiProperty({ description: 'ID duy nhất của thành viên câu lạc bộ' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID câu lạc bộ' })
  @Column({ type: 'uuid' })
  clubId: string;

  @ApiProperty({ description: 'ID người dùng' })
  @Column({ type: 'uuid' })
  userId: string;

  @ApiProperty({ description: 'Vai trò trong câu lạc bộ' })
  @Column({
    type: 'enum',
    enum: MemberRole,
    default: MemberRole.MEMBER
  })
  role: MemberRole;

  @ApiProperty({ description: 'Trạng thái thành viên' })
  @Column({
    type: 'enum',
    enum: MemberStatus,
    default: MemberStatus.ACTIVE
  })
  status: MemberStatus;

  @ApiProperty({ description: 'Thời gian tham gia câu lạc bộ' })
  @CreateDateColumn()
  joinedAt: Date;

  @ApiPropertyOptional({ description: 'Thời gian rời câu lạc bộ' })
  @Column({ type: 'timestamp', nullable: true })
  leftAt?: Date;

  @ApiPropertyOptional({ description: 'Lý do rời câu lạc bộ' })
  @Column({ type: 'text', nullable: true })
  leaveReason?: string;

  @ApiPropertyOptional({ description: 'Ghi chú về thành viên' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiPropertyOptional({ description: 'Thông tin bổ sung' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  // Relationships
  @ManyToOne(() => Club, club => club.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clubId' })
  club: Club;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
