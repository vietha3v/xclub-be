import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
  Param,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AnalyticsService, DashboardStats, UserAnalytics, ClubAnalytics, SystemAnalytics, ReportData } from './analytics.service';

@ApiTags('📊 Phân tích dữ liệu')
@Controller('analytics')
@ApiBearerAuth('JWT-auth')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Lấy thống kê tổng quan dashboard
   */
  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  @ApiOperation({ 
    summary: 'Lấy thống kê tổng quan dashboard',
    description: 'Lấy thống kê tổng quan cho dashboard (chỉ admin/moderator)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Thống kê tổng quan dashboard',
    schema: {
      type: 'object',
      properties: {
        totalUsers: { type: 'number' },
        totalClubs: { type: 'number' },
        totalActivities: { type: 'number' },
        totalEvents: { type: 'number' },
        totalChallenges: { type: 'number' },
        totalRaces: { type: 'number' },
        totalAchievements: { type: 'number' },
        totalPayments: { type: 'number' },
        totalNotifications: { type: 'number' },
        totalRevenue: { type: 'number' },
        activeUsers: { type: 'number' },
        newUsersThisMonth: { type: 'number' },
        newClubsThisMonth: { type: 'number' },
        activitiesThisMonth: { type: 'number' },
        eventsThisMonth: { type: 'number' },
        challengesThisMonth: { type: 'number' },
        racesThisMonth: { type: 'number' },
        revenueThisMonth: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem thống kê' })
  async getDashboardStats(): Promise<DashboardStats> {
    return this.analyticsService.getDashboardStats();
  }

  /**
   * Lấy phân tích người dùng
   */
  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy phân tích người dùng',
    description: 'Lấy phân tích chi tiết về hoạt động của một người dùng'
  })
  @ApiParam({ name: 'userId', description: 'ID của người dùng' })
  @ApiQuery({ name: 'period', required: false, description: 'Khoảng thời gian (7d, 30d, 90d, 1y)', default: '30d' })
  @ApiResponse({ 
    status: 200, 
    description: 'Phân tích người dùng',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        totalActivities: { type: 'number' },
        totalDistance: { type: 'number' },
        totalTime: { type: 'number' },
        averagePace: { type: 'number' },
        averageSpeed: { type: 'number' },
        totalCalories: { type: 'number' },
        totalElevation: { type: 'number' },
        activitiesThisMonth: { type: 'number' },
        distanceThisMonth: { type: 'number' },
        timeThisMonth: { type: 'number' },
        achievements: { type: 'number' },
        challengesCompleted: { type: 'number' },
        eventsParticipated: { type: 'number' },
        racesParticipated: { type: 'number' },
        totalPayments: { type: 'number' },
        totalSpent: { type: 'number' },
        joinDate: { type: 'string', format: 'date-time' },
        lastActivityDate: { type: 'string', format: 'date-time' },
        activityTrend: { type: 'array' },
        performanceTrend: { type: 'array' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem phân tích người khác' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  async getUserAnalytics(
    @Param('userId') userId: string,
    @Query('period') period: string = '30d',
    @Req() req: any
  ): Promise<UserAnalytics> {
    // Kiểm tra quyền xem (chỉ xem phân tích của mình hoặc admin)
    if (userId !== req.user.userId && !req.user.roles || !req.user.roles.includes('admin')) {
      throw new ForbiddenException('Không có quyền xem phân tích của người khác');
    }
    
    return this.analyticsService.getUserAnalytics(userId, period);
  }

  /**
   * Lấy phân tích CLB
   */
  @Get('club/:clubId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy phân tích CLB',
    description: 'Lấy phân tích chi tiết về hoạt động của một CLB'
  })
  @ApiParam({ name: 'clubId', description: 'ID của CLB' })
  @ApiQuery({ name: 'period', required: false, description: 'Khoảng thời gian (7d, 30d, 90d, 1y)', default: '30d' })
  @ApiResponse({ 
    status: 200, 
    description: 'Phân tích CLB',
    schema: {
      type: 'object',
      properties: {
        clubId: { type: 'string' },
        totalMembers: { type: 'number' },
        totalActivities: { type: 'number' },
        totalDistance: { type: 'number' },
        totalTime: { type: 'number' },
        averageActivityPerMember: { type: 'number' },
        averageDistancePerMember: { type: 'number' },
        totalEvents: { type: 'number' },
        totalChallenges: { type: 'number' },
        totalRaces: { type: 'number' },
        eventsThisMonth: { type: 'number' },
        challengesThisMonth: { type: 'number' },
        racesThisMonth: { type: 'number' },
        activitiesThisMonth: { type: 'number' },
        distanceThisMonth: { type: 'number' },
        timeThisMonth: { type: 'number' },
        newMembersThisMonth: { type: 'number' },
        totalRevenue: { type: 'number' },
        revenueThisMonth: { type: 'number' },
        createdDate: { type: 'string', format: 'date-time' },
        memberTrend: { type: 'array' },
        activityTrend: { type: 'array' },
        eventTrend: { type: 'array' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy CLB' })
  async getClubAnalytics(
    @Param('clubId') clubId: string,
    @Query('period') period: string = '30d'
  ): Promise<ClubAnalytics> {
    return this.analyticsService.getClubAnalytics(clubId, period);
  }

  /**
   * Lấy phân tích hệ thống
   */
  @Get('system')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  @ApiOperation({ 
    summary: 'Lấy phân tích hệ thống',
    description: 'Lấy phân tích chi tiết về toàn bộ hệ thống (chỉ admin/moderator)'
  })
  @ApiQuery({ name: 'period', required: false, description: 'Khoảng thời gian (7d, 30d, 90d, 1y)', default: '30d' })
  @ApiResponse({ 
    status: 200, 
    description: 'Phân tích hệ thống',
    schema: {
      type: 'object',
      properties: {
        totalUsers: { type: 'number' },
        totalClubs: { type: 'number' },
        totalActivities: { type: 'number' },
        totalEvents: { type: 'number' },
        totalChallenges: { type: 'number' },
        totalRaces: { type: 'number' },
        totalAchievements: { type: 'number' },
        totalPayments: { type: 'number' },
        totalNotifications: { type: 'number' },
        totalRevenue: { type: 'number' },
        averageActivityPerUser: { type: 'number' },
        averageDistancePerUser: { type: 'number' },
        averageTimePerUser: { type: 'number' },
        userGrowthRate: { type: 'number' },
        clubGrowthRate: { type: 'number' },
        activityGrowthRate: { type: 'number' },
        revenueGrowthRate: { type: 'number' },
        topClubs: { type: 'array' },
        topUsers: { type: 'array' },
        userTrend: { type: 'array' },
        activityTrend: { type: 'array' },
        revenueTrend: { type: 'array' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem phân tích hệ thống' })
  async getSystemAnalytics(
    @Query('period') period: string = '30d'
  ): Promise<SystemAnalytics> {
    return this.analyticsService.getSystemAnalytics(period);
  }

  /**
   * Tạo báo cáo
   */
  @Get('report/:type')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  @ApiOperation({ 
    summary: 'Tạo báo cáo',
    description: 'Tạo báo cáo phân tích theo loại và khoảng thời gian (chỉ admin/moderator)'
  })
  @ApiParam({ name: 'type', description: 'Loại báo cáo (user, club, system)' })
  @ApiQuery({ name: 'period', required: false, description: 'Khoảng thời gian (7d, 30d, 90d, 1y)', default: '30d' })
  @ApiQuery({ name: 'userId', required: false, description: 'ID người dùng (cho báo cáo user)' })
  @ApiQuery({ name: 'clubId', required: false, description: 'ID CLB (cho báo cáo club)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Báo cáo phân tích',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        type: { type: 'string' },
        period: { type: 'string' },
        generatedAt: { type: 'string', format: 'date-time' },
        data: { type: 'object' },
        summary: { type: 'object' },
        charts: { type: 'array' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Loại báo cáo không được hỗ trợ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền tạo báo cáo' })
  async generateReport(
    @Param('type') type: string,
    @Query('period') period: string = '30d',
    @Query('userId') userId?: string,
    @Query('clubId') clubId?: string
  ): Promise<ReportData> {
    const filters: any = {};
    if (userId) filters.userId = userId;
    if (clubId) filters.clubId = clubId;
    
    return this.analyticsService.generateReport(type, period, filters);
  }

  /**
   * Lấy phân tích cá nhân (cho user hiện tại)
   */
  @Get('my-analytics')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy phân tích cá nhân',
    description: 'Lấy phân tích chi tiết về hoạt động của người dùng hiện tại'
  })
  @ApiQuery({ name: 'period', required: false, description: 'Khoảng thời gian (7d, 30d, 90d, 1y)', default: '30d' })
  @ApiResponse({ 
    status: 200, 
    description: 'Phân tích cá nhân',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        totalActivities: { type: 'number' },
        totalDistance: { type: 'number' },
        totalTime: { type: 'number' },
        averagePace: { type: 'number' },
        averageSpeed: { type: 'number' },
        totalCalories: { type: 'number' },
        totalElevation: { type: 'number' },
        activitiesThisMonth: { type: 'number' },
        distanceThisMonth: { type: 'number' },
        timeThisMonth: { type: 'number' },
        achievements: { type: 'number' },
        challengesCompleted: { type: 'number' },
        eventsParticipated: { type: 'number' },
        racesParticipated: { type: 'number' },
        totalPayments: { type: 'number' },
        totalSpent: { type: 'number' },
        joinDate: { type: 'string', format: 'date-time' },
        lastActivityDate: { type: 'string', format: 'date-time' },
        activityTrend: { type: 'array' },
        performanceTrend: { type: 'array' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async getMyAnalytics(
    @Query('period') period: string = '30d',
    @Req() req: any
  ): Promise<UserAnalytics> {
    return this.analyticsService.getUserAnalytics(req.user.userId, period);
  }
}
