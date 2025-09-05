import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Activity, ActivityType, ActivityStatus, ActivityVisibility } from './entities/activity.entity';
import { QueryActivityDto } from './dto/query-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { createPaginatedResult, getPaginationParams } from '../common/utils/pagination.util';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
  ) {}

  /**
   * Kiểm tra quyền admin
   */
  private async checkAdminPermission(userId: string): Promise<boolean> {
    // TODO: Implement admin check logic
    // Có thể kiểm tra từ User entity hoặc Role entity
    // Tạm thời return false để đảm bảo an toàn
    return false;
  }


  /**
   * Tạo hoạt động từ dữ liệu integration (Strava, Garmin, etc.)
   * Đây là method chính để tạo activity
   */
  async createFromIntegration(activityData: Partial<Activity>): Promise<Activity> {
    // Kiểm tra xem activity đã tồn tại chưa (dựa trên sourceActivityId)
    if (activityData.sourceActivityId) {
      const existingActivity = await this.activityRepository.findOne({
        where: {
          sourceActivityId: activityData.sourceActivityId,
          source: activityData.source,
        },
      });

      if (existingActivity) {
        // Cập nhật activity hiện có
        Object.assign(existingActivity, activityData);
        existingActivity.lastSyncedAt = new Date();
        return await this.activityRepository.save(existingActivity);
      }
    }

    // Tạo activity mới
    const activity = this.activityRepository.create({
      ...activityData,
      lastSyncedAt: new Date(),
    });

    return await this.activityRepository.save(activity);
  }



  /**
   * Lấy danh sách hoạt động với phân trang và filter
   */
  async findAll(userId: string, queryDto: QueryActivityDto): Promise<PaginatedResult<Activity>> {
    const queryBuilder = this.buildQueryBuilder(userId, queryDto);
    const { page, limit, skip } = getPaginationParams(queryDto.page, queryDto.limit);
    
    const [activities, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return createPaginatedResult(activities, total, page, limit);
  }

  /**
   * Lấy hoạt động theo ID
   */
  async findOne(userId: string, id: string): Promise<Activity> {
    const activity = await this.activityRepository.findOne({
      where: { id, isDeleted: false }
    });

    if (!activity) {
      throw new NotFoundException('Hoạt động không tồn tại');
    }

    // Kiểm tra quyền truy cập
    if (activity.userId !== userId && !activity.isPublic) {
      throw new ForbiddenException('Không có quyền truy cập hoạt động này');
    }

    return activity;
  }

  /**
   * Cập nhật hoạt động (chỉ admin)
   */
  async update(userId: string, id: string, updateActivityDto: UpdateActivityDto): Promise<Activity> {
    // Kiểm tra quyền admin
    const isAdmin = await this.checkAdminPermission(userId);
    if (!isAdmin) {
      throw new ForbiddenException('Chỉ admin mới được cập nhật hoạt động');
    }

    const activity = await this.findOne(userId, id);

    // Cập nhật thông tin
    Object.assign(activity, updateActivityDto);

    // Tính toán lại các chỉ số nếu có thay đổi
    if (updateActivityDto.endTime || updateActivityDto.startTime) {
      const startTime = updateActivityDto.startTime ? new Date(updateActivityDto.startTime) : activity.startTime;
      const endTime = updateActivityDto.endTime ? new Date(updateActivityDto.endTime) : activity.endTime;
      
      if (endTime && startTime) {
        activity.duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
      }
    }

    // Tính toán lại tốc độ
    if (activity.distance && activity.duration) {
      activity.averageSpeed = (activity.distance / 1000) / (activity.duration / 3600);
      activity.averagePace = activity.duration / (activity.distance / 1000);
    }

    return await this.activityRepository.save(activity);
  }

  /**
   * Xóa mềm hoạt động (chỉ admin)
   */
  async remove(userId: string, id: string): Promise<void> {
    // Kiểm tra quyền admin
    const isAdmin = await this.checkAdminPermission(userId);
    if (!isAdmin) {
      throw new ForbiddenException('Chỉ admin mới được xóa hoạt động');
    }

    const activity = await this.findOne(userId, id);
    
    activity.isDeleted = true;
    activity.deletedAt = new Date();
    activity.deletedBy = userId;
    
    await this.activityRepository.save(activity);
  }

  /**
   * Lấy thống kê hoạt động của user
   */
  async getUserStats(userId: string): Promise<any> {
    const stats = await this.activityRepository
      .createQueryBuilder('activity')
      .select([
        'COUNT(*) as totalActivities',
        'SUM(activity.distance) as totalDistance',
        'SUM(activity.duration) as totalDuration',
        'SUM(activity.calories) as totalCalories',
        'AVG(activity.averageSpeed) as avgSpeed',
        'AVG(activity.averagePace) as avgPace'
      ])
      .where('activity.userId = :userId', { userId })
      .andWhere('activity.isDeleted = false')
      .andWhere('activity.status = :status', { status: ActivityStatus.SYNCED })
      .getRawOne();

    return {
      totalActivities: parseInt(stats.totalActivities) || 0,
      totalDistance: parseFloat(stats.totalDistance) || 0,
      totalDuration: parseInt(stats.totalDuration) || 0,
      totalCalories: parseInt(stats.totalCalories) || 0,
      averageSpeed: parseFloat(stats.avgSpeed) || 0,
      averagePace: parseFloat(stats.avgPace) || 0,
    };
  }

  /**
   * Lấy hoạt động gần đây của user
   */
  async getRecentActivities(userId: string, limit: number = 5): Promise<Activity[]> {
    return await this.activityRepository.find({
      where: { userId, isDeleted: false },
      order: { startTime: 'DESC' },
      take: limit,
    });
  }

  /**
   * Lấy hoạt động theo loại
   */
  async getActivitiesByType(userId: string, type: ActivityType, limit: number = 10): Promise<Activity[]> {
    return await this.activityRepository.find({
      where: { userId, type, isDeleted: false },
      order: { startTime: 'DESC' },
      take: limit,
    });
  }

  /**
   * Xây dựng query builder với các filter
   */
  private buildQueryBuilder(userId: string, queryDto: QueryActivityDto): SelectQueryBuilder<Activity> {
    const queryBuilder = this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.isDeleted = false');

    // Filter theo user
    queryBuilder.andWhere('(activity.userId = :userId OR activity.isPublic = true)', { userId });

    // Filter theo loại
    if (queryDto.type) {
      queryBuilder.andWhere('activity.type = :type', { type: queryDto.type });
    }

    // Filter theo trạng thái
    if (queryDto.status) {
      queryBuilder.andWhere('activity.status = :status', { status: queryDto.status });
    }

    // Filter theo thời gian
    if (queryDto.startTimeFrom) {
      queryBuilder.andWhere('activity.startTime >= :startTimeFrom', { 
        startTimeFrom: new Date(queryDto.startTimeFrom) 
      });
    }

    if (queryDto.startTimeTo) {
      queryBuilder.andWhere('activity.startTime <= :startTimeTo', { 
        startTimeTo: new Date(queryDto.startTimeTo) 
      });
    }

    // Filter theo khoảng cách
    if (queryDto.minDistance) {
      queryBuilder.andWhere('activity.distance >= :minDistance', { minDistance: queryDto.minDistance });
    }

    if (queryDto.maxDistance) {
      queryBuilder.andWhere('activity.distance <= :maxDistance', { maxDistance: queryDto.maxDistance });
    }

    // Filter theo thời lượng
    if (queryDto.minDuration) {
      queryBuilder.andWhere('activity.duration >= :minDuration', { minDuration: queryDto.minDuration });
    }

    if (queryDto.maxDuration) {
      queryBuilder.andWhere('activity.duration <= :maxDuration', { maxDuration: queryDto.maxDuration });
    }

    // Filter theo quyền riêng tư
    if (queryDto.publicOnly) {
      queryBuilder.andWhere('activity.isPublic = true');
    }

    // Tìm kiếm theo tên hoặc mô tả
    if (queryDto.search) {
      queryBuilder.andWhere(
        '(activity.title ILIKE :search OR activity.description ILIKE :search)',
        { search: `%${queryDto.search}%` }
      );
    }

    // Sắp xếp
    const sortOrder = queryDto.sortOrder === 'ASC' ? 'ASC' : 'DESC';
    queryBuilder.orderBy(`activity.${queryDto.sortBy}`, sortOrder);

    return queryBuilder;
  }

  /**
   * Tạo đường chạy sự kiện (chỉ admin)
   */
  async createEventRoute(userId: string, routeData: {
    name: string;
    description: string;
    distance: number;
    startLocation: string;
    endLocation: string;
    routePoints: Array<{ lat: number; lng: number; elevation?: number }>;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    estimatedTime: number; // phút
  }): Promise<Activity> {
    // Kiểm tra quyền admin
    const isAdmin = await this.checkAdminPermission(userId);
    if (!isAdmin) {
      throw new ForbiddenException('Chỉ admin mới được tạo đường chạy sự kiện');
    }

    // Tạo mã hoạt động duy nhất
    const activityCode = `ROUTE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const activity = this.activityRepository.create({
      activityCode,
      name: routeData.name,
      description: routeData.description,
      type: ActivityType.RUNNING,
      sportType: 'Run',
      status: ActivityStatus.SYNCED,
      visibility: ActivityVisibility.PUBLIC,
      isPublic: true,
      userId: 'system', // đánh dấu là của hệ thống
      source: 'admin_created',
      sourceActivityId: `route_${Date.now()}`,
      distance: routeData.distance,
      startTime: new Date(),
      endTime: new Date(),
      duration: routeData.estimatedTime * 60, // chuyển phút thành giây
      startLocation: routeData.startLocation,
      endLocation: routeData.endLocation,
      gpsData: routeData.routePoints, // lưu vào JSONB field gpsData
      metadata: {
        isEventRoute: true,
        difficulty: routeData.difficulty,
        routeType: 'event_route'
      }
    });

    return await this.activityRepository.save(activity);
  }
}
