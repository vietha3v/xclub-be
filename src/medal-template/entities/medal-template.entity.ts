import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum MedalType {
  GOLD = 'gold',
  SILVER = 'silver',
  BRONZE = 'bronze',
  PARTICIPATION = 'participation',
  SPECIAL = 'special'
}

export enum VariableType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  RANK = 'rank',
  ACHIEVEMENT = 'achievement',
  CHALLENGE_NAME = 'challenge_name',
  PARTICIPANT_NAME = 'participant_name',
  TEAM_NAME = 'team_name',
  COMPLETION_DATE = 'completion_date',
  SCORE = 'score',
  DISTANCE = 'distance',
  TIME = 'time'
}

@Entity('medal_templates')
export class MedalTemplate {
  @ApiProperty({ description: 'ID duy nhất của template' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID người tạo template' })
  @Column()
  @Index()
  userId: string;

  @ApiProperty({ description: 'Tên template' })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({ description: 'Mô tả template', required: false })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Loại huy chương', enum: MedalType })
  @Column({
    type: 'enum',
    enum: MedalType,
    default: MedalType.PARTICIPATION
  })
  type: MedalType;

  @ApiProperty({ description: 'HTML template' })
  @Column({ type: 'text' })
  htmlTemplate: string;

  @ApiProperty({ description: 'URL hình ảnh icon', required: false })
  @Column({ nullable: true })
  iconImage?: string;

  @ApiProperty({ description: 'Màu chủ đạo' })
  @Column({ length: 7, default: '#FFD700' })
  color: string;

  @ApiProperty({ description: 'Các biến template' })
  @Column({ type: 'json' })
  variables: Array<{
    name: string;
    label: string;
    type: VariableType;
    required: boolean;
    defaultValue?: string;
    description?: string;
  }>;

  @ApiProperty({ description: 'Template công khai' })
  @Column({ default: false })
  isPublic: boolean;

  @ApiProperty({ description: 'Template hoạt động' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Thời gian tạo' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Thời gian cập nhật' })
  @UpdateDateColumn()
  updatedAt: Date;
}
