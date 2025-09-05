import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Integration } from './integration.entity';

export enum UserIntegrationSyncStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  SYNCING = 'syncing',
  PENDING = 'pending'
}

@Entity('user_integrations')
export class UserIntegration {
  @ApiProperty({ description: 'ID duy nhất của tích hợp người dùng' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID người dùng' })
  @Column()
  @Index()
  userId: string;

  @ApiProperty({ description: 'ID tích hợp' })
  @Column()
  @Index()
  integrationId: string;

  @ApiPropertyOptional({ description: 'ID người dùng từ platform bên ngoài' })
  @Column({ nullable: true })
  externalUserId?: string;

  @ApiPropertyOptional({ description: 'Access Token' })
  @Column({ nullable: true })
  accessToken?: string;

  @ApiPropertyOptional({ description: 'Refresh Token' })
  @Column({ nullable: true })
  refreshToken?: string;

  @ApiPropertyOptional({ description: 'Token Expiry' })
  @Column({ type: 'timestamp', nullable: true })
  tokenExpiry?: Date;

  @ApiPropertyOptional({ description: 'Thời gian đồng bộ cuối cùng' })
  @Column({ type: 'timestamp', nullable: true })
  lastSyncedAt?: Date;

  @ApiProperty({ description: 'Trạng thái đồng bộ' })
  @Column({
    type: 'enum',
    enum: UserIntegrationSyncStatus,
    default: UserIntegrationSyncStatus.INACTIVE
  })
  syncStatus: UserIntegrationSyncStatus;

  @ApiPropertyOptional({ description: 'Cài đặt tích hợp' })
  @Column({ type: 'jsonb', nullable: true })
  settings?: any;

  @ApiProperty({ description: 'Trạng thái hoạt động' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Thời gian tạo' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Thời gian cập nhật' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Integration, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'integrationId' })
  integration: Integration;
}


