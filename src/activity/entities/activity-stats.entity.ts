import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('activity_stats')
export class ActivityStats {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  // Tổng số liệu
  @Column({ type: 'int', default: 0 })
  totalActivities: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalDistance: number; // km

  @Column({ type: 'int', default: 0 })
  totalDuration: number; // seconds

  @Column({ type: 'int', default: 0 })
  totalCalories: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  totalElevationGain: number; // meters

  // Thống kê trung bình
  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  averageSpeed: number; // km/h

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  averagePace: number; // seconds/km

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  averageHeartRate: number; // bpm

  // Kỷ lục
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  longestDistance: number; // km

  @Column({ type: 'int', default: 0 })
  longestDuration: number; // seconds

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  fastestPace: number; // seconds/km

  @Column({ type: 'int', default: 0 })
  mostCalories: number;

  // Thống kê theo loại hoạt động (JSON)
  @Column({ type: 'json', nullable: true })
  activitiesByType: any;

  // Thống kê gần đây (JSON)
  @Column({ type: 'json', nullable: true })
  recentStats: any;

  // Thống kê năm nay (JSON)
  @Column({ type: 'json', nullable: true })
  ytdStats: any;

  // Thống kê CLB/giải/thử thách (JSON)
  @Column({ type: 'json', nullable: true })
  clubStats: any;

  // Dữ liệu gốc từ Strava (JSON)
  @Column({ type: 'json', nullable: true })
  stravaStats: any;

  // Nguồn dữ liệu
  @Column({ type: 'varchar', length: 50, default: 'strava' })
  source: string;

  // Thời gian đồng bộ cuối
  @Column({ type: 'timestamp', nullable: true })
  lastSyncedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

