import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserIntegration, UserIntegrationSyncStatus } from '../entities/user-integration.entity';
import { Activity } from '../../activity/entities/activity.entity';
import { ActivityService } from '../../activity/activity.service';
import { SyncActivityDto, SyncActivityResponseDto } from '../dto/sync-activity.dto';
import strava from 'strava-v3';


@Injectable()
export class SyncActivityService {
  private readonly logger = new Logger(SyncActivityService.name);

  constructor(
    @InjectRepository(UserIntegration)
    private userIntegrationRepo: Repository<UserIntegration>,
    @InjectRepository(Activity)
    private activityRepo: Repository<Activity>,
    private activityService: ActivityService,
  ) {}

  /**
   * Đồng bộ hoạt động thủ công cho người dùng
   */
  async syncUserActivities(syncDto: SyncActivityDto): Promise<SyncActivityResponseDto> {
    const startTime = Date.now();
    
    try {
      // Validate userId
      if (!syncDto.userId) {
        throw new BadRequestException('User ID không được để trống');
      }
      
      this.logger.log(`Bắt đầu đồng bộ hoạt động cho user: ${syncDto.userId}`);

      // 1. Kiểm tra kết nối tích hợp của người dùng
      const userIntegration = await this.getUserIntegration(syncDto.userId, 'strava');
      
      // 2. Kiểm tra token còn hạn
      if (userIntegration.tokenExpiry && this.isTokenExpired(userIntegration.tokenExpiry)) {
        throw new BadRequestException('Token đã hết hạn, vui lòng kết nối lại với Strava');
      }

      // 3. Đồng bộ song song cả activities và stats từ Strava
      const [newActivities, statsResult] = await Promise.allSettled([
        this.syncFromStrava(userIntegration, syncDto.daysBack),
        this.activityService.syncStatsFromStrava(syncDto.userId)
      ]);

      // Xử lý kết quả activities
      const activitiesCount = newActivities.status === 'fulfilled' ? newActivities.value : 0;
      if (newActivities.status === 'rejected') {
        this.logger.error(`Lỗi đồng bộ activities: ${newActivities.reason.message}`);
        throw newActivities.reason;
      }

      // Xử lý kết quả stats
      if (statsResult.status === 'fulfilled') {
        this.logger.log(`Đồng bộ stats thành công cho user: ${syncDto.userId}`);
      } else {
        this.logger.warn(`Lỗi đồng bộ stats (không ảnh hưởng đến activities): ${statsResult.reason.message}`);
      }

      // 5. Cập nhật trạng thái đồng bộ
      await this.updateSyncStatus(userIntegration.id, UserIntegrationSyncStatus.ACTIVE, new Date());

      const duration = Date.now() - startTime;
      const message = activitiesCount > 0 
        ? `Đồng bộ thành công ${activitiesCount} hoạt động mới và cập nhật thống kê`
        : 'Không có hoạt động mới để đồng bộ, đã cập nhật thống kê';

      this.logger.log(`Đồng bộ hoàn thành: ${message} (${duration}ms)`);

      return {
        success: true,
        newActivities: activitiesCount,
        syncTime: new Date().toISOString(),
        message,
        duration,
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`Lỗi đồng bộ hoạt động: ${error.message}`, error.stack);

      // Cập nhật trạng thái lỗi
      if (syncDto.userId) {
        await this.updateSyncStatus(syncDto.userId, UserIntegrationSyncStatus.ERROR, new Date(), error.message);
      }

      return {
        success: false,
        newActivities: 0,
        syncTime: new Date().toISOString(),
        message: 'Đồng bộ thất bại',
        error: error.message,
        duration,
      };
    }
  }

  /**
   * Lấy thông tin tích hợp của người dùng
   */
  private async getUserIntegration(userId: string, platform: string = 'strava'): Promise<UserIntegration> {
    const userIntegration = await this.userIntegrationRepo
      .createQueryBuilder('ui')
      .leftJoinAndSelect('ui.integration', 'integration')
      .where('ui.userId = :userId', { userId })
      .andWhere('ui.isActive = :isActive', { isActive: true })
      .andWhere('integration.provider = :platform', { platform })
      .getOne();

    if (!userIntegration) {
      throw new BadRequestException('Người dùng chưa kết nối với Strava');
    }

    return userIntegration;
  }

  /**
   * Kiểm tra token có hết hạn không
   */
  private isTokenExpired(tokenExpiry: Date): boolean {
    if (!tokenExpiry) return true;
    
    // Token hết hạn trước 5 phút
    const now = new Date();
    const expiryTime = new Date(tokenExpiry);
    expiryTime.setMinutes(expiryTime.getMinutes() - 5);
    
    return now >= expiryTime;
  }

  /**
   * Đồng bộ từ Strava
   */
  private async syncFromStrava(userIntegration: UserIntegration, daysBack: number = 7): Promise<number> {
    this.logger.log('Đồng bộ hoạt động từ Strava...');
    
    try {
      // Kiểm tra token hết hạn
      if (userIntegration.tokenExpiry && this.isTokenExpired(userIntegration.tokenExpiry)) {
        throw new BadRequestException('Token Strava đã hết hạn, vui lòng kết nối lại');
      }

      // Lấy hoạt động từ Strava API
      if (!userIntegration.accessToken) {
        throw new BadRequestException('Access token không tồn tại');
      }
      const stravaActivities = await this.fetchStravaActivities(userIntegration.accessToken, daysBack);
      
      let newActivitiesCount = 0;
      
      for (const stravaActivity of stravaActivities) {
        const activityData = this.mapStravaToActivity(stravaActivity, userIntegration.userId);
        
        // Sử dụng ActivityService để tạo activity
        await this.activityService.createFromIntegration(activityData);
        newActivitiesCount++;
      }

      this.logger.log(`Đồng bộ thành công ${newActivitiesCount} hoạt động từ Strava`);
      return newActivitiesCount;

    } catch (error) {
      this.logger.error(`Lỗi đồng bộ từ Strava: ${error.message}`);
      throw new InternalServerErrorException(`Lỗi đồng bộ từ Strava: ${error.message}`);
    }
  }

  /**
   * Lấy hoạt động từ Strava API
   */
  private async fetchStravaActivities(accessToken: string, daysBack: number = 7): Promise<any[]> {
    try {
      const after = Math.floor((Date.now() - daysBack * 24 * 60 * 60 * 1000) / 1000);
      
      // Sử dụng strava-v3 library
      const activities = await strava.athlete.listActivities({
        access_token: accessToken,
        after: after,
        per_page: 200
      });

      this.logger.log(`Lấy được ${activities.length} hoạt động từ Strava`);
      
      return activities;
    } catch (error) {
      this.logger.error(`Lỗi gọi Strava API: ${error.message}`);
      throw error;
    }
  }



  /**
   * Map dữ liệu từ Strava sang Activity entity
   */
  private mapStravaToActivity(stravaActivity: any, userId: string): Partial<Activity> {
    return {
      activityCode: `STRAVA_${stravaActivity.id}`,
      name: stravaActivity.name,
      description: stravaActivity.description,
      userId,
      type: stravaActivity.type,
      sportType: stravaActivity.sport_type,
      startTime: new Date(stravaActivity.start_date),
      endTime: new Date(stravaActivity.start_date_local),
      duration: stravaActivity.elapsed_time,
      elapsedTime: stravaActivity.elapsed_time,
      distance: stravaActivity.distance / 1000, // Convert meters to km
      averageSpeed: stravaActivity.average_speed * 3.6, // Convert m/s to km/h
      maxSpeed: stravaActivity.max_speed * 3.6,
      averageHeartRate: stravaActivity.average_heartrate,
      maxHeartRate: stravaActivity.max_heartrate,
      calories: stravaActivity.calories,
      totalElevationGain: stravaActivity.total_elevation_gain,
      startLatitude: stravaActivity.start_latlng?.[0],
      startLongitude: stravaActivity.start_latlng?.[1],
      endLatitude: stravaActivity.end_latlng?.[0],
      endLongitude: stravaActivity.end_latlng?.[1],
      source: 'strava',
      sourceActivityId: stravaActivity.id.toString(),
      lastSyncedAt: new Date(),
      // Các trường bổ sung từ Strava - chỉ map những field thực sự tồn tại
      gearId: stravaActivity.gear_id,
      equipment: stravaActivity.device_name,
      manual: stravaActivity.manual,
      private: stravaActivity.private,
      flagged: stravaActivity.flagged,
      kilojoules: stravaActivity.kilojoules,
      averageWatts: stravaActivity.average_watts,
      maxWatts: stravaActivity.max_watts,
      workoutType: stravaActivity.workout_type,
      uploadId: stravaActivity.upload_id_str,
    };
  }



  /**
   * Cập nhật trạng thái đồng bộ
   */
  private async updateSyncStatus(
    userIntegrationId: string, 
    syncStatus: UserIntegrationSyncStatus, 
    lastSyncedAt: Date,
    lastSyncError?: string
  ): Promise<void> {
    try {
      await this.userIntegrationRepo.update(
        { id: userIntegrationId },
        { 
          syncStatus, 
          lastSyncedAt,
        }
      );
    } catch (error) {
      this.logger.error(`Lỗi cập nhật trạng thái đồng bộ: ${error.message}`);
    }
  }
}
