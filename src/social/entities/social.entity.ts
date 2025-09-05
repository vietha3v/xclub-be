import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SocialType {
  POST = 'post',
  COMMENT = 'comment',
  LIKE = 'like',
  SHARE = 'share',
  FOLLOW = 'follow',
  MENTION = 'mention',
  HASHTAG = 'hashtag',
  OTHER = 'other'
}

export enum SocialStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  HIDDEN = 'hidden',
  REPORTED = 'reported',
  DELETED = 'deleted'
}

export enum SocialVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  FRIENDS_ONLY = 'friends_only',
  CLUB_ONLY = 'club_only',
  FOLLOWERS_ONLY = 'followers_only'
}

@Entity('social')
export class Social {
  @ApiProperty({ description: 'ID duy nhất của nội dung xã hội' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Mã nội dung (duy nhất)' })
  @Column({ unique: true, length: 20 })
  @Index()
  socialCode: string;

  @ApiProperty({ description: 'Loại nội dung xã hội' })
  @Column({
    type: 'enum',
    enum: SocialType,
    default: SocialType.OTHER
  })
  type: SocialType;

  @ApiProperty({ description: 'Trạng thái nội dung' })
  @Column({
    type: 'enum',
    enum: SocialStatus,
    default: SocialStatus.ACTIVE
  })
  status: SocialStatus;

  @ApiProperty({ description: 'Quyền riêng tư' })
  @Column({
    type: 'enum',
    enum: SocialVisibility,
    default: SocialVisibility.PUBLIC
  })
  visibility: SocialVisibility;

  @ApiProperty({ description: 'ID người tạo nội dung' })
  @Column()
  @Index()
  authorId: string;

  @ApiPropertyOptional({ description: 'ID câu lạc bộ liên quan' })
  @Column({ nullable: true })
  @Index()
  clubId?: string;

  @ApiPropertyOptional({ description: 'ID nội dung gốc (cho comment, like, share)' })
  @Column({ nullable: true })
  @Index()
  parentId?: string;

  @ApiPropertyOptional({ description: 'Loại nội dung gốc' })
  @Column({ length: 50, nullable: true })
  parentType?: string;

  @ApiPropertyOptional({ description: 'Tiêu đề nội dung' })
  @Column({ length: 255, nullable: true })
  title?: string;

  @ApiPropertyOptional({ description: 'Nội dung chính' })
  @Column({ type: 'text', nullable: true })
  content?: string;

  @ApiPropertyOptional({ description: 'Ảnh đính kèm' })
  @Column({ type: 'simple-array', nullable: true })
  images?: string[];

  @ApiPropertyOptional({ description: 'Video đính kèm' })
  @Column({ type: 'simple-array', nullable: true })
  videos?: string[];

  @ApiPropertyOptional({ description: 'Liên kết đính kèm' })
  @Column({ type: 'simple-array', nullable: true })
  links?: string[];

  @ApiPropertyOptional({ description: 'Vị trí đăng bài' })
  @Column({ type: 'jsonb', nullable: true })
  location?: any;

  @ApiPropertyOptional({ description: 'Hashtags' })
  @Column({ type: 'simple-array', nullable: true })
  hashtags?: string[];

  @ApiPropertyOptional({ description: 'Mentions' })
  @Column({ type: 'simple-array', nullable: true })
  mentions?: string[];

  @ApiPropertyOptional({ description: 'Số lượt thích' })
  @Column({ type: 'int', default: 0 })
  likeCount: number;

  @ApiPropertyOptional({ description: 'Số lượt bình luận' })
  @Column({ type: 'int', default: 0 })
  commentCount: number;

  @ApiPropertyOptional({ description: 'Số lượt chia sẻ' })
  @Column({ type: 'int', default: 0 })
  shareCount: number;

  @ApiPropertyOptional({ description: 'Số lượt xem' })
  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @ApiPropertyOptional({ description: 'Dữ liệu bổ sung' })
  @Column({ type: 'jsonb', nullable: true })
  data?: any;

  @ApiPropertyOptional({ description: 'Cài đặt nội dung' })
  @Column({ type: 'jsonb', nullable: true })
  settings?: any;

  @ApiPropertyOptional({ description: 'Ghi chú nội dung' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiPropertyOptional({ description: 'Tags nội dung' })
  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

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
