import { Injectable, NotFoundException, ForbiddenException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, MoreThanOrEqual, LessThanOrEqual, Between } from 'typeorm';
import { startOfWeek, startOfMonth, endOfWeek, endOfMonth } from 'date-fns';
import { Activity, ActivityType, ActivityStatus, ActivityVisibility } from './entities/activity.entity';
import { ActivityStats } from './entities/activity-stats.entity';
import { QueryActivityDto } from './dto/query-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { createPaginatedResult, getPaginationParams } from '../common/utils/pagination.util';
import { UserIntegration } from '../integration/entities/user-integration.entity';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
    @InjectRepository(ActivityStats)
    private activityStatsRepository: Repository<ActivityStats>,
    @InjectRepository(UserIntegration)
    private userIntegrationRepository: Repository<UserIntegration>,
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
   * Lấy thống kê tuần/tháng của user từ database
   */
  async getUserWeekMonthStats(userId: string): Promise<any> {
    try {
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 }); 
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); 
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      // Lấy activities tuần này (từ chủ nhật đến thứ 7)
      const weekActivities = await this.activityRepository.find({
        where: {
          userId,
          isDeleted: false,
          startTime: Between(weekStart, weekEnd)
        }
      });

      // Lấy activities tháng này (từ ngày 1 đến ngày cuối tháng)
      const monthActivities = await this.activityRepository.find({
        where: {
          userId,
          isDeleted: false,
          startTime: Between(monthStart, monthEnd)
        }
      });

      // Tính thống kê tuần
      const weekStats = {
        distance: weekActivities.reduce((sum, activity) => sum + (parseFloat(activity.distance?.toString() || '0') || 0), 0),
        count: weekActivities.length,
        duration: weekActivities.reduce((sum, activity) => sum + (parseInt(activity.duration?.toString() || '0') || 0), 0),
        calories: weekActivities.reduce((sum, activity) => sum + (parseInt(activity.calories?.toString() || '0') || 0), 0)
      };

      // Tính thống kê tháng
      const monthStats = {
        distance: monthActivities.reduce((sum, activity) => sum + (parseFloat(activity.distance?.toString() || '0') || 0), 0),
        count: monthActivities.length,
        duration: monthActivities.reduce((sum, activity) => sum + (parseInt(activity.duration?.toString() || '0') || 0), 0),
        calories: monthActivities.reduce((sum, activity) => sum + (parseInt(activity.calories?.toString() || '0') || 0), 0)
      };

      return {
        week: weekStats,
        month: monthStats
      };
    } catch (error) {
      console.error('Error getting week/month stats:', error);
      return {
        week: { distance: 0, count: 0, duration: 0, calories: 0 },
        month: { distance: 0, count: 0, duration: 0, calories: 0 }
      };
    }
  }

  /**
   * Lấy thống kê hoạt động của user từ database
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
      source: 'local'
    };
  }

  /**
   * Lấy thống kê hoạt động của user từ Strava API
   * Tận dụng tối đa dữ liệu có sẵn từ Strava, chỉ bổ sung thông tin CLB/giải/thử thách
   */
  async getUserStatsFromStrava(userId: string): Promise<any> {
    try {
      // Lấy thông tin integration Strava của user
      const userIntegration = await this.userIntegrationRepository
        .createQueryBuilder('ui')
        .leftJoinAndSelect('ui.integration', 'integration')
        .where('ui.userId = :userId', { userId })
        .andWhere('integration.provider = :provider', { provider: 'strava' })
        .getOne();

      if (!userIntegration || !userIntegration.accessToken) {
        throw new BadRequestException('Chưa kết nối với Strava');
      }

      // Kiểm tra token hết hạn
      if (userIntegration.tokenExpiry && new Date() >= userIntegration.tokenExpiry) {
        throw new BadRequestException('Token Strava đã hết hạn, vui lòng kết nối lại');
      }

      // Gọi Strava API để lấy thống kê
      const strava = require('strava-v3');
      
      // Lấy athlete ID trước
      const athlete = await strava.athletes.get({
        access_token: userIntegration.accessToken,
        id: 'me'
      });
      
      console.log('Athlete ID:', athlete.id);
      
      // Với scope 'read' hiện tại, không thể lấy activities/stats từ Strava API
      // Tự tính thống kê từ activities đã có trong database
      console.log('Scope hiện tại chỉ có "read", tự tính thống kê từ database');
      
      const athleteStats = await this.calculateStatsFromDatabase(userId);


      // Lấy thống kê CLB/giải/thử thách từ database (chỉ phần bổ sung)
      const clubStats = await this.getClubChallengeStats(userId);

      // Trả về dữ liệu từ Strava + thông tin bổ sung từ hệ thống
      return {
        // Dữ liệu chính từ Strava (không cần tính toán)
        source: 'strava',
        stravaStats: athleteStats,
        
        // Tổng hợp từ Strava (tận dụng dữ liệu có sẵn)
        totalActivities: this.calculateTotalActivities(athleteStats),
        totalDistance: this.calculateTotalDistance(athleteStats),
        totalDuration: this.calculateTotalDuration(athleteStats),
        totalCalories: this.calculateTotalCalories(athleteStats),
        
        // Thống kê theo loại từ Strava
        activitiesByType: this.getActivitiesByType(athleteStats),
        
        // Thống kê theo thời gian từ Strava
        recentStats: this.getRecentStats(athleteStats),
        ytdStats: this.getYtdStats(athleteStats),
        
        // Thông tin bổ sung từ hệ thống (CLB/giải/thử thách)
        clubStats: clubStats
      };

    } catch (error) {
      console.error(`Lỗi lấy thống kê từ Strava: ${error.message}`);
      throw new InternalServerErrorException(`Lỗi lấy thống kê từ Strava: ${error.message}`);
    }
  }

  /**
   * Tính tổng số hoạt động từ Strava stats
   */
  private calculateTotalActivities(athleteStats: any): number {
    const runCount = athleteStats.all_run_totals?.count || 0;
    const rideCount = athleteStats.all_ride_totals?.count || 0;
    const swimCount = athleteStats.all_swim_totals?.count || 0;
    return runCount + rideCount + swimCount;
  }

  /**
   * Tính tổng khoảng cách từ Strava stats (convert meters to km)
   */
  private calculateTotalDistance(athleteStats: any): number {
    const runDistance = athleteStats.all_run_totals?.distance || 0;
    const rideDistance = athleteStats.all_ride_totals?.distance || 0;
    const swimDistance = athleteStats.all_swim_totals?.distance || 0;
    return (runDistance + rideDistance + swimDistance) / 1000; // Convert to km
  }

  /**
   * Tính tổng thời gian từ Strava stats
   */
  private calculateTotalDuration(athleteStats: any): number {
    const runTime = athleteStats.all_run_totals?.moving_time || 0;
    const rideTime = athleteStats.all_ride_totals?.moving_time || 0;
    const swimTime = athleteStats.all_swim_totals?.moving_time || 0;
    return runTime + rideTime + swimTime;
  }

  /**
   * Tính tổng calories từ Strava stats
   */
  private calculateTotalCalories(athleteStats: any): number {
    const runCalories = athleteStats.all_run_totals?.calories || 0;
    const rideCalories = athleteStats.all_ride_totals?.calories || 0;
    const swimCalories = athleteStats.all_swim_totals?.calories || 0;
    return runCalories + rideCalories + swimCalories;
  }

  /**
   * Lấy thống kê theo loại hoạt động từ Strava
   */
  private getActivitiesByType(athleteStats: any): any {
    return {
      running: {
        count: athleteStats.all_run_totals?.count || 0,
        distance: (athleteStats.all_run_totals?.distance || 0) / 1000, // km
        duration: athleteStats.all_run_totals?.moving_time || 0,
        calories: athleteStats.all_run_totals?.calories || 0
      },
      cycling: {
        count: athleteStats.all_ride_totals?.count || 0,
        distance: (athleteStats.all_ride_totals?.distance || 0) / 1000, // km
        duration: athleteStats.all_ride_totals?.moving_time || 0,
        calories: athleteStats.all_ride_totals?.calories || 0
      },
      swimming: {
        count: athleteStats.all_swim_totals?.count || 0,
        distance: (athleteStats.all_swim_totals?.distance || 0) / 1000, // km
        duration: athleteStats.all_swim_totals?.moving_time || 0,
        calories: athleteStats.all_swim_totals?.calories || 0
      }
    };
  }

  /**
   * Lấy thống kê gần đây từ Strava
   */
  private getRecentStats(athleteStats: any): any {
    return {
      running: athleteStats.recent_run_totals || {},
      cycling: athleteStats.recent_ride_totals || {},
      swimming: athleteStats.recent_swim_totals || {}
    };
  }

  /**
   * Lấy thống kê năm hiện tại từ Strava
   */
  private getYtdStats(athleteStats: any): any {
    return {
      running: athleteStats.ytd_run_totals || {},
      cycling: athleteStats.ytd_ride_totals || {},
      swimming: athleteStats.ytd_swim_totals || {}
    };
  }

  /**
   * Đồng bộ thống kê từ Strava và lưu vào database
   */
  async syncStatsFromStrava(userId: string): Promise<any> {
    try {
      // Lấy thống kê từ Strava
      const stravaStats = await this.getUserStatsFromStrava(userId);
      
      // Tìm hoặc tạo record stats cho user
      let activityStats = await this.activityStatsRepository.findOne({
        where: { userId }
      });

      if (!activityStats) {
        activityStats = this.activityStatsRepository.create({
          userId,
          source: 'strava'
        });
      }

      // Cập nhật dữ liệu từ Strava
      activityStats.totalActivities = stravaStats.totalActivities || 0;
      activityStats.totalDistance = stravaStats.totalDistance || 0;
      activityStats.totalDuration = stravaStats.totalDuration || 0;
      activityStats.totalCalories = stravaStats.totalCalories || 0;
      activityStats.totalElevationGain = stravaStats.totalElevationGain || 0;
      activityStats.averageSpeed = stravaStats.averageSpeed || 0;
      activityStats.averagePace = stravaStats.averagePace || 0;
      activityStats.averageHeartRate = stravaStats.averageHeartRate || 0;
      activityStats.longestDistance = stravaStats.longestDistance || 0;
      activityStats.longestDuration = stravaStats.longestDuration || 0;
      activityStats.fastestPace = stravaStats.fastestPace || 0;
      activityStats.mostCalories = stravaStats.mostCalories || 0;
      activityStats.activitiesByType = stravaStats.activitiesByType || {};
      activityStats.recentStats = stravaStats.recentStats || {};
      activityStats.ytdStats = stravaStats.ytdStats || {};
      activityStats.clubStats = stravaStats.clubStats || {};
      activityStats.stravaStats = stravaStats.stravaStats || {};
      activityStats.lastSyncedAt = new Date();

      // Lưu vào database
      await this.activityStatsRepository.save(activityStats);
      
      return {
        success: true,
        message: 'Đồng bộ thống kê thành công',
        data: stravaStats
      };
    } catch (error) {
      console.error(`Lỗi đồng bộ thống kê từ Strava: ${error.message}`);
      throw new InternalServerErrorException(`Lỗi đồng bộ thống kê: ${error.message}`);
    }
  }

  /**
   * Lấy thống kê đã đồng bộ từ database
   */
  async getSyncedStats(userId: string): Promise<any> {
    try {
      const activityStats = await this.activityStatsRepository.findOne({
        where: { userId }
      });

      if (!activityStats) {
        // Nếu chưa có dữ liệu đồng bộ, tự tính từ activities trong database
        console.log('Chưa có stats đã sync, tự tính từ activities trong database');
        return this.calculateStatsFromDatabase(userId);
      }

      return {
        totalActivities: activityStats.totalActivities,
        totalDistance: activityStats.totalDistance,
        totalDuration: activityStats.totalDuration,
        totalCalories: activityStats.totalCalories,
        totalElevationGain: activityStats.totalElevationGain,
        averageSpeed: activityStats.averageSpeed,
        averagePace: activityStats.averagePace,
        averageHeartRate: activityStats.averageHeartRate,
        longestDistance: activityStats.longestDistance,
        longestDuration: activityStats.longestDuration,
        fastestPace: activityStats.fastestPace,
        mostCalories: activityStats.mostCalories,
        activitiesByType: activityStats.activitiesByType,
        recentStats: activityStats.recentStats,
        ytdStats: activityStats.ytdStats,
        clubStats: activityStats.clubStats,
        stravaStats: activityStats.stravaStats,
        source: 'synced',
        lastSyncedAt: activityStats.lastSyncedAt
      };
    } catch (error) {
      console.error(`Lỗi lấy thống kê đã đồng bộ: ${error.message}`);
      throw new InternalServerErrorException(`Lỗi lấy thống kê: ${error.message}`);
    }
  }

  /**
   * Đồng bộ toàn bộ (activities + statistics) từ Strava
   */
  async syncAllFromStrava(userId: string): Promise<any> {
    try {
      // Đồng bộ activities từ Strava
      const activitiesResult = await this.syncActivitiesFromStrava(userId);
      
      // Đồng bộ statistics từ Strava
      const statsResult = await this.syncStatsFromStrava(userId);
      
      return {
        success: true,
        message: 'Đồng bộ toàn bộ thành công',
        data: {
          activities: activitiesResult,
          stats: statsResult
        }
      };
    } catch (error) {
      console.error(`Lỗi đồng bộ toàn bộ từ Strava: ${error.message}`);
      throw new InternalServerErrorException(`Lỗi đồng bộ toàn bộ: ${error.message}`);
    }
  }

  /**
   * Đồng bộ activities từ Strava
   */
  private async syncActivitiesFromStrava(userId: string): Promise<any> {
    try {
      // Lấy thông tin integration Strava của user
      const userIntegration = await this.userIntegrationRepository
        .createQueryBuilder('ui')
        .leftJoinAndSelect('ui.integration', 'integration')
        .where('ui.userId = :userId', { userId })
        .andWhere('integration.provider = :provider', { provider: 'strava' })
        .getOne();

      if (!userIntegration || !userIntegration.accessToken) {
        throw new BadRequestException('Chưa kết nối với Strava');
      }

      // Kiểm tra token hết hạn
      if (userIntegration.tokenExpiry && new Date() >= userIntegration.tokenExpiry) {
        throw new BadRequestException('Token Strava đã hết hạn, vui lòng kết nối lại');
      }

      // Gọi Strava API để lấy activities
      const strava = require('strava-v3');
      const activities = await strava.athlete.activities({
        access_token: userIntegration.accessToken,
        per_page: 200 // Lấy tối đa 200 activities gần nhất
      });

      let syncedCount = 0;
      let updatedCount = 0;

      // Đồng bộ từng activity
      for (const stravaActivity of activities) {
        const existingActivity = await this.activityRepository.findOne({
          where: { sourceActivityId: stravaActivity.id.toString() }
        });

        if (existingActivity) {
          // Cập nhật activity đã có
          existingActivity.name = stravaActivity.name;
          existingActivity.distance = parseFloat(stravaActivity.distance) / 1000; // Convert m to km
          existingActivity.duration = stravaActivity.moving_time;
          existingActivity.averageSpeed = stravaActivity.average_speed * 3.6; // Convert m/s to km/h
          existingActivity.calories = stravaActivity.calories;
          existingActivity.startTime = new Date(stravaActivity.start_date);
          existingActivity.endTime = new Date(stravaActivity.start_date_local);
          existingActivity.lastSyncedAt = new Date();
          
          await this.activityRepository.save(existingActivity);
          updatedCount++;
        } else {
          // Tạo activity mới
          const newActivity = new Activity();
          newActivity.activityCode = `STRAVA_${stravaActivity.id}`;
          newActivity.name = stravaActivity.name;
          newActivity.type = this.mapStravaTypeToActivityType(stravaActivity.type);
          newActivity.sportType = stravaActivity.sport_type;
          newActivity.status = ActivityStatus.SYNCED;
          newActivity.visibility = ActivityVisibility.PRIVATE;
          newActivity.userId = userId;
          newActivity.source = 'strava';
          newActivity.sourceActivityId = stravaActivity.id.toString();
          newActivity.distance = parseFloat(stravaActivity.distance) / 1000; // Convert m to km
          newActivity.duration = stravaActivity.moving_time;
          newActivity.averageSpeed = stravaActivity.average_speed * 3.6; // Convert m/s to km/h
          newActivity.calories = stravaActivity.calories;
          newActivity.startTime = new Date(stravaActivity.start_date);
          newActivity.endTime = new Date(stravaActivity.start_date_local);
          newActivity.lastSyncedAt = new Date();
          
          await this.activityRepository.save(newActivity);
          syncedCount++;
        }
      }

      return {
        success: true,
        message: `Đồng bộ activities thành công`,
        syncedCount,
        updatedCount,
        totalProcessed: activities.length
      };
    } catch (error) {
      console.error(`Lỗi đồng bộ activities từ Strava: ${error.message}`);
      throw new InternalServerErrorException(`Lỗi đồng bộ activities: ${error.message}`);
    }
  }

  /**
   * Tính toán stats từ activities trong database
   */
  private async calculateStatsFromDatabase(userId: string): Promise<any> {
    try {
      // Lấy tất cả activities của user từ database
      const activities = await this.activityRepository.find({
        where: { userId },
        select: [
          'type', 'distance', 'duration', 'calories', 'totalElevationGain',
          'averageSpeed', 'averagePace', 'averageHeartRate', 'startTime', 'createdAt'
        ]
      });

      console.log(`Found ${activities.length} activities in database for user ${userId}`);

      if (activities.length === 0) {
        return {
          totalActivities: 0,
          totalDistance: 0,
          totalDuration: 0,
          totalCalories: 0,
          totalElevationGain: 0,
          averageSpeed: 0,
          averagePace: 0,
          activitiesByType: {},
          recentStats: {},
          ytdStats: {},
          source: 'database',
          message: 'Không có activities trong database'
        };
      }

      // Tính toán thống kê
      let totalActivities = activities.length;
      let totalDistance = 0;
      let totalDuration = 0;
      let totalCalories = 0;
      let totalElevationGain = 0;
      let activitiesByType = {};
      let recentStats = {};
      let ytdStats = {};
      
      // Thống kê kỷ lục
      let longestDistance = 0;
      let longestDuration = 0;
      let fastestPace = Infinity;
      let mostCalories = 0;
      let averageHeartRate = 0;
      let totalHeartRate = 0;
      let heartRateCount = 0;

      // Tính tổng hợp
      activities.forEach(activity => {
        const distance = parseFloat(activity.distance?.toString() || '0') || 0;
        const duration = parseInt(activity.duration?.toString() || '0') || 0;
        const calories = parseInt(activity.calories?.toString() || '0') || 0;
        const elevation = parseFloat(activity.totalElevationGain?.toString() || '0') || 0;
        const heartRate = parseInt(activity.averageHeartRate?.toString() || '0') || 0;
        const pace = parseFloat(activity.averagePace?.toString() || '0') || 0;

        totalDistance += distance;
        totalDuration += duration;
        totalCalories += calories;
        totalElevationGain += elevation;

        // Tính kỷ lục
        if (distance > longestDistance) longestDistance = distance;
        if (duration > longestDuration) longestDuration = duration;
        if (calories > mostCalories) mostCalories = calories;
        if (pace > 0 && pace < fastestPace) fastestPace = pace;
        
        // Tính nhịp tim trung bình
        if (heartRate > 0) {
          totalHeartRate += heartRate;
          heartRateCount++;
        }

        // Thống kê theo loại
        const type = activity.type || 'Other';
        if (!activitiesByType[type]) {
          activitiesByType[type] = {
            count: 0,
            distance: 0,
            duration: 0,
            calories: 0
          };
        }
        activitiesByType[type].count++;
        activitiesByType[type].distance += distance;
        activitiesByType[type].duration += duration;
        activitiesByType[type].calories += calories;
      });

      // Tính trung bình
      const averageSpeed = totalDuration > 0 ? totalDistance / (totalDuration / 3600) : 0; // km/h (distance already in km)
      const averagePace = totalDistance > 0 ? totalDuration / totalDistance : 0; // seconds/km (distance already in km)
      averageHeartRate = heartRateCount > 0 ? totalHeartRate / heartRateCount : 0;
      
      // Xử lý fastestPace nếu không có dữ liệu
      if (fastestPace === Infinity) fastestPace = 0;

      // Làm tròn distance trong activitiesByType
      Object.keys(activitiesByType).forEach(type => {
        activitiesByType[type].distance = Math.round(activitiesByType[type].distance * 10) / 10; // Distance already in km, round to 1 decimal
      });

      // Thống kê gần đây (30 ngày)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentActivities = activities.filter(a => a.startTime && new Date(a.startTime) >= thirtyDaysAgo);
      
      recentStats = {
        count: recentActivities.length,
        distance: Math.round((recentActivities.reduce((sum, a) => sum + (parseFloat(a.distance?.toString() || '0') || 0), 0)) * 10) / 10, // Distance already in km, round to 1 decimal
        duration: recentActivities.reduce((sum, a) => sum + (parseInt(a.duration?.toString() || '0') || 0), 0),
        calories: recentActivities.reduce((sum, a) => sum + (parseInt(a.calories?.toString() || '0') || 0), 0)
      };

      // Thống kê năm nay
      const currentYear = new Date().getFullYear();
      const ytdActivities = activities.filter(a => a.startTime && new Date(a.startTime).getFullYear() === currentYear);
      
      ytdStats = {
        count: ytdActivities.length,
        distance: Math.round((ytdActivities.reduce((sum, a) => sum + (parseFloat(a.distance?.toString() || '0') || 0), 0)) * 10) / 10, // Distance already in km, round to 1 decimal
        duration: ytdActivities.reduce((sum, a) => sum + (parseInt(a.duration?.toString() || '0') || 0), 0),
        calories: ytdActivities.reduce((sum, a) => sum + (parseInt(a.calories?.toString() || '0') || 0), 0)
      };

      return {
        totalActivities,
        totalDistance: Math.round(totalDistance * 10) / 10, // Distance already in km, round to 1 decimal
        totalDuration,
        totalCalories,
        totalElevationGain: Math.round(totalElevationGain * 10) / 10, // Round to 1 decimal
        averageSpeed: Math.round(averageSpeed * 10) / 10, // Round to 1 decimal
        averagePace: Math.round(averagePace * 10) / 10, // Round to 1 decimal
        averageHeartRate: Math.round(averageHeartRate * 10) / 10, // Round to 1 decimal
        longestDistance: Math.round(longestDistance * 10) / 10, // Distance already in km, round to 1 decimal
        longestDuration,
        fastestPace: Math.round(fastestPace * 10) / 10, // Round to 1 decimal
        mostCalories,
        activitiesByType,
        recentStats,
        ytdStats,
        source: 'database',
        message: `Tính từ ${totalActivities} activities trong database`
      };

    } catch (error) {
      console.error('Error calculating stats from database:', error);
      return {
        totalActivities: 0,
        totalDistance: 0,
        totalDuration: 0,
        totalCalories: 0,
        totalElevationGain: 0,
        averageSpeed: 0,
        averagePace: 0,
        averageHeartRate: 0,
        longestDistance: 0,
        longestDuration: 0,
        fastestPace: 0,
        mostCalories: 0,
        activitiesByType: {},
        recentStats: {},
        ytdStats: {},
        source: 'database',
        message: 'Lỗi tính toán thống kê từ database'
      };
    }
  }

  /**
   * Tính toán stats từ danh sách activities
   */
  private calculateStatsFromActivities(activities: any[]): any {
    if (!activities || activities.length === 0) {
      return {
        totalActivities: 0,
        totalDistance: 0,
        totalDuration: 0,
        totalCalories: 0,
        totalElevationGain: 0,
        averageSpeed: 0,
        averagePace: 0,
        activitiesByType: {},
        recentStats: {},
        ytdStats: {}
      };
    }

    let totalActivities = activities.length;
    let totalDistance = 0;
    let totalDuration = 0;
    let totalCalories = 0;
    let totalElevationGain = 0;
    let activitiesByType = {};
    let recentStats = {};
    let ytdStats = {};

    // Tính toán tổng hợp
    activities.forEach(activity => {
      totalDistance += parseFloat(activity.distance) || 0;
      totalDuration += parseInt(activity.moving_time) || 0;
      totalCalories += parseInt(activity.calories) || 0;
      totalElevationGain += parseFloat(activity.total_elevation_gain) || 0;

      // Thống kê theo loại
      const type = activity.type || 'Other';
      if (!activitiesByType[type]) {
        activitiesByType[type] = {
          count: 0,
          distance: 0,
          duration: 0,
          calories: 0
        };
      }
      activitiesByType[type].count++;
      activitiesByType[type].distance += parseFloat(activity.distance) || 0;
      activitiesByType[type].duration += parseInt(activity.moving_time) || 0;
      activitiesByType[type].calories += parseInt(activity.calories) || 0;
    });

    // Tính trung bình
    const averageSpeed = totalDuration > 0 ? (totalDistance / 1000) / (totalDuration / 3600) : 0; // km/h
    const averagePace = totalDistance > 0 ? totalDuration / (totalDistance / 1000) : 0; // seconds/km

    return {
      totalActivities,
      totalDistance: totalDistance / 1000, // Convert to km
      totalDuration,
      totalCalories,
      totalElevationGain,
      averageSpeed,
      averagePace,
      activitiesByType,
      recentStats,
      ytdStats
    };
  }

  /**
   * Map Strava activity type to our ActivityType enum
   */
  private mapStravaTypeToActivityType(stravaType: string): ActivityType {
    const typeMap = {
      'Run': ActivityType.RUNNING,
      'Ride': ActivityType.CYCLING,
      'Swim': ActivityType.SWIMMING,
      'Walk': ActivityType.WALKING,
      'Hike': ActivityType.HIKING,
      'TrailRun': ActivityType.TRAIL_RUNNING,
      'Workout': ActivityType.WEIGHT_TRAINING,
      'WeightTraining': ActivityType.WEIGHT_TRAINING,
      'Yoga': ActivityType.YOGA
    };
    return typeMap[stravaType] || ActivityType.RUNNING;
  }

  /**
   * Lấy thống kê CLB/giải/thử thách từ database (chỉ phần bổ sung)
   */
  private async getClubChallengeStats(userId: string): Promise<any> {
    // TODO: Implement queries để lấy thống kê CLB/giải/thử thách
    // Chỉ lấy thông tin bổ sung mà Strava không có
    return {
      clubActivities: 0,
      eventParticipations: 0,
      challengeCompletions: 0,
      raceParticipations: 0
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
   * Lấy hoạt động theo loại từ database
   */
  async getActivitiesByTypeFromDB(userId: string, type: ActivityType, limit: number = 10): Promise<Activity[]> {
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
