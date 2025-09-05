import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { QueryMediaDto } from './dto/query-media.dto';
import { UploadMediaDto } from './dto/upload-media.dto';
import { Media, MediaType, MediaStatus } from './entities/media.entity';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@ApiTags('📁 Quản lý media')
@Controller('media')
@ApiBearerAuth('JWT-auth')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * Tạo media mới
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Tạo media mới',
    description: 'Tạo media mới trong hệ thống (chỉ admin/moderator)'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Tạo media thành công',
    type: Media
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền tạo media' })
  async create(@Body() createMediaDto: CreateMediaDto, @Req() req: any) {
    return this.mediaService.create(createMediaDto, req.user.userId);
  }

  /**
   * Lấy danh sách media
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy danh sách media',
    description: 'Lấy danh sách media với phân trang và tìm kiếm'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách media',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Media' }
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
        hasNextPage: { type: 'boolean' },
        hasPreviousPage: { type: 'boolean' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async findAll(@Query() queryDto: QueryMediaDto, @Req() req: any) {
    // Nếu không phải admin, chỉ lấy media của user hiện tại hoặc public
    if (!req.user.roles || !req.user.roles.includes('admin')) {
      queryDto.uploadedBy = req.user.userId;
    }
    return this.mediaService.findAll(queryDto);
  }

  /**
   * Lấy media theo ID
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy media theo ID',
    description: 'Lấy thông tin chi tiết của một media'
  })
  @ApiParam({ name: 'id', description: 'ID của media' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thông tin media',
    type: Media
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy media' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const media = await this.mediaService.findOne(id);
    
    // Kiểm tra quyền xem (chỉ xem media của mình, public, hoặc admin)
    if (media.uploadedBy !== req.user.userId && media.visibility !== 'public' && !req.user.roles || !req.user.roles.includes('admin')) {
      throw new ForbiddenException('Không có quyền xem media này');
    }
    
    return media;
  }

  /**
   * Lấy media theo URL
   */
  @Get('url/:url')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy media theo URL',
    description: 'Lấy thông tin media theo URL'
  })
  @ApiParam({ name: 'url', description: 'URL của media' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thông tin media',
    type: Media
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy media' })
  async findByUrl(@Param('url') url: string, @Req() req: any) {
    const media = await this.mediaService.findByUrl(url);
    
    // Kiểm tra quyền xem (chỉ xem media của mình, public, hoặc admin)
    if (media.uploadedBy !== req.user.userId && media.visibility !== 'public' && !req.user.roles || !req.user.roles.includes('admin')) {
      throw new ForbiddenException('Không có quyền xem media này');
    }
    
    return media;
  }

  /**
   * Cập nhật media
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Cập nhật media',
    description: 'Cập nhật thông tin media (chỉ người upload hoặc admin)'
  })
  @ApiParam({ name: 'id', description: 'ID của media' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cập nhật thành công',
    type: Media
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy media' })
  async update(
    @Param('id') id: string, 
    @Body() updateMediaDto: UpdateMediaDto,
    @Req() req: any
  ) {
    return this.mediaService.update(id, updateMediaDto, req.user.userId);
  }

  /**
   * Xóa media
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Xóa media',
    description: 'Xóa media (chỉ người upload hoặc admin)'
  })
  @ApiParam({ name: 'id', description: 'ID của media' })
  @ApiResponse({ 
    status: 200, 
    description: 'Xóa thành công',
    schema: { type: 'object', properties: { message: { type: 'string' } } }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy media' })
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.mediaService.remove(id, req.user.userId);
    return { message: 'Xóa media thành công' };
  }

  /**
   * Upload file
   */
  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Upload file',
    description: 'Upload file lên hệ thống'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Upload file thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        mediaId: { type: 'string' },
        url: { type: 'string' },
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'File không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async uploadFile(
    @UploadedFile() file: any,
    @Body() uploadDto: UploadMediaDto,
    @Req() req: any
  ) {
    return this.mediaService.uploadFile(file, uploadDto, req.user.userId);
  }

  /**
   * Lấy thống kê media
   */
  @Get('stats/overview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  @ApiOperation({ 
    summary: 'Lấy thống kê tổng quan',
    description: 'Lấy thống kê tổng quan về media (chỉ admin/moderator)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Thống kê tổng quan',
    schema: {
      type: 'object',
      properties: {
        totalMedia: { type: 'number' },
        totalSize: { type: 'number' },
        typeBreakdown: { type: 'object' },
        statusBreakdown: { type: 'object' },
        mimeTypeBreakdown: { type: 'object' },
        sizeBreakdown: { type: 'object' },
        uploadsThisMonth: { type: 'number' },
        sizeThisMonth: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem thống kê' })
  async getStats() {
    return this.mediaService.getStats();
  }

  /**
   * Lấy media theo loại
   */
  @Get('type/:type')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy media theo loại',
    description: 'Lấy danh sách media theo loại cụ thể'
  })
  @ApiParam({ name: 'type', description: 'Loại media', enum: MediaType })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách media theo loại',
    type: [Media]
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async findByType(@Param('type') type: MediaType, @Req() req: any) {
    const media = await this.mediaService.findByType(type);
    
    // Nếu không phải admin, chỉ lấy media của user hiện tại hoặc public
    if (!req.user.roles || !req.user.roles.includes('admin')) {
      return media.filter(m => m.uploadedBy === req.user.userId || m.visibility === 'public');
    }
    
    return media;
  }

  /**
   * Lấy media theo người upload
   */
  @Get('uploader/:uploadedBy')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy media theo người upload',
    description: 'Lấy danh sách media của một người upload'
  })
  @ApiParam({ name: 'uploadedBy', description: 'ID của người upload' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách media theo người upload',
    type: [Media]
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem media của người khác' })
  async findByUploader(@Param('uploadedBy') uploadedBy: string, @Req() req: any) {
    // Kiểm tra quyền xem (chỉ xem media của mình hoặc admin)
    if (uploadedBy !== req.user.userId && !req.user.roles || !req.user.roles.includes('admin')) {
      throw new ForbiddenException('Không có quyền xem media của người khác');
    }
    
    return this.mediaService.findByUploader(uploadedBy);
  }

  /**
   * Lấy media theo CLB
   */
  @Get('club/:clubId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy media theo CLB',
    description: 'Lấy danh sách media của một CLB'
  })
  @ApiParam({ name: 'clubId', description: 'ID của CLB' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách media theo CLB',
    type: [Media]
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async findByClub(@Param('clubId') clubId: string) {
    return this.mediaService.findByClub(clubId);
  }

  /**
   * Lấy media theo đối tượng liên quan
   */
  @Get('related/:relatedObjectType/:relatedObjectId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy media theo đối tượng liên quan',
    description: 'Lấy danh sách media của một đối tượng liên quan'
  })
  @ApiParam({ name: 'relatedObjectType', description: 'Loại đối tượng liên quan' })
  @ApiParam({ name: 'relatedObjectId', description: 'ID của đối tượng liên quan' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách media theo đối tượng liên quan',
    type: [Media]
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async findByRelatedObject(
    @Param('relatedObjectType') relatedObjectType: string,
    @Param('relatedObjectId') relatedObjectId: string
  ) {
    return this.mediaService.findByRelatedObject(relatedObjectId, relatedObjectType);
  }

  /**
   * Tìm kiếm media
   */
  @Get('search')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Tìm kiếm media',
    description: 'Tìm kiếm media theo từ khóa'
  })
  @ApiQuery({ name: 'q', description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng kết quả (mặc định 10)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Kết quả tìm kiếm',
    type: [Media]
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async search(
    @Query('q') query: string,
    @Req() req: any,
    @Query('limit') limit?: number
  ) {
    const media = await this.mediaService.search(query, limit);
    
    // Nếu không phải admin, chỉ lấy media của user hiện tại hoặc public
    if (!req.user.roles || !req.user.roles.includes('admin')) {
      return media.filter(m => m.uploadedBy === req.user.userId || m.visibility === 'public');
    }
    
    return media;
  }

  /**
   * Lấy media theo tags
   */
  @Get('tags')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy media theo tags',
    description: 'Lấy danh sách media theo tags'
  })
  @ApiQuery({ name: 'tags', description: 'Danh sách tags (phân cách bằng dấu phẩy)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách media theo tags',
    type: [Media]
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async findByTags(@Query('tags') tags: string, @Req() req: any) {
    const tagArray = tags.split(',').map(tag => tag.trim());
    const media = await this.mediaService.findByTags(tagArray);
    
    // Nếu không phải admin, chỉ lấy media của user hiện tại hoặc public
    if (!req.user.roles || !req.user.roles.includes('admin')) {
      return media.filter(m => m.uploadedBy === req.user.userId || m.visibility === 'public');
    }
    
    return media;
  }

  /**
   * Lấy media hết hạn
   */
  @Get('expired')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  @ApiOperation({ 
    summary: 'Lấy media hết hạn',
    description: 'Lấy danh sách media đã hết hạn (chỉ admin/moderator)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách media hết hạn',
    type: [Media]
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem media hết hạn' })
  async getExpiredMedia() {
    return this.mediaService.getExpiredMedia();
  }

  /**
   * Xóa media hết hạn
   */
  @Post('delete-expired')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Xóa media hết hạn',
    description: 'Xóa tất cả media đã hết hạn (chỉ admin/moderator)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Xóa media hết hạn thành công',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa media hết hạn' })
  async deleteExpiredMedia() {
    return this.mediaService.deleteExpiredMedia();
  }
}
