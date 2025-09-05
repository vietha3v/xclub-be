import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like, In } from 'typeorm';
import { Notification, NotificationType, NotificationStatus, NotificationPriority, NotificationChannel } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { UserService } from '../user/user.service';
import { ClubService } from '../club/club.service';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { createPaginatedResult, getPaginationParams } from '../common/utils/pagination.util';
import { generateCode } from '../common/utils/code-generator';

export interface NotificationStats {
  totalNotifications: number;
  sentNotifications: number;
  deliveredNotifications: number;
  readNotifications: number;
  failedNotifications: number;
  typeBreakdown: Record<string, number>;
  channelBreakdown: Record<string, number>;
  priorityBreakdown: Record<string, number>;
}

export interface SendResult {
  success: boolean;
  totalSent: number;
  totalFailed: number;
  details: any[];
  message: string;
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly userService: UserService,
    private readonly clubService: ClubService,
  ) {}

  /**
   * Tạo thông báo mới
   */
  async create(createNotificationDto: CreateNotificationDto, userId: string): Promise<Notification> {
    // Kiểm tra mã thông báo đã tồn tại chưa
    const existingNotification = await this.notificationRepository.findOne({
      where: { notificationCode: createNotificationDto.notificationCode, isDeleted: false }
    });

    if (existingNotification) {
      throw new BadRequestException('Mã thông báo đã tồn tại');
    }

    // Kiểm tra người nhận tồn tại
    await this.userService.findOne(createNotificationDto.recipientId);

    // Kiểm tra CLB tồn tại nếu có
    if (createNotificationDto.clubId) {
      await this.clubService.findOne(createNotificationDto.clubId);
    }

    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      senderId: createNotificationDto.senderId || userId,
      priority: createNotificationDto.priority || NotificationPriority.NORMAL,
      channel: createNotificationDto.channel || NotificationChannel.IN_APP,
      status: NotificationStatus.PENDING,
    });

    return await this.notificationRepository.save(notification);
  }

  /**
   * Lấy danh sách thông báo với phân trang và tìm kiếm
   */
  async findAll(queryDto: QueryNotificationDto): Promise<PaginatedResult<Notification>> {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      type, 
      status, 
      priority, 
      channel, 
      recipientId, 
      senderId, 
      clubId, 
      relatedObjectId, 
      relatedObjectType, 
      tags, 
      unreadOnly,
      sortBy, 
      sortOrder 
    } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.notificationRepository.createQueryBuilder('notification')
      .where('notification.isDeleted = :isDeleted', { isDeleted: false });

    // Tìm kiếm
    if (search) {
      queryBuilder.andWhere(
        '(notification.title ILIKE :search OR notification.content ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Lọc theo loại
    if (type) {
      queryBuilder.andWhere('notification.type = :type', { type });
    }

    // Lọc theo trạng thái
    if (status) {
      queryBuilder.andWhere('notification.status = :status', { status });
    }

    // Lọc theo mức độ ưu tiên
    if (priority) {
      queryBuilder.andWhere('notification.priority = :priority', { priority });
    }

    // Lọc theo kênh
    if (channel) {
      queryBuilder.andWhere('notification.channel = :channel', { channel });
    }

    // Lọc theo người nhận
    if (recipientId) {
      queryBuilder.andWhere('notification.recipientId = :recipientId', { recipientId });
    }

    // Lọc theo người gửi
    if (senderId) {
      queryBuilder.andWhere('notification.senderId = :senderId', { senderId });
    }

    // Lọc theo CLB
    if (clubId) {
      queryBuilder.andWhere('notification.clubId = :clubId', { clubId });
    }

    // Lọc theo đối tượng liên quan
    if (relatedObjectId) {
      queryBuilder.andWhere('notification.relatedObjectId = :relatedObjectId', { relatedObjectId });
    }

    if (relatedObjectType) {
      queryBuilder.andWhere('notification.relatedObjectType = :relatedObjectType', { relatedObjectType });
    }

    // Lọc theo tags
    if (tags) {
      queryBuilder.andWhere('notification.tags @> :tags', { tags: [tags] });
    }

    // Lọc thông báo chưa đọc
    if (unreadOnly) {
      queryBuilder.andWhere('notification.readAt IS NULL');
    }

    // Sắp xếp
    const orderBy = sortBy || 'createdAt';
    const order = sortOrder || 'DESC';
    queryBuilder.orderBy(`notification.${orderBy}`, order);

    // Phân trang
    queryBuilder.skip(skip).take(limit);

    const [notifications, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResult(notifications, total, page, limit);
  }

  /**
   * Lấy thông báo theo ID
   */
  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!notification) {
      throw new NotFoundException('Không tìm thấy thông báo');
    }

    return notification;
  }

  /**
   * Lấy thông báo theo mã
   */
  async findByCode(notificationCode: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { notificationCode, isDeleted: false },
    });

    if (!notification) {
      throw new NotFoundException('Không tìm thấy thông báo');
    }

    return notification;
  }

  /**
   * Cập nhật thông báo
   */
  async update(id: string, updateNotificationDto: UpdateNotificationDto, userId: string): Promise<Notification> {
    const notification = await this.findOne(id);

    // Kiểm tra quyền sửa (chỉ người gửi hoặc admin)
    if (notification.senderId !== userId) {
      const user = await this.userService.findOne(userId);
      if (!user.roles || !user.roles.includes('admin')) {
        throw new ForbiddenException('Không có quyền cập nhật thông báo này');
      }
    }

    // Kiểm tra mã thông báo trùng lặp nếu có thay đổi
    if (updateNotificationDto.notificationCode && updateNotificationDto.notificationCode !== notification.notificationCode) {
      const existingNotification = await this.notificationRepository.findOne({
        where: { notificationCode: updateNotificationDto.notificationCode, isDeleted: false }
      });

      if (existingNotification) {
        throw new BadRequestException('Mã thông báo đã tồn tại');
      }
    }

    Object.assign(notification, updateNotificationDto);
    return await this.notificationRepository.save(notification);
  }

  /**
   * Xóa thông báo (soft delete)
   */
  async remove(id: string, userId: string): Promise<void> {
    const notification = await this.findOne(id);

    // Kiểm tra quyền xóa (chỉ người nhận, người gửi hoặc admin)
    if (notification.recipientId !== userId && notification.senderId !== userId) {
      const user = await this.userService.findOne(userId);
      if (!user.roles || !user.roles.includes('admin')) {
        throw new ForbiddenException('Không có quyền xóa thông báo này');
      }
    }

    notification.isDeleted = true;
    notification.deletedAt = new Date();
    notification.deletedBy = userId;

    await this.notificationRepository.save(notification);
  }

  /**
   * Gửi thông báo
   */
  async sendNotification(sendDto: SendNotificationDto, senderId: string): Promise<SendResult> {
    const notifications: Notification[] = [];
    const results: any[] = [];

    // Tạo thông báo cho từng người nhận
    for (const recipientId of sendDto.recipientIds) {
      try {
        // Kiểm tra người nhận tồn tại
        await this.userService.findOne(recipientId);

        const notification = this.notificationRepository.create({
          notificationCode: await this.generateNotificationCode(),
          title: sendDto.title,
          content: sendDto.content,
          type: sendDto.type,
          priority: sendDto.priority || NotificationPriority.NORMAL,
          channel: sendDto.channel || NotificationChannel.IN_APP,
          recipientId,
          senderId,
          clubId: sendDto.clubId,
          relatedObjectId: sendDto.relatedObjectId,
          relatedObjectType: sendDto.relatedObjectType,
          data: sendDto.data,
          sentAt: sendDto.sendAt || new Date(),
          expiresAt: sendDto.expiresAt,
          settings: sendDto.settings,
          tags: sendDto.tags,
          status: NotificationStatus.PENDING,
        });

        const savedNotification = await this.notificationRepository.save(notification);
        notifications.push(savedNotification);

        // Gửi thông báo thực tế
        const sendResult = await this.deliverNotification(savedNotification);
        results.push({
          recipientId,
          notificationId: savedNotification.id,
          success: sendResult.success,
          error: sendResult.error,
        });

        // Cập nhật trạng thái
        if (sendResult.success) {
          savedNotification.status = NotificationStatus.SENT;
          savedNotification.sentAt = new Date();
        } else {
          savedNotification.status = NotificationStatus.FAILED;
          savedNotification.error = sendResult.error;
        }

        await this.notificationRepository.save(savedNotification);

      } catch (error) {
        results.push({
          recipientId,
          success: false,
          error: error.message,
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return {
      success: failCount === 0,
      totalSent: successCount,
      totalFailed: failCount,
      details: results,
      message: `Gửi thành công ${successCount}/${sendDto.recipientIds.length} thông báo`,
    };
  }

  /**
   * Đánh dấu thông báo đã đọc
   */
  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.findOne(id);

    // Kiểm tra quyền đọc (chỉ người nhận)
    if (notification.recipientId !== userId) {
      throw new ForbiddenException('Không có quyền đọc thông báo này');
    }

    if (notification.status === NotificationStatus.READ) {
      return notification;
    }

    notification.status = NotificationStatus.READ;
    notification.readAt = new Date();

    return await this.notificationRepository.save(notification);
  }

  /**
   * Đánh dấu tất cả thông báo đã đọc
   */
  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.notificationRepository.update(
      {
        recipientId: userId,
        status: NotificationStatus.SENT,
        isDeleted: false,
      },
      {
        status: NotificationStatus.READ,
        readAt: new Date(),
      }
    );

    return { count: result.affected || 0 };
  }

  /**
   * Lấy thông báo chưa đọc của người dùng
   */
  async getUnreadNotifications(userId: string, limit: number = 20): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: {
        recipientId: userId,
        status: NotificationStatus.SENT,
        isDeleted: false,
      },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Lấy thông báo theo loại
   */
  async findByType(type: NotificationType): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { type, isDeleted: false },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Lấy thông báo theo người nhận
   */
  async findByRecipient(recipientId: string): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { recipientId, isDeleted: false },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Lấy thông báo theo người gửi
   */
  async findBySender(senderId: string): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { senderId, isDeleted: false },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Lấy thông báo theo CLB
   */
  async findByClub(clubId: string): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { clubId, isDeleted: false },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Lấy thống kê thông báo
   */
  async getStats(): Promise<NotificationStats> {
    const notifications = await this.notificationRepository.find({
      where: { isDeleted: false },
    });

    const stats: NotificationStats = {
      totalNotifications: notifications.length,
      sentNotifications: 0,
      deliveredNotifications: 0,
      readNotifications: 0,
      failedNotifications: 0,
      typeBreakdown: {},
      channelBreakdown: {},
      priorityBreakdown: {},
    };

    notifications.forEach(notification => {
      // Đếm theo trạng thái
      switch (notification.status) {
        case NotificationStatus.SENT:
          stats.sentNotifications++;
          break;
        case NotificationStatus.DELIVERED:
          stats.deliveredNotifications++;
          break;
        case NotificationStatus.READ:
          stats.readNotifications++;
          break;
        case NotificationStatus.FAILED:
          stats.failedNotifications++;
          break;
      }

      // Đếm theo loại
      const type = notification.type;
      stats.typeBreakdown[type] = (stats.typeBreakdown[type] || 0) + 1;

      // Đếm theo kênh
      const channel = notification.channel;
      stats.channelBreakdown[channel] = (stats.channelBreakdown[channel] || 0) + 1;

      // Đếm theo mức độ ưu tiên
      const priority = notification.priority;
      stats.priorityBreakdown[priority] = (stats.priorityBreakdown[priority] || 0) + 1;
    });

    return stats;
  }

  /**
   * Gửi thông báo thực tế
   */
  private async deliverNotification(notification: Notification): Promise<{ success: boolean; error?: any }> {
    try {
      switch (notification.channel) {
        case NotificationChannel.IN_APP:
          return await this.sendInAppNotification(notification);
        case NotificationChannel.EMAIL:
          return await this.sendEmailNotification(notification);
        case NotificationChannel.SMS:
          return await this.sendSmsNotification(notification);
        case NotificationChannel.PUSH:
          return await this.sendPushNotification(notification);
        case NotificationChannel.WEBHOOK:
          return await this.sendWebhookNotification(notification);
        default:
          return { success: false, error: 'Kênh thông báo không được hỗ trợ' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Gửi thông báo trong ứng dụng
   */
  private async sendInAppNotification(notification: Notification): Promise<{ success: boolean; error?: any }> {
    // TODO: Implement in-app notification delivery
    // Có thể sử dụng WebSocket hoặc Server-Sent Events
    return { success: true };
  }

  /**
   * Gửi thông báo email
   */
  private async sendEmailNotification(notification: Notification): Promise<{ success: boolean; error?: any }> {
    // TODO: Implement email notification delivery
    // Sử dụng SendGrid, Nodemailer, hoặc dịch vụ email khác
    return { success: true };
  }

  /**
   * Gửi thông báo SMS
   */
  private async sendSmsNotification(notification: Notification): Promise<{ success: boolean; error?: any }> {
    // TODO: Implement SMS notification delivery
    // Sử dụng Twilio, AWS SNS, hoặc dịch vụ SMS khác
    return { success: true };
  }

  /**
   * Gửi push notification
   */
  private async sendPushNotification(notification: Notification): Promise<{ success: boolean; error?: any }> {
    // TODO: Implement push notification delivery
    // Sử dụng Firebase Cloud Messaging, OneSignal, hoặc dịch vụ push khác
    return { success: true };
  }

  /**
   * Gửi webhook notification
   */
  private async sendWebhookNotification(notification: Notification): Promise<{ success: boolean; error?: any }> {
    // TODO: Implement webhook notification delivery
    // Gửi HTTP POST request đến webhook URL
    return { success: true };
  }

  /**
   * Tạo mã thông báo duy nhất
   */
  private async generateNotificationCode(): Promise<string> {
    let code: string = '';
    let exists = true;

    while (exists) {
      code = generateCode('NOTIF', 8);
      const existing = await this.notificationRepository.findOne({
        where: { notificationCode: code, isDeleted: false }
      });
      exists = !!existing;
    }

    return code;
  }

  /**
   * Tìm kiếm thông báo
   */
  async search(query: string, limit: number = 10): Promise<Notification[]> {
    return await this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere(
        '(notification.title ILIKE :query OR notification.content ILIKE :query OR notification.tags @> :tags)',
        { query: `%${query}%`, tags: [query] }
      )
      .orderBy('notification.createdAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  /**
   * Lấy thông báo theo tags
   */
  async findByTags(tags: string[]): Promise<Notification[]> {
    return await this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('notification.tags && :tags', { tags })
      .orderBy('notification.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Lấy thông báo thất bại
   */
  async getFailedNotifications(): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { status: NotificationStatus.FAILED, isDeleted: false },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Thử gửi lại thông báo thất bại
   */
  async retryFailedNotification(id: string): Promise<Notification> {
    const notification = await this.findOne(id);

    if (notification.status !== NotificationStatus.FAILED) {
      throw new BadRequestException('Chỉ có thể thử lại thông báo thất bại');
    }

    notification.retryCount += 1;
    notification.nextRetryAt = new Date(Date.now() + Math.pow(2, notification.retryCount) * 60000); // Exponential backoff

    const sendResult = await this.deliverNotification(notification);

    if (sendResult.success) {
      notification.status = NotificationStatus.SENT;
      notification.sentAt = new Date();
      notification.error = null;
    } else {
      notification.error = sendResult.error;
    }

    return await this.notificationRepository.save(notification);
  }
}
