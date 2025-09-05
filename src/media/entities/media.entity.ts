import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  ARCHIVE = 'archive',
  OTHER = 'other'
}

export enum MediaStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  READY = 'ready',
  ERROR = 'error',
  DELETED = 'deleted'
}

export enum MediaVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  CLUB_ONLY = 'club_only',
  FRIENDS_ONLY = 'friends_only',
  FOLLOWERS_ONLY = 'followers_only'
}

@Entity('media')
export class Media {
  @ApiProperty({ description: 'ID duy nhất của media' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Mã media (duy nhất)' })
  @Column({ unique: true, length: 20 })
  @Index()
  mediaCode: string;

  @ApiProperty({ description: 'Tên file gốc' })
  @Column({ length: 255 })
  originalName: string;

  @ApiProperty({ description: 'Tên file đã lưu' })
  @Column({ length: 255 })
  fileName: string;

  @ApiProperty({ description: 'Loại media' })
  @Column({
    type: 'enum',
    enum: MediaType,
    default: MediaType.OTHER
  })
  type: MediaType;

  @ApiProperty({ description: 'Trạng thái media' })
  @Column({
    type: 'enum',
    enum: MediaStatus,
    default: MediaStatus.UPLOADING
  })
  status: MediaStatus;

  @ApiProperty({ description: 'Quyền riêng tư' })
  @Column({
    type: 'enum',
    enum: MediaVisibility,
    default: MediaVisibility.PUBLIC
  })
  visibility: MediaVisibility;

  @ApiProperty({ description: 'ID người tải lên' })
  @Column()
  @Index()
  uploadedBy: string;

  @ApiPropertyOptional({ description: 'ID câu lạc bộ liên quan' })
  @Column({ nullable: true })
  @Index()
  clubId?: string;

  @ApiPropertyOptional({ description: 'ID đối tượng liên quan' })
  @Column({ nullable: true })
  @Index()
  relatedObjectId?: string;

  @ApiPropertyOptional({ description: 'Loại đối tượng liên quan' })
  @Column({ length: 50, nullable: true })
  relatedObjectType?: string;

  @ApiProperty({ description: 'Kích thước file (bytes)' })
  @Column({ type: 'bigint' })
  fileSize: number;

  @ApiProperty({ description: 'MIME type' })
  @Column({ length: 100 })
  mimeType: string;

  @ApiPropertyOptional({ description: 'Đường dẫn file gốc' })
  @Column({ nullable: true })
  filePath?: string;

  @ApiPropertyOptional({ description: 'URL truy cập' })
  @Column({ nullable: true })
  url?: string;

  @ApiPropertyOptional({ description: 'URL thumbnail' })
  @Column({ nullable: true })
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'URL preview' })
  @Column({ nullable: true })
  previewUrl?: string;

  @ApiPropertyOptional({ description: 'Chiều rộng (cho ảnh/video)' })
  @Column({ type: 'int', nullable: true })
  width?: number;

  @ApiPropertyOptional({ description: 'Chiều cao (cho ảnh/video)' })
  @Column({ type: 'int', nullable: true })
  height?: number;

  @ApiPropertyOptional({ description: 'Thời lượng (cho video/audio, giây)' })
  @Column({ type: 'int', nullable: true })
  duration?: number;

  @ApiPropertyOptional({ description: 'Bitrate (cho video/audio)' })
  @Column({ type: 'int', nullable: true })
  bitrate?: number;

  @ApiPropertyOptional({ description: 'FPS (cho video)' })
  @Column({ type: 'int', nullable: true })
  fps?: number;

  @ApiPropertyOptional({ description: 'Metadata của file' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @ApiPropertyOptional({ description: 'Thông tin xử lý' })
  @Column({ type: 'jsonb', nullable: true })
  processing?: any;

  @ApiPropertyOptional({ description: 'Cài đặt media' })
  @Column({ type: 'jsonb', nullable: true })
  settings?: any;

  @ApiPropertyOptional({ description: 'Ghi chú media' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiPropertyOptional({ description: 'Tags media' })
  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Số lượt xem' })
  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @ApiPropertyOptional({ description: 'Số lượt tải' })
  @Column({ type: 'int', default: 0 })
  downloadCount: number;

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
}
