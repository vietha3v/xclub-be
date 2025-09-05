import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like, Between } from 'typeorm';
import { Achievement, AchievementType, AchievementTier, AchievementStatus } from './entities/achievement.entity';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { QueryAchievementDto } from './dto/query-achievement.dto';
import { AwardAchievementDto } from './dto/award-achievement.dto';
import { UserService } from '../user/user.service';
import { ClubService } from '../club/club.service';
import { ActivityService } from '../activity/activity.service';
import { RaceService } from '../race/race.service';
import { ChallengeService } from '../challenge/challenge.service';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { generateCode } from '../common/utils/code-generator';
import { createPaginatedResult, getPaginationParams } from '../common/utils/pagination.util';

export interface AchievementStats {
  totalAchievements: number;
  activeAchievements: number;
  inactiveAchievements: number;
  typeBreakdown: Record<string, number>;
  tierBreakdown: Record<string, number>;
  totalPoints: number;
  averagePoints: number;
}

export interface UserAchievementProgress {
  achievementId: string;
  achievementCode: string;
  name: string;
  type: AchievementType;
  tier: AchievementTier;
  targetValue: number;
  currentValue: number;
  progress: number;
  isCompleted: boolean;
  completedAt?: Date;
  points: number;
}

@Injectable()
export class AchievementService {
  constructor(
    @InjectRepository(Achievement)
    private readonly achievementRepository: Repository<Achievement>,
    private readonly userService: UserService,
    private readonly clubService: ClubService,
    private readonly activityService: ActivityService,
    private readonly raceService: RaceService,
    private readonly challengeService: ChallengeService,
  ) {}

  /**
   * Tạo thành tích mới
   */
  async create(createAchievementDto: CreateAchievementDto, userId: string): Promise<Achievement> {
    // Kiểm tra mã thành tích đã tồn tại chưa
    const existingAchievement = await this.achievementRepository.findOne({
      where: { achievementCode: createAchievementDto.achievementCode, isDeleted: false }
    });

    if (existingAchievement) {
      throw new BadRequestException('Mã thành tích đã tồn tại');
    }

    // Kiểm tra CLB tồn tại nếu có
    if (createAchievementDto.clubId) {
      await this.clubService.findOne(createAchievementDto.clubId);
    }

    const achievement = this.achievementRepository.create({
      ...createAchievementDto,
      createdBy: userId,
      status: createAchievementDto.status || AchievementStatus.ACTIVE,
      points: createAchievementDto.points || 0,
    });

    return await this.achievementRepository.save(achievement);
  }

  /**
   * Lấy danh sách thành tích với phân trang và tìm kiếm
   */
  async findAll(queryDto: QueryAchievementDto): Promise<PaginatedResult<Achievement>> {
    const { search, type, tier, status, clubId, createdBy, tags, sortBy, sortOrder } = queryDto;
    const { page, limit, skip } = getPaginationParams(queryDto.page, queryDto.limit);

    const queryBuilder = this.achievementRepository.createQueryBuilder('achievement')
      .where('achievement.isDeleted = :isDeleted', { isDeleted: false });

    // Tìm kiếm
    if (search) {
      queryBuilder.andWhere(
        '(achievement.name ILIKE :search OR achievement.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Lọc theo loại
    if (type) {
      queryBuilder.andWhere('achievement.type = :type', { type });
    }

    // Lọc theo cấp độ
    if (tier) {
      queryBuilder.andWhere('achievement.tier = :tier', { tier });
    }

    // Lọc theo trạng thái
    if (status) {
      queryBuilder.andWhere('achievement.status = :status', { status });
    }

    // Lọc theo CLB
    if (clubId) {
      queryBuilder.andWhere('achievement.clubId = :clubId', { clubId });
    }

    // Lọc theo người tạo
    if (createdBy) {
      queryBuilder.andWhere('achievement.createdBy = :createdBy', { createdBy });
    }

    // Lọc theo tags
    if (tags) {
      queryBuilder.andWhere('achievement.tags @> :tags', { tags: [tags] });
    }

    // Sắp xếp
    const orderBy = sortBy || 'createdAt';
    const order = sortOrder || 'DESC';
    queryBuilder.orderBy(`achievement.${orderBy}`, order);

    // Phân trang
    queryBuilder.skip(skip).take(limit);

    const [achievements, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResult(achievements, total, page, limit);
  }

  /**
   * Lấy thành tích theo ID
   */
  async findOne(id: string): Promise<Achievement> {
    const achievement = await this.achievementRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!achievement) {
      throw new NotFoundException('Không tìm thấy thành tích');
    }

    return achievement;
  }

  /**
   * Lấy thành tích theo mã
   */
  async findByCode(achievementCode: string): Promise<Achievement> {
    const achievement = await this.achievementRepository.findOne({
      where: { achievementCode, isDeleted: false },
    });

    if (!achievement) {
      throw new NotFoundException('Không tìm thấy thành tích');
    }

    return achievement;
  }

  /**
   * Cập nhật thành tích
   */
  async update(id: string, updateAchievementDto: UpdateAchievementDto, userId: string): Promise<Achievement> {
    const achievement = await this.findOne(id);

    // Kiểm tra quyền sửa (chỉ người tạo hoặc admin)
    if (achievement.createdBy !== userId) {
      const user = await this.userService.findOne(userId);
      if (!user.roles || !user.roles.includes('admin')) {
        throw new ForbiddenException('Không có quyền cập nhật thành tích này');
      }
    }

    // Kiểm tra mã thành tích trùng lặp nếu có thay đổi
    if (updateAchievementDto.achievementCode && updateAchievementDto.achievementCode !== achievement.achievementCode) {
      const existingAchievement = await this.achievementRepository.findOne({
        where: { achievementCode: updateAchievementDto.achievementCode, isDeleted: false }
      });

      if (existingAchievement) {
        throw new BadRequestException('Mã thành tích đã tồn tại');
      }
    }

    Object.assign(achievement, updateAchievementDto);
    return await this.achievementRepository.save(achievement);
  }

  /**
   * Xóa thành tích (soft delete)
   */
  async remove(id: string, userId: string): Promise<void> {
    const achievement = await this.findOne(id);

    // Kiểm tra quyền xóa (chỉ người tạo hoặc admin)
    if (achievement.createdBy !== userId) {
      const user = await this.userService.findOne(userId);
      if (!user.roles || !user.roles.includes('admin')) {
        throw new ForbiddenException('Không có quyền xóa thành tích này');
      }
    }

    achievement.isDeleted = true;
    achievement.deletedAt = new Date();
    achievement.deletedBy = userId;

    await this.achievementRepository.save(achievement);
  }

  /**
   * Lấy thành tích theo loại
   */
  async findByType(type: AchievementType): Promise<Achievement[]> {
    return await this.achievementRepository.find({
      where: { type, status: AchievementStatus.ACTIVE, isDeleted: false },
      order: { points: 'DESC' },
    });
  }

  /**
   * Lấy thành tích theo cấp độ
   */
  async findByTier(tier: AchievementTier): Promise<Achievement[]> {
    return await this.achievementRepository.find({
      where: { tier, status: AchievementStatus.ACTIVE, isDeleted: false },
      order: { points: 'DESC' },
    });
  }

  /**
   * Lấy thành tích theo CLB
   */
  async findByClub(clubId: string): Promise<Achievement[]> {
    return await this.achievementRepository.find({
      where: { clubId, status: AchievementStatus.ACTIVE, isDeleted: false },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Lấy thành tích theo người tạo
   */
  async findByCreator(createdBy: string): Promise<Achievement[]> {
    return await this.achievementRepository.find({
      where: { createdBy, isDeleted: false },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Lấy thành tích phổ biến
   */
  async getPopularAchievements(limit: number = 10): Promise<Achievement[]> {
    return await this.achievementRepository.find({
      where: { status: AchievementStatus.ACTIVE, isDeleted: false },
      order: { points: 'DESC' },
      take: limit,
    });
  }

  /**
   * Lấy thành tích mới nhất
   */
  async getLatestAchievements(limit: number = 10): Promise<Achievement[]> {
    return await this.achievementRepository.find({
      where: { status: AchievementStatus.ACTIVE, isDeleted: false },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Lấy thống kê thành tích
   */
  async getStats(): Promise<AchievementStats> {
    const achievements = await this.achievementRepository.find({
      where: { isDeleted: false },
    });

    const stats: AchievementStats = {
      totalAchievements: achievements.length,
      activeAchievements: 0,
      inactiveAchievements: 0,
      typeBreakdown: {},
      tierBreakdown: {},
      totalPoints: 0,
      averagePoints: 0,
    };

    achievements.forEach(achievement => {
      // Đếm theo trạng thái
      if (achievement.status === AchievementStatus.ACTIVE) {
        stats.activeAchievements++;
      } else {
        stats.inactiveAchievements++;
      }

      // Đếm theo loại
      const type = achievement.type;
      stats.typeBreakdown[type] = (stats.typeBreakdown[type] || 0) + 1;

      // Đếm theo cấp độ
      const tier = achievement.tier;
      stats.tierBreakdown[tier] = (stats.tierBreakdown[tier] || 0) + 1;

      // Tính tổng điểm
      stats.totalPoints += achievement.points;
    });

    stats.averagePoints = achievements.length > 0 ? stats.totalPoints / achievements.length : 0;

    return stats;
  }

  /**
   * Kiểm tra tiến độ thành tích của người dùng
   */
  async checkUserProgress(userId: string, achievementId: string): Promise<UserAchievementProgress> {
    const achievement = await this.findOne(achievementId);
    
    // Lấy dữ liệu hoạt động của người dùng
    const userActivities = await this.activityService.findAll(userId, { page: 1, limit: 1000 });
    
    let currentValue = 0;
    let isCompleted = false;
    let completedAt: Date | undefined;

    // Tính toán tiến độ dựa trên loại thành tích
    const activities = userActivities.data;
    switch (achievement.type) {
      case AchievementType.DISTANCE:
        currentValue = activities.reduce((sum, activity) => sum + (activity.distance || 0), 0);
        break;
      case AchievementType.TIME:
        currentValue = activities.reduce((sum, activity) => sum + (activity.duration || 0), 0);
        break;
      case AchievementType.FREQUENCY:
        currentValue = activities.length;
        break;
      case AchievementType.STREAK:
        currentValue = this.calculateStreak(activities);
        break;
      case AchievementType.SPEED:
        currentValue = this.calculateAverageSpeed(activities);
        break;
      case AchievementType.ELEVATION:
        currentValue = activities.reduce((sum, activity) => sum + (activity.elevationGain || 0), 0);
        break;
      case AchievementType.CALORIES:
        currentValue = activities.reduce((sum, activity) => sum + (activity.calories || 0), 0);
        break;
      default:
        currentValue = 0;
    }

    // Kiểm tra hoàn thành
    if (achievement.targetValue && currentValue >= achievement.targetValue) {
      isCompleted = true;
      completedAt = new Date();
    }

    const progress = achievement.targetValue ? (currentValue / achievement.targetValue) * 100 : 0;

    return {
      achievementId: achievement.id,
      achievementCode: achievement.achievementCode,
      name: achievement.name,
      type: achievement.type,
      tier: achievement.tier,
      targetValue: achievement.targetValue || 0,
      currentValue,
      progress: Math.min(progress, 100),
      isCompleted,
      completedAt,
      points: achievement.points,
    };
  }

  /**
   * Lấy tất cả tiến độ thành tích của người dùng
   */
  async getUserProgress(userId: string): Promise<UserAchievementProgress[]> {
    const achievements = await this.achievementRepository.find({
      where: { status: AchievementStatus.ACTIVE, isDeleted: false },
    });

    const progressPromises = achievements.map(achievement => 
      this.checkUserProgress(userId, achievement.id)
    );

    return await Promise.all(progressPromises);
  }

  /**
   * Trao thành tích cho người dùng
   */
  async awardAchievement(awardDto: AwardAchievementDto): Promise<any> {
    const achievement = await this.findOne(awardDto.achievementId);
    const user = await this.userService.findOne(awardDto.userId);

    // Kiểm tra đã đạt thành tích chưa
    const progress = await this.checkUserProgress(awardDto.userId, awardDto.achievementId);
    
    if (!progress.isCompleted) {
      throw new BadRequestException('Người dùng chưa đạt điều kiện để nhận thành tích này');
    }

    // TODO: Implement user achievement tracking
    // Có thể tạo bảng user_achievements để lưu trữ thành tích đã đạt được

    return {
      message: 'Trao thành tích thành công',
      achievement: {
        id: achievement.id,
        name: achievement.name,
        tier: achievement.tier,
        points: achievement.points,
      },
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}` || user.email,
      },
      awardedAt: new Date(),
    };
  }

  /**
   * Tính chuỗi ngày chạy liên tiếp
   */
  private calculateStreak(activities: any[]): number {
    if (activities.length === 0) return 0;

    // Sắp xếp theo ngày giảm dần
    const sortedActivities = activities.sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const activity of sortedActivities) {
      const activityDate = new Date(activity.startTime);
      activityDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((currentDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === streak) {
        streak++;
        currentDate = activityDate;
      } else if (diffDays === streak + 1) {
        streak++;
        currentDate = activityDate;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Tính tốc độ trung bình
   */
  private calculateAverageSpeed(activities: any[]): number {
    if (activities.length === 0) return 0;

    const totalDistance = activities.reduce((sum, activity) => sum + (activity.distance || 0), 0);
    const totalTime = activities.reduce((sum, activity) => sum + (activity.duration || 0), 0);

    return totalTime > 0 ? (totalDistance / totalTime) * 3.6 : 0; // km/h
  }

  /**
   * Tìm kiếm thành tích
   */
  async search(query: string, limit: number = 10): Promise<Achievement[]> {
    return await this.achievementRepository
      .createQueryBuilder('achievement')
      .where('achievement.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('achievement.status = :status', { status: AchievementStatus.ACTIVE })
      .andWhere(
        '(achievement.name ILIKE :query OR achievement.description ILIKE :query OR achievement.tags @> :tags)',
        { query: `%${query}%`, tags: [query] }
      )
      .orderBy('achievement.points', 'DESC')
      .limit(limit)
      .getMany();
  }

  /**
   * Lấy thành tích theo tags
   */
  async findByTags(tags: string[]): Promise<Achievement[]> {
    return await this.achievementRepository
      .createQueryBuilder('achievement')
      .where('achievement.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('achievement.status = :status', { status: AchievementStatus.ACTIVE })
      .andWhere('achievement.tags && :tags', { tags })
      .orderBy('achievement.points', 'DESC')
      .getMany();
  }
}
