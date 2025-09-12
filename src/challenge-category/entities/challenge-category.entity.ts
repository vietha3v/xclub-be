import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Challenge } from '../../challenge/entities/challenge.entity';

export enum CategoryType {
  DISTANCE = 'distance',
  TIME = 'time',
  REPETITION = 'repetition',
  CUSTOM = 'custom'
}

@Entity('challenge_categories')
export class ChallengeCategory {
  @ApiProperty({ description: 'ID duy nhất của danh mục' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID thử thách' })
  @Column()
  @Index()
  challengeId: string;

  @ApiProperty({ description: 'Tên danh mục' })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({ description: 'Mô tả danh mục', required: false })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Loại danh mục', enum: CategoryType })
  @Column({
    type: 'enum',
    enum: CategoryType,
    default: CategoryType.CUSTOM
  })
  type: CategoryType;

  @ApiProperty({ description: 'Đơn vị đo lường' })
  @Column({ length: 50 })
  unit: string;

  @ApiProperty({ description: 'Giá trị tối thiểu', required: false })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minValue?: number;

  @ApiProperty({ description: 'Giá trị tối đa', required: false })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxValue?: number;

  @ApiProperty({ description: 'Danh mục bắt buộc' })
  @Column({ default: false })
  isRequired: boolean;

  @ApiProperty({ description: 'Danh mục hoạt động' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Thứ tự sắp xếp' })
  @Column({ default: 0 })
  sortOrder: number;

  @ApiProperty({ description: 'Thời gian tạo' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Thời gian cập nhật' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Challenge, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'challengeId' })
  challenge: Challenge;
}
