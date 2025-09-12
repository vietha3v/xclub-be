import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum CertificateType {
  COMPLETION = 'completion',
  ACHIEVEMENT = 'achievement',
  PARTICIPATION = 'participation',
  WINNER = 'winner'
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

@Entity('certificate_templates')
export class CertificateTemplate {
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

  @ApiProperty({ description: 'Loại giấy chứng nhận', enum: CertificateType })
  @Column({
    type: 'enum',
    enum: CertificateType,
    default: CertificateType.COMPLETION
  })
  type: CertificateType;

  @ApiProperty({ description: 'HTML template' })
  @Column({ type: 'text' })
  htmlTemplate: string;

  @ApiProperty({ description: 'URL hình nền', required: false })
  @Column({ nullable: true })
  backgroundImage?: string;

  @ApiProperty({ description: 'URL logo', required: false })
  @Column({ nullable: true })
  logoImage?: string;

  @ApiProperty({ description: 'URL chữ ký', required: false })
  @Column({ nullable: true })
  signatureImage?: string;

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
