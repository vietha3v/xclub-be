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
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { Notification, NotificationType, NotificationPriority, NotificationChannel } from './entities/notification.entity';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@ApiTags('🔔 Quản lý thông báo')
@Controller('notifications')
@ApiBearerAuth('JWT-auth')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Tạo thông báo mới
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Tạo thông báo mới',
    description: 'Tạo thông báo mới trong hệ thống (chỉ admin/moderator)'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Tạo thông báo thành công',
    type: Notification
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền tạo thông báo' })
  async create(@Body() createNotificationDto: CreateNotificationDto, @Req() req: any) {
    return this.notificationService.create(createNotificationDto, req.user.userId);
  }

  /**
   * Lấy danh sách thông báo
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy danh sách thông báo',
    description: 'Lấy danh sách thông báo với phân trang và tìm kiếm'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách thông báo',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Notification' }
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
  async findAll(@Query() queryDto: QueryNotificationDto, @Req() req: any) {
    // Nếu không phải admin, chỉ lấy thông báo của user hiện tại
    if (!req.user.roles || !req.user.roles.includes('admin')) {
      queryDto.recipientId = req.user.userId;
    }
    return this.notificationService.findAll(queryDto);
  }

  /**
   * Lấy thông báo theo ID
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy thông báo theo ID',
    description: 'Lấy thông tin chi tiết của một thông báo'
  })
  @ApiParam({ name: 'id', description: 'ID của thông báo' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thông tin thông báo',
    type: Notification
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thông báo' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const notification = await this.notificationService.findOne(id);
    
    // Kiểm tra quyền xem (chỉ người nhận hoặc admin)
    if (notification.recipientId !== req.user.userId && !req.user.roles || !req.user.roles.includes('admin')) {
      throw new ForbiddenException('Không có quyền xem thông báo này');
    }
    
    return notification;
  }

  /**
   * Lấy thông báo theo mã
   */
  @Get('code/:notificationCode')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy thông báo theo mã',
    description: 'Lấy thông tin thông báo theo mã thông báo'
  })
  @ApiParam({ name: 'notificationCode', description: 'Mã thông báo' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thông tin thông báo',
    type: Notification
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thông báo' })
  async findByCode(@Param('notificationCode') notificationCode: string, @Req() req: any) {
    const notification = await this.notificationService.findByCode(notificationCode);
    
    // Kiểm tra quyền xem (chỉ người nhận hoặc admin)
    if (notification.recipientId !== req.user.userId && !req.user.roles || !req.user.roles.includes('admin')) {
      throw new ForbiddenException('Không có quyền xem thông báo này');
    }
    
    return notification;
  }

  /**
   * Cập nhật thông báo
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Cập nhật thông báo',
    description: 'Cập nhật thông tin thông báo (chỉ người gửi hoặc admin)'
  })
  @ApiParam({ name: 'id', description: 'ID của thông báo' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cập nhật thành công',
    type: Notification
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thông báo' })
  async update(
    @Param('id') id: string, 
    @Body() updateNotificationDto: UpdateNotificationDto,
    @Req() req: any
  ) {
    return this.notificationService.update(id, updateNotificationDto, req.user.userId);
  }

  /**
   * Xóa thông báo
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Xóa thông báo',
    description: 'Xóa thông báo (chỉ người nhận, người gửi hoặc admin)'
  })
  @ApiParam({ name: 'id', description: 'ID của thông báo' })
  @ApiResponse({ 
    status: 200, 
    description: 'Xóa thành công',
    schema: { type: 'object', properties: { message: { type: 'string' } } }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thông báo' })
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.notificationService.remove(id, req.user.userId);
    return { message: 'Xóa thông báo thành công' };
  }

  /**
   * Gửi thông báo
   */
  @Post('send')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Gửi thông báo',
    description: 'Gửi thông báo đến nhiều người dùng (chỉ admin/moderator)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Gửi thông báo thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        totalSent: { type: 'number' },
        totalFailed: { type: 'number' },
        details: { type: 'array' },
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền gửi thông báo' })
  async sendNotification(@Body() sendDto: SendNotificationDto, @Req() req: any) {
    return this.notificationService.sendNotification(sendDto, req.user.userId);
  }

  /**
   * Đánh dấu thông báo đã đọc
   */
  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Đánh dấu thông báo đã đọc',
    description: 'Đánh dấu thông báo đã được đọc'
  })
  @ApiParam({ name: 'id', description: 'ID của thông báo' })
  @ApiResponse({ 
    status: 200, 
    description: 'Đánh dấu đã đọc thành công',
    type: Notification
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền đọc thông báo này' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thông báo' })
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    return this.notificationService.markAsRead(id, req.user.userId);
  }

  /**
   * Đánh dấu tất cả thông báo đã đọc
   */
  @Patch('mark-all-read')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Đánh dấu tất cả thông báo đã đọc',
    description: 'Đánh dấu tất cả thông báo của người dùng đã được đọc'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Đánh dấu tất cả đã đọc thành công',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async markAllAsRead(@Req() req: any) {
    return this.notificationService.markAllAsRead(req.user.userId);
  }

  /**
   * Lấy thông báo chưa đọc
   */
  @Get('unread')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy thông báo chưa đọc',
    description: 'Lấy danh sách thông báo chưa đọc của người dùng'
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng thông báo (mặc định 20)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách thông báo chưa đọc',
    type: [Notification]
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async getUnreadNotifications(@Req() req: any, @Query('limit') limit?: number) {
    return this.notificationService.getUnreadNotifications(req.user.userId, limit);
  }

  /**
   * Lấy thông báo theo loại
   */
  @Get('type/:type')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy thông báo theo loại',
    description: 'Lấy danh sách thông báo theo loại cụ thể'
  })
  @ApiParam({ name: 'type', description: 'Loại thông báo', enum: NotificationType })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách thông báo theo loại',
    type: [Notification]
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async findByType(@Param('type') type: NotificationType, @Req() req: any) {
    const notifications = await this.notificationService.findByType(type);
    
    // Nếu không phải admin, chỉ lấy thông báo của user hiện tại
    if (!req.user.roles || !req.user.roles.includes('admin')) {
      return notifications.filter(n => n.recipientId === req.user.userId);
    }
    
    return notifications;
  }

  /**
   * Lấy thông báo theo người nhận
   */
  @Get('recipient/:recipientId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy thông báo theo người nhận',
    description: 'Lấy danh sách thông báo của một người nhận'
  })
  @ApiParam({ name: 'recipientId', description: 'ID của người nhận' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách thông báo theo người nhận',
    type: [Notification]
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem thông báo của người khác' })
  async findByRecipient(@Param('recipientId') recipientId: string, @Req() req: any) {
    // Kiểm tra quyền xem (chỉ xem thông báo của mình hoặc admin)
    if (recipientId !== req.user.userId && !req.user.roles || !req.user.roles.includes('admin')) {
      throw new ForbiddenException('Không có quyền xem thông báo của người khác');
    }
    
    return this.notificationService.findByRecipient(recipientId);
  }

  /**
   * Lấy thông báo theo người gửi
   */
  @Get('sender/:senderId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy thông báo theo người gửi',
    description: 'Lấy danh sách thông báo do một người gửi'
  })
  @ApiParam({ name: 'senderId', description: 'ID của người gửi' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách thông báo theo người gửi',
    type: [Notification]
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem thông báo của người khác' })
  async findBySender(@Param('senderId') senderId: string, @Req() req: any) {
    // Kiểm tra quyền xem (chỉ xem thông báo của mình hoặc admin)
    if (senderId !== req.user.userId && !req.user.roles || !req.user.roles.includes('admin')) {
      throw new ForbiddenException('Không có quyền xem thông báo của người khác');
    }
    
    return this.notificationService.findBySender(senderId);
  }

  /**
   * Lấy thông báo theo CLB
   */
  @Get('club/:clubId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy thông báo theo CLB',
    description: 'Lấy danh sách thông báo của một CLB'
  })
  @ApiParam({ name: 'clubId', description: 'ID của CLB' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách thông báo theo CLB',
    type: [Notification]
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async findByClub(@Param('clubId') clubId: string) {
    return this.notificationService.findByClub(clubId);
  }

  /**
   * Lấy thống kê thông báo
   */
  @Get('stats/overview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  @ApiOperation({ 
    summary: 'Lấy thống kê tổng quan',
    description: 'Lấy thống kê tổng quan về thông báo (chỉ admin/moderator)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Thống kê tổng quan',
    schema: {
      type: 'object',
      properties: {
        totalNotifications: { type: 'number' },
        sentNotifications: { type: 'number' },
        deliveredNotifications: { type: 'number' },
        readNotifications: { type: 'number' },
        failedNotifications: { type: 'number' },
        typeBreakdown: { type: 'object' },
        channelBreakdown: { type: 'object' },
        priorityBreakdown: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem thống kê' })
  async getStats() {
    return this.notificationService.getStats();
  }

  /**
   * Tìm kiếm thông báo
   */
  @Get('search')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Tìm kiếm thông báo',
    description: 'Tìm kiếm thông báo theo từ khóa'
  })
  @ApiQuery({ name: 'q', description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng kết quả (mặc định 10)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Kết quả tìm kiếm',
    type: [Notification]
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async search(
    @Query('q') query: string,
    @Req() req: any,
    @Query('limit') limit?: number
  ) {
    const notifications = await this.notificationService.search(query, limit);
    
    // Nếu không phải admin, chỉ lấy thông báo của user hiện tại
    if (!req.user.roles || !req.user.roles.includes('admin')) {
      return notifications.filter(n => n.recipientId === req.user.userId);
    }
    
    return notifications;
  }

  /**
   * Lấy thông báo theo tags
   */
  @Get('tags')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy thông báo theo tags',
    description: 'Lấy danh sách thông báo theo tags'
  })
  @ApiQuery({ name: 'tags', description: 'Danh sách tags (phân cách bằng dấu phẩy)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách thông báo theo tags',
    type: [Notification]
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async findByTags(@Query('tags') tags: string, @Req() req: any) {
    const tagArray = tags.split(',').map(tag => tag.trim());
    const notifications = await this.notificationService.findByTags(tagArray);
    
    // Nếu không phải admin, chỉ lấy thông báo của user hiện tại
    if (!req.user.roles || !req.user.roles.includes('admin')) {
      return notifications.filter(n => n.recipientId === req.user.userId);
    }
    
    return notifications;
  }

  /**
   * Lấy thông báo thất bại
   */
  @Get('failed')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  @ApiOperation({ 
    summary: 'Lấy thông báo thất bại',
    description: 'Lấy danh sách thông báo gửi thất bại (chỉ admin/moderator)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách thông báo thất bại',
    type: [Notification]
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem thông báo thất bại' })
  async getFailedNotifications() {
    return this.notificationService.getFailedNotifications();
  }

  /**
   * Thử gửi lại thông báo thất bại
   */
  @Patch(':id/retry')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  @ApiOperation({ 
    summary: 'Thử gửi lại thông báo thất bại',
    description: 'Thử gửi lại thông báo đã gửi thất bại (chỉ admin/moderator)'
  })
  @ApiParam({ name: 'id', description: 'ID của thông báo' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thử gửi lại thành công',
    type: Notification
  })
  @ApiResponse({ status: 400, description: 'Thông báo không ở trạng thái thất bại' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền thử gửi lại' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thông báo' })
  async retryFailedNotification(@Param('id') id: string) {
    return this.notificationService.retryFailedNotification(id);
  }
}
