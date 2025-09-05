import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like, Between } from 'typeorm';
import { Media, MediaType, MediaStatus } from './entities/media.entity';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { QueryMediaDto } from './dto/query-media.dto';
import { UploadMediaDto } from './dto/upload-media.dto';
import { UserService } from '../user/user.service';
import { ClubService } from '../club/club.service';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { createPaginatedResult, getPaginationParams } from '../common/utils/pagination.util';
import { generateCode } from '../common/utils/code-generator';

export interface MediaStats {
  totalMedia: number;
  totalSize: number;
  typeBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
  mimeTypeBreakdown: Record<string, number>;
  sizeBreakdown: Record<string, number>;
  uploadsThisMonth: number;
  sizeThisMonth: number;
}

export interface UploadResult {
  success: boolean;
  mediaId?: string;
  url?: string;
  message: string;
  error?: string;
}

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    private readonly userService: UserService,
    private readonly clubService: ClubService,
  ) {}

  /**
   * Tạo media mới
   */
  async create(createMediaDto: CreateMediaDto, userId: string): Promise<Media> {
    // Kiểm tra người upload tồn tại
    if (createMediaDto.uploadedBy) {
      await this.userService.findOne(createMediaDto.uploadedBy);
    }

    // Kiểm tra CLB tồn tại nếu có
    if (createMediaDto.clubId) {
      await this.clubService.findOne(createMediaDto.clubId);
    }

    const media = this.mediaRepository.create({
      ...createMediaDto,
      uploadedBy: createMediaDto.uploadedBy || userId,
      status: MediaStatus.READY,
      visibility: (createMediaDto.privacy as any) || 'public',
    });

    return await this.mediaRepository.save(media);
  }

  /**
   * Lấy danh sách media với phân trang và tìm kiếm
   */
  async findAll(queryDto: QueryMediaDto): Promise<PaginatedResult<Media>> {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      type, 
      status, 
      mimeType, 
      uploadedBy, 
      clubId, 
      relatedObjectId, 
      relatedObjectType, 
      minSize, 
      maxSize, 
      createdFrom, 
      createdTo, 
      tags, 
      privacy,
      sortBy, 
      sortOrder 
    } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.mediaRepository.createQueryBuilder('media')
      .where('media.isDeleted = :isDeleted', { isDeleted: false });

    // Tìm kiếm
    if (search) {
      queryBuilder.andWhere(
        '(media.name ILIKE :search OR media.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Lọc theo loại
    if (type) {
      queryBuilder.andWhere('media.type = :type', { type });
    }

    // Lọc theo trạng thái
    if (status) {
      queryBuilder.andWhere('media.status = :status', { status });
    }

    // Lọc theo MIME type
    if (mimeType) {
      queryBuilder.andWhere('media.mimeType = :mimeType', { mimeType });
    }

    // Lọc theo người upload
    if (uploadedBy) {
      queryBuilder.andWhere('media.uploadedBy = :uploadedBy', { uploadedBy });
    }

    // Lọc theo CLB
    if (clubId) {
      queryBuilder.andWhere('media.clubId = :clubId', { clubId });
    }

    // Lọc theo đối tượng liên quan
    if (relatedObjectId) {
      queryBuilder.andWhere('media.relatedObjectId = :relatedObjectId', { relatedObjectId });
    }

    if (relatedObjectType) {
      queryBuilder.andWhere('media.relatedObjectType = :relatedObjectType', { relatedObjectType });
    }

    // Lọc theo kích thước
    if (minSize !== undefined) {
      queryBuilder.andWhere('media.size >= :minSize', { minSize });
    }

    if (maxSize !== undefined) {
      queryBuilder.andWhere('media.size <= :maxSize', { maxSize });
    }

    // Lọc theo ngày tạo
    if (createdFrom) {
      queryBuilder.andWhere('media.createdAt >= :createdFrom', { createdFrom });
    }

    if (createdTo) {
      queryBuilder.andWhere('media.createdAt <= :createdTo', { createdTo });
    }

    // Lọc theo tags
    if (tags) {
      queryBuilder.andWhere('media.tags @> :tags', { tags: [tags] });
    }

    // Lọc theo quyền riêng tư
    if (privacy) {
      queryBuilder.andWhere('media.privacy = :privacy', { privacy });
    }

    // Sắp xếp
    const orderBy = sortBy || 'createdAt';
    const order = sortOrder || 'DESC';
    queryBuilder.orderBy(`media.${orderBy}`, order);

    // Phân trang
    queryBuilder.skip(skip).take(limit);

    const [media, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResult(media, total, page, limit);
  }

  /**
   * Lấy media theo ID
   */
  async findOne(id: string): Promise<Media> {
    const media = await this.mediaRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!media) {
      throw new NotFoundException('Không tìm thấy media');
    }

    return media;
  }

  /**
   * Lấy media theo URL
   */
  async findByUrl(url: string): Promise<Media> {
    const media = await this.mediaRepository.findOne({
      where: { url, isDeleted: false },
    });

    if (!media) {
      throw new NotFoundException('Không tìm thấy media');
    }

    return media;
  }

  /**
   * Cập nhật media
   */
  async update(id: string, updateMediaDto: UpdateMediaDto, userId: string): Promise<Media> {
    const media = await this.findOne(id);

    // Kiểm tra quyền sửa (chỉ người upload hoặc admin)
    if (media.uploadedBy !== userId) {
      const user = await this.userService.findOne(userId);
      if (!user.roles || !user.roles.includes('admin')) {
        throw new ForbiddenException('Không có quyền cập nhật media này');
      }
    }

    Object.assign(media, updateMediaDto);
    return await this.mediaRepository.save(media);
  }

  /**
   * Xóa media (soft delete)
   */
  async remove(id: string, userId: string): Promise<void> {
    const media = await this.findOne(id);

    // Kiểm tra quyền xóa (chỉ người upload hoặc admin)
    if (media.uploadedBy !== userId) {
      const user = await this.userService.findOne(userId);
      if (!user.roles || !user.roles.includes('admin')) {
        throw new ForbiddenException('Không có quyền xóa media này');
      }
    }

    media.isDeleted = true;
    media.deletedAt = new Date();
    media.deletedBy = userId;

    await this.mediaRepository.save(media);
  }

  /**
   * Upload file
   */
  async uploadFile(file: any, uploadDto: UploadMediaDto, userId: string): Promise<UploadResult> {
    try {
      // Kiểm tra kích thước file
      const maxSize = this.getMaxSizeForType(uploadDto.type);
      if (file.size > maxSize) {
        return {
          success: false,
          message: `File quá lớn. Kích thước tối đa cho ${uploadDto.type} là ${this.formatBytes(maxSize)}`,
          error: 'File too large',
        };
      }

      // Kiểm tra MIME type
      if (!this.isValidMimeType(file.mimetype, uploadDto.type)) {
        return {
          success: false,
          message: `Định dạng file không được hỗ trợ cho ${uploadDto.type}`,
          error: 'Invalid file type',
        };
      }

      // Tạo đường dẫn file
      const filePath = await this.generateFilePath(file, uploadDto.type, userId);
      
      // Lưu file
      const savedFilePath = await this.saveFile(file, filePath);
      
      // Tạo URL truy cập
      const url = this.generateUrl(savedFilePath);

      // Tạo media record
      const media = await this.create({
        name: uploadDto.name || file.originalname,
        type: uploadDto.type,
        size: file.size,
        mimeType: file.mimetype,
        filePath: savedFilePath,
        url,
        description: uploadDto.description,
        clubId: uploadDto.clubId,
        relatedObjectId: uploadDto.relatedObjectId,
        relatedObjectType: uploadDto.relatedObjectType,
        tags: uploadDto.tags,
        privacy: uploadDto.privacy,
        metadata: {
          originalName: file.originalname,
          encoding: file.encoding,
          fieldname: file.fieldname,
        },
      }, userId);

      // Xử lý file theo loại
      await this.processFile(media, file);

      return {
        success: true,
        mediaId: media.id,
        url: media.url,
        message: 'Upload file thành công',
      };
    } catch (error) {
      return {
        success: false,
        message: `Upload file thất bại: ${error.message}`,
        error: error.message,
      };
    }
  }

  /**
   * Lấy thống kê media
   */
  async getStats(): Promise<MediaStats> {
    const media = await this.mediaRepository.find({
      where: { isDeleted: false },
    });

    const stats: MediaStats = {
      totalMedia: media.length,
      totalSize: 0,
      typeBreakdown: {},
      statusBreakdown: {},
      mimeTypeBreakdown: {},
      sizeBreakdown: {},
      uploadsThisMonth: 0,
      sizeThisMonth: 0,
    };

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    media.forEach(item => {
      // Tính tổng kích thước
      stats.totalSize += item.fileSize;

      // Đếm theo loại
      const type = item.type;
      stats.typeBreakdown[type] = (stats.typeBreakdown[type] || 0) + 1;

      // Đếm theo trạng thái
      const status = item.status;
      stats.statusBreakdown[status] = (stats.statusBreakdown[status] || 0) + 1;

      // Đếm theo MIME type
      const mimeType = item.mimeType;
      stats.mimeTypeBreakdown[mimeType] = (stats.mimeTypeBreakdown[mimeType] || 0) + 1;

      // Đếm theo kích thước
      const sizeCategory = this.getSizeCategory(item.fileSize);
      stats.sizeBreakdown[sizeCategory] = (stats.sizeBreakdown[sizeCategory] || 0) + 1;

      // Thống kê tháng này
      if (item.createdAt >= startOfMonth) {
        stats.uploadsThisMonth++;
        stats.sizeThisMonth += item.fileSize;
      }
    });

    return stats;
  }

  /**
   * Lấy media theo loại
   */
  async findByType(type: MediaType): Promise<Media[]> {
    return await this.mediaRepository.find({
      where: { type, isDeleted: false },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Lấy media theo người upload
   */
  async findByUploader(uploadedBy: string): Promise<Media[]> {
    return await this.mediaRepository.find({
      where: { uploadedBy, isDeleted: false },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Lấy media theo CLB
   */
  async findByClub(clubId: string): Promise<Media[]> {
    return await this.mediaRepository.find({
      where: { clubId, isDeleted: false },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Lấy media theo đối tượng liên quan
   */
  async findByRelatedObject(relatedObjectId: string, relatedObjectType: string): Promise<Media[]> {
    return await this.mediaRepository.find({
      where: { relatedObjectId, relatedObjectType, isDeleted: false },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Tìm kiếm media
   */
  async search(query: string, limit: number = 10): Promise<Media[]> {
    return await this.mediaRepository
      .createQueryBuilder('media')
      .where('media.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere(
        '(media.name ILIKE :query OR media.description ILIKE :query OR media.tags @> :tags)',
        { query: `%${query}%`, tags: [query] }
      )
      .orderBy('media.createdAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  /**
   * Lấy media theo tags
   */
  async findByTags(tags: string[]): Promise<Media[]> {
    return await this.mediaRepository
      .createQueryBuilder('media')
      .where('media.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('media.tags && :tags', { tags })
      .orderBy('media.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Lấy media hết hạn
   */
  async getExpiredMedia(): Promise<Media[]> {
    return await this.mediaRepository.find({
      where: {
        isDeleted: false,
      },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Xóa media hết hạn
   */
  async deleteExpiredMedia(): Promise<{ count: number }> {
    const expiredMedia = await this.getExpiredMedia();

    for (const media of expiredMedia) {
      media.isDeleted = true;
      media.deletedAt = new Date();
      media.deletedBy = 'system';
      await this.mediaRepository.save(media);
    }

    return { count: expiredMedia.length };
  }

  // Helper methods
  private getMaxSizeForType(type: MediaType): number {
    switch (type) {
      case MediaType.IMAGE:
        return 10 * 1024 * 1024; // 10MB
      case MediaType.VIDEO:
        return 100 * 1024 * 1024; // 100MB
      case MediaType.DOCUMENT:
        return 50 * 1024 * 1024; // 50MB
      case MediaType.AUDIO:
        return 20 * 1024 * 1024; // 20MB
      default:
        return 5 * 1024 * 1024; // 5MB
    }
  }

  private isValidMimeType(mimeType: string, type: MediaType): boolean {
    const validMimeTypes = {
      [MediaType.IMAGE]: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      [MediaType.VIDEO]: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
      [MediaType.DOCUMENT]: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      [MediaType.AUDIO]: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    };

    return validMimeTypes[type]?.includes(mimeType) || false;
  }

  private async generateFilePath(file: any, type: MediaType, userId: string): Promise<string> {
    const timestamp = Date.now();
    const extension = file.originalname.split('.').pop();
    const filename = `${timestamp}_${userId}.${extension}`;
    
    return `uploads/${type}/${filename}`;
  }

  private async saveFile(file: any, filePath: string): Promise<string> {
    // TODO: Implement actual file saving logic
    // This would typically involve:
    // 1. Creating directory if it doesn't exist
    // 2. Writing file to disk
    // 3. Handling errors
    // 4. Returning the actual file path
    
    return filePath;
  }

  private generateUrl(filePath: string): string {
    // TODO: Implement URL generation logic
    // This would typically involve:
    // 1. Getting base URL from configuration
    // 2. Combining with file path
    // 3. Returning full URL
    
    return `https://example.com/${filePath}`;
  }

  private async processFile(media: Media, file: any): Promise<void> {
    // TODO: Implement file processing logic based on type
    switch (media.type) {
      case MediaType.IMAGE:
        await this.processImage(media, file);
        break;
      case MediaType.VIDEO:
        await this.processVideo(media, file);
        break;
      case MediaType.DOCUMENT:
        await this.processDocument(media, file);
        break;
      case MediaType.AUDIO:
        await this.processAudio(media, file);
        break;
    }
  }

  private async processImage(media: Media, file: any): Promise<void> {
    // TODO: Implement image processing
    // 1. Resize image
    // 2. Create thumbnails
    // 3. Optimize for web
    // 4. Add watermark if needed
  }

  private async processVideo(media: Media, file: any): Promise<void> {
    // TODO: Implement video processing
    // 1. Compress video
    // 2. Create preview thumbnails
    // 3. Extract metadata
    // 4. Generate multiple quality versions
  }

  private async processDocument(media: Media, file: any): Promise<void> {
    // TODO: Implement document processing
    // 1. Extract text content
    // 2. Create preview images
    // 3. Generate searchable content
    // 4. Validate document integrity
  }

  private async processAudio(media: Media, file: any): Promise<void> {
    // TODO: Implement audio processing
    // 1. Compress audio
    // 2. Extract metadata
    // 3. Generate waveform
    // 4. Create preview clips
  }

  private getSizeCategory(size: number): string {
    if (size < 1024 * 1024) return 'small'; // < 1MB
    if (size < 10 * 1024 * 1024) return 'medium'; // < 10MB
    if (size < 100 * 1024 * 1024) return 'large'; // < 100MB
    return 'xlarge'; // >= 100MB
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
