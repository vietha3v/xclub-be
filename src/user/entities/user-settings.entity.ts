import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from './user.entity';

export enum SettingType {
  NOTIFICATION = 'notification',
  SECURITY = 'security',
  PRIVACY = 'privacy',
  PREFERENCE = 'preference'
}

@Entity('user_settings')
@Index(['userId', 'settingType', 'settingKey'], { unique: true })
export class UserSettings {
  @ApiProperty({ description: 'ID duy nhất của cài đặt' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID của user' })
  @Column({ name: 'userId' })
  userId: string;

  @ApiProperty({ 
    description: 'Loại cài đặt',
    enum: SettingType,
    example: SettingType.NOTIFICATION
  })
  @Column({ 
    type: 'enum', 
    enum: SettingType, 
    name: 'settingType'
  })
  settingType: SettingType;

  @ApiProperty({ 
    description: 'Khóa cài đặt',
    example: 'email_notifications'
  })
  @Column({ 
    type: 'varchar', 
    length: 100, 
    name: 'settingKey'
  })
  settingKey: string;

  @ApiProperty({ 
    description: 'Giá trị cài đặt (JSON)',
    example: { enabled: true, frequency: 'daily' }
  })
  @Column({ 
    type: 'jsonb', 
    name: 'settingValue'
  })
  settingValue: any;

  @ApiProperty({ 
    description: 'Trạng thái hoạt động',
    example: true,
    default: true
  })
  @Column({ 
    type: 'boolean', 
    default: true, 
    name: 'isActive'
  })
  isActive: boolean = true;

  @ApiProperty({ description: 'Thời gian tạo' })
  @CreateDateColumn({ 
    type: 'timestamp', 
    name: 'createdAt'
  })
  createdAt: Date;

  @ApiProperty({ description: 'Thời gian cập nhật cuối' })
  @UpdateDateColumn({ 
    type: 'timestamp', 
    name: 'updatedAt'
  })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}


