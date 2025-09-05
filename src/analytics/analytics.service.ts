import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ClubService } from '../club/club.service';
import { ActivityService } from '../activity/activity.service';
import { EventService } from '../event/event.service';
import { ChallengeService } from '../challenge/challenge.service';
import { RaceService } from '../race/race.service';
import { AchievementService } from '../achievement/achievement.service';
import { PaymentService } from '../payment/payment.service';
import { NotificationService } from '../notification/notification.service';

export interface DashboardStats {
  totalUsers: number;
  totalClubs: number;
  totalActivities: number;
  totalEvents: number;
  totalChallenges: number;
  totalRaces: number;
  totalAchievements: number;
  totalPayments: number;
  totalNotifications: number;
  totalRevenue: number;
  activeUsers: number;
  newUsersThisMonth: number;
  newClubsThisMonth: number;
  activitiesThisMonth: number;
  eventsThisMonth: number;
  challengesThisMonth: number;
  racesThisMonth: number;
  revenueThisMonth: number;
}

export interface UserAnalytics {
  userId: string;
  totalActivities: number;
  totalDistance: number;
  totalTime: number;
  averagePace: number;
  averageSpeed: number;
  totalCalories: number;
  totalElevation: number;
  activitiesThisMonth: number;
  distanceThisMonth: number;
  timeThisMonth: number;
  achievements: number;
  challengesCompleted: number;
  eventsParticipated: number;
  racesParticipated: number;
  totalPayments: number;
  totalSpent: number;
  joinDate: Date;
  lastActivityDate: Date;
  activityTrend: Array<{ date: string; count: number; distance: number }>;
  performanceTrend: Array<{ date: string; pace: number; speed: number }>;
}

export interface ClubAnalytics {
  clubId: string;
  totalMembers: number;
  totalActivities: number;
  totalDistance: number;
  totalTime: number;
  averageActivityPerMember: number;
  averageDistancePerMember: number;
  totalEvents: number;
  totalChallenges: number;
  totalRaces: number;
  eventsThisMonth: number;
  challengesThisMonth: number;
  racesThisMonth: number;
  activitiesThisMonth: number;
  distanceThisMonth: number;
  timeThisMonth: number;
  newMembersThisMonth: number;
  totalRevenue: number;
  revenueThisMonth: number;
  createdDate: Date;
  memberTrend: Array<{ date: string; count: number }>;
  activityTrend: Array<{ date: string; count: number; distance: number }>;
  eventTrend: Array<{ date: string; count: number; participants: number }>;
}

export interface SystemAnalytics {
  totalUsers: number;
  totalClubs: number;
  totalActivities: number;
  totalEvents: number;
  totalChallenges: number;
  totalRaces: number;
  totalAchievements: number;
  totalPayments: number;
  totalNotifications: number;
  totalRevenue: number;
  averageActivityPerUser: number;
  averageDistancePerUser: number;
  averageTimePerUser: number;
  userGrowthRate: number;
  clubGrowthRate: number;
  activityGrowthRate: number;
  revenueGrowthRate: number;
  topClubs: Array<{ clubId: string; name: string; members: number; activities: number }>;
  topUsers: Array<{ userId: string; name: string; activities: number; distance: number }>;
  userTrend: Array<{ date: string; count: number }>;
  activityTrend: Array<{ date: string; count: number; distance: number }>;
  revenueTrend: Array<{ date: string; amount: number }>;
}

export interface ReportData {
  title: string;
  type: string;
  period: string;
  generatedAt: Date;
  data: any;
  summary: any;
  charts: Array<{ type: string; title: string; data: any }>;
}

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly userService: UserService,
    private readonly clubService: ClubService,
    private readonly activityService: ActivityService,
    private readonly eventService: EventService,
    private readonly challengeService: ChallengeService,
    private readonly raceService: RaceService,
    private readonly achievementService: AchievementService,
    private readonly paymentService: PaymentService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Lấy thống kê tổng quan dashboard
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Lấy thống kê tổng quan
    const [
      totalUsers,
      totalClubs,
      totalActivities,
      totalEvents,
      totalChallenges,
      totalRaces,
      totalAchievements,
      totalPayments,
      totalNotifications,
      paymentStats,
    ] = await Promise.all([
      this.userService.getStats(),
      this.clubService.getStats(),
      Promise.resolve({ total: 0 }),
      Promise.resolve({ total: 0 }),
      this.challengeService.getStats(),
      Promise.resolve({ total: 0 }),
      this.achievementService.getStats(),
      this.paymentService.getStats(),
      this.notificationService.getStats(),
      this.paymentService.getStats(),
    ]);

    // Lấy thống kê tháng này
    const [
      newUsersThisMonth,
      newClubsThisMonth,
      activitiesThisMonth,
      eventsThisMonth,
      challengesThisMonth,
      racesThisMonth,
      revenueThisMonth,
    ] = await Promise.all([
      this.getNewUsersCount(startOfMonth, now),
      this.getNewClubsCount(startOfMonth, now),
      this.getActivitiesCount(startOfMonth, now),
      this.getEventsCount(startOfMonth, now),
      this.getChallengesCount(startOfMonth, now),
      this.getRacesCount(startOfMonth, now),
      this.getRevenueCount(startOfMonth, now),
    ]);

    // Lấy số người dùng hoạt động (có hoạt động trong 30 ngày qua)
    const activeUsers = await this.getActiveUsersCount(30);

    return {
      totalUsers: totalUsers.totalUsers,
      totalClubs: totalClubs.totalClubs,
      totalActivities: totalActivities.total,
      totalEvents: totalEvents.total,
      totalChallenges: totalChallenges.totalChallenges,
      totalRaces: totalRaces.total,
      totalAchievements: totalAchievements.totalAchievements,
      totalPayments: totalPayments.totalPayments,
      totalNotifications: totalNotifications.totalNotifications,
      totalRevenue: paymentStats.totalRevenue,
      activeUsers,
      newUsersThisMonth,
      newClubsThisMonth,
      activitiesThisMonth,
      eventsThisMonth,
      challengesThisMonth,
      racesThisMonth,
      revenueThisMonth,
    };
  }

  /**
   * Lấy phân tích người dùng
   */
  async getUserAnalytics(userId: string, period: string = '30d'): Promise<UserAnalytics> {
    const user = await this.userService.findOne(userId);
    const now = new Date();
    const startDate = this.getStartDate(period, now);

    // Lấy thống kê hoạt động
    const [
      totalActivities,
      totalDistance,
      totalTime,
      averagePace,
      averageSpeed,
      totalCalories,
      totalElevation,
      activitiesThisMonth,
      distanceThisMonth,
      timeThisMonth,
      achievements,
      challengesCompleted,
      eventsParticipated,
      racesParticipated,
      totalPayments,
      totalSpent,
    ] = await Promise.all([
      this.getUserActivitiesCount(userId),
      this.getUserTotalDistance(userId),
      this.getUserTotalTime(userId),
      this.getUserAveragePace(userId),
      this.getUserAverageSpeed(userId),
      this.getUserTotalCalories(userId),
      this.getUserTotalElevation(userId),
      this.getUserActivitiesCount(userId, startDate, now),
      this.getUserTotalDistance(userId, startDate, now),
      this.getUserTotalTime(userId, startDate, now),
      this.getUserAchievementsCount(userId),
      this.getUserChallengesCompletedCount(userId),
      this.getUserEventsParticipatedCount(userId),
      this.getUserRacesParticipatedCount(userId),
      this.getUserPaymentsCount(userId),
      this.getUserTotalSpent(userId),
    ]);

    // Lấy xu hướng hoạt động
    const activityTrend = await this.getUserActivityTrend(userId, period);
    const performanceTrend = await this.getUserPerformanceTrend(userId, period);

    // Lấy ngày hoạt động cuối cùng
    const lastActivityDate = await this.getUserLastActivityDate(userId);

    return {
      userId,
      totalActivities,
      totalDistance,
      totalTime,
      averagePace,
      averageSpeed,
      totalCalories,
      totalElevation,
      activitiesThisMonth,
      distanceThisMonth,
      timeThisMonth,
      achievements,
      challengesCompleted,
      eventsParticipated,
      racesParticipated,
      totalPayments,
      totalSpent,
      joinDate: user.createdAt,
      lastActivityDate,
      activityTrend,
      performanceTrend,
    };
  }

  /**
   * Lấy phân tích CLB
   */
  async getClubAnalytics(clubId: string, period: string = '30d'): Promise<ClubAnalytics> {
    const club = await this.clubService.findOne(clubId);
    const now = new Date();
    const startDate = this.getStartDate(period, now);

    // Lấy thống kê CLB
    const [
      totalMembers,
      totalActivities,
      totalDistance,
      totalTime,
      totalEvents,
      totalChallenges,
      totalRaces,
      eventsThisMonth,
      challengesThisMonth,
      racesThisMonth,
      activitiesThisMonth,
      distanceThisMonth,
      timeThisMonth,
      newMembersThisMonth,
      totalRevenue,
      revenueThisMonth,
    ] = await Promise.all([
      this.getClubMembersCount(clubId),
      this.getClubActivitiesCount(clubId),
      this.getClubTotalDistance(clubId),
      this.getClubTotalTime(clubId),
      this.getClubEventsCount(clubId),
      this.getClubChallengesCount(clubId),
      this.getClubRacesCount(clubId),
      this.getClubEventsCount(clubId, startDate, now),
      this.getClubChallengesCount(clubId, startDate, now),
      this.getClubRacesCount(clubId, startDate, now),
      this.getClubActivitiesCount(clubId, startDate, now),
      this.getClubTotalDistance(clubId, startDate, now),
      this.getClubTotalTime(clubId, startDate, now),
      this.getClubNewMembersCount(clubId, startDate, now),
      this.getClubTotalRevenue(clubId),
      this.getClubRevenueCount(clubId, startDate, now),
    ]);

    // Tính trung bình
    const averageActivityPerMember = totalMembers > 0 ? totalActivities / totalMembers : 0;
    const averageDistancePerMember = totalMembers > 0 ? totalDistance / totalMembers : 0;

    // Lấy xu hướng
    const memberTrend = await this.getClubMemberTrend(clubId, period);
    const activityTrend = await this.getClubActivityTrend(clubId, period);
    const eventTrend = await this.getClubEventTrend(clubId, period);

    return {
      clubId,
      totalMembers,
      totalActivities,
      totalDistance,
      totalTime,
      averageActivityPerMember,
      averageDistancePerMember,
      totalEvents,
      totalChallenges,
      totalRaces,
      eventsThisMonth,
      challengesThisMonth,
      racesThisMonth,
      activitiesThisMonth,
      distanceThisMonth,
      timeThisMonth,
      newMembersThisMonth,
      totalRevenue,
      revenueThisMonth,
      createdDate: club.createdAt,
      memberTrend,
      activityTrend,
      eventTrend,
    };
  }

  /**
   * Lấy phân tích hệ thống
   */
  async getSystemAnalytics(period: string = '30d'): Promise<SystemAnalytics> {
    const now = new Date();
    const startDate = this.getStartDate(period, now);
    const previousStartDate = this.getStartDate(period, startDate);

    // Lấy thống kê tổng quan
    const [
      totalUsers,
      totalClubs,
      totalActivities,
      totalEvents,
      totalChallenges,
      totalRaces,
      totalAchievements,
      totalPayments,
      totalNotifications,
      paymentStats,
    ] = await Promise.all([
      this.userService.getStats(),
      this.clubService.getStats(),
      Promise.resolve({ total: 0 }),
      Promise.resolve({ total: 0 }),
      this.challengeService.getStats(),
      Promise.resolve({ total: 0 }),
      this.achievementService.getStats(),
      this.paymentService.getStats(),
      this.notificationService.getStats(),
      this.paymentService.getStats(),
    ]);

    // Tính trung bình
    const averageActivityPerUser = totalUsers.totalUsers > 0 ? totalActivities.total / totalUsers.totalUsers : 0;
    const averageDistancePerUser = totalUsers.totalUsers > 0 ? 0 / totalUsers.totalUsers : 0; // TODO: Implement totalDistance
    const averageTimePerUser = totalUsers.totalUsers > 0 ? 0 / totalUsers.totalUsers : 0; // TODO: Implement totalTime

    // Tính tỷ lệ tăng trưởng
    const [
      previousUsers,
      previousClubs,
      previousActivities,
      previousRevenue,
    ] = await Promise.all([
      this.getNewUsersCount(previousStartDate, startDate),
      this.getNewClubsCount(previousStartDate, startDate),
      this.getActivitiesCount(previousStartDate, startDate),
      this.getRevenueCount(previousStartDate, startDate),
    ]);

    const userGrowthRate = previousUsers > 0 ? ((totalUsers.totalUsers - previousUsers) / previousUsers) * 100 : 0;
    const clubGrowthRate = previousClubs > 0 ? ((totalClubs.totalClubs - previousClubs) / previousClubs) * 100 : 0;
    const activityGrowthRate = previousActivities > 0 ? ((totalActivities.total - previousActivities) / previousActivities) * 100 : 0;
    const revenueGrowthRate = previousRevenue > 0 ? ((paymentStats.totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    // Lấy top CLB và người dùng
    const topClubs = await this.getTopClubs(10);
    const topUsers = await this.getTopUsers(10);

    // Lấy xu hướng
    const userTrend = await this.getUserTrend(period);
    const activityTrend = await this.getActivityTrend(period);
    const revenueTrend = await this.getRevenueTrend(period);

    return {
      totalUsers: totalUsers.totalUsers,
      totalClubs: totalClubs.totalClubs,
      totalActivities: totalActivities.total,
      totalEvents: totalEvents.total,
      totalChallenges: totalChallenges.totalChallenges,
      totalRaces: totalRaces.total,
      totalAchievements: totalAchievements.totalAchievements,
      totalPayments: totalPayments.totalPayments,
      totalNotifications: totalNotifications.totalNotifications,
      totalRevenue: paymentStats.totalRevenue,
      averageActivityPerUser,
      averageDistancePerUser,
      averageTimePerUser,
      userGrowthRate,
      clubGrowthRate,
      activityGrowthRate,
      revenueGrowthRate,
      topClubs,
      topUsers,
      userTrend,
      activityTrend,
      revenueTrend,
    };
  }

  /**
   * Tạo báo cáo
   */
  async generateReport(type: string, period: string, filters: any = {}): Promise<ReportData> {
    const now = new Date();
    const startDate = this.getStartDate(period, now);
    const endDate = now;

    let data: any;
    let summary: any;
    let charts: Array<{ type: string; title: string; data: any }> = [];

    switch (type) {
      case 'user':
        data = await this.getUserAnalytics(filters.userId, period);
        summary = {
          totalActivities: data.totalActivities,
          totalDistance: data.totalDistance,
          totalTime: data.totalTime,
          achievements: data.achievements,
        };
        charts = [
          { type: 'line', title: 'Hoạt động theo thời gian', data: data.activityTrend },
          { type: 'line', title: 'Hiệu suất theo thời gian', data: data.performanceTrend },
        ];
        break;

      case 'club':
        data = await this.getClubAnalytics(filters.clubId, period);
        summary = {
          totalMembers: data.totalMembers,
          totalActivities: data.totalActivities,
          totalDistance: data.totalDistance,
          totalEvents: data.totalEvents,
        };
        charts = [
          { type: 'line', title: 'Thành viên theo thời gian', data: data.memberTrend },
          { type: 'line', title: 'Hoạt động theo thời gian', data: data.activityTrend },
          { type: 'line', title: 'Sự kiện theo thời gian', data: data.eventTrend },
        ];
        break;

      case 'system':
        data = await this.getSystemAnalytics(period);
        summary = {
          totalUsers: data.totalUsers,
          totalClubs: data.totalClubs,
          totalActivities: data.totalActivities,
          totalRevenue: data.totalRevenue,
        };
        charts = [
          { type: 'line', title: 'Người dùng theo thời gian', data: data.userTrend },
          { type: 'line', title: 'Hoạt động theo thời gian', data: data.activityTrend },
          { type: 'line', title: 'Doanh thu theo thời gian', data: data.revenueTrend },
        ];
        break;

      default:
        throw new Error('Loại báo cáo không được hỗ trợ');
    }

    return {
      title: `Báo cáo ${type} - ${period}`,
      type,
      period,
      generatedAt: now,
      data,
      summary,
      charts,
    };
  }

  // Helper methods
  private getStartDate(period: string, endDate: Date): Date {
    const start = new Date(endDate);
    switch (period) {
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
      case '90d':
        start.setDate(start.getDate() - 90);
        break;
      case '1y':
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start.setDate(start.getDate() - 30);
    }
    return start;
  }

  // Placeholder methods - cần implement thực tế
  private async getNewUsersCount(startDate: Date, endDate: Date): Promise<number> {
    // TODO: Implement actual query
    return 0;
  }

  private async getNewClubsCount(startDate: Date, endDate: Date): Promise<number> {
    // TODO: Implement actual query
    return 0;
  }

  private async getActivitiesCount(startDate?: Date, endDate?: Date): Promise<number> {
    // TODO: Implement actual query
    return 0;
  }

  private async getEventsCount(startDate?: Date, endDate?: Date): Promise<number> {
    // TODO: Implement actual query
    return 0;
  }

  private async getChallengesCount(startDate?: Date, endDate?: Date): Promise<number> {
    // TODO: Implement actual query
    return 0;
  }

  private async getRacesCount(startDate?: Date, endDate?: Date): Promise<number> {
    // TODO: Implement actual query
    return 0;
  }

  private async getRevenueCount(startDate: Date, endDate: Date): Promise<number> {
    // TODO: Implement actual query
    return 0;
  }

  private async getActiveUsersCount(days: number): Promise<number> {
    // TODO: Implement actual query
    return 0;
  }

  // User analytics methods
  private async getUserActivitiesCount(userId: string, startDate?: Date, endDate?: Date): Promise<number> {
    // TODO: Implement actual query
    return 0;
  }

  private async getUserTotalDistance(userId: string, startDate?: Date, endDate?: Date): Promise<number> {
    // TODO: Implement actual query
    return 0;
  }

  private async getUserTotalTime(userId: string, startDate?: Date, endDate?: Date): Promise<number> {
    // TODO: Implement actual query
    return 0;
  }

  private async getUserAveragePace(userId: string): Promise<number> {
    // TODO: Implement actual query
    return 0;
  }

  private async getUserAverageSpeed(userId: string): Promise<number> {
    // TODO: Implement actual query
    return 0;
  }

  private async getUserTotalCalories(userId: string): Promise<number> {
    // TODO: Implement actual query
    return 0;
  }

  private async getUserTotalElevation(userId: string): Promise<number> {
    // TODO: Implement actual query
    return 0;
  }

  private async getUserAchievementsCount(userId: string): Promise<number> {
    // TODO: Implement actual query
    return 0;
  }

  private async getUserChallengesCompletedCount(userId: string): Promise<number> {
    // TODO: Implement actual query
    return 0;
  }

  private async getUserEventsParticipatedCount(userId: string): Promise<number> {
    // TODO: Implement actual query
    return 0;
  }

  private async getUserRacesParticipatedCount(userId: string): Promise<number> {
    // TODO: Implement actual query
    return 0;
  }

  private async getUserPaymentsCount(userId: string): Promise<number> {
    // TODO: Implement actual query
    return 0;
  }

  private async getUserTotalSpent(userId: string): Promise<number> {
    // TODO: Implement actual query
    return 0;
  }

  private async getUserActivityTrend(userId: string, period: string): Promise<Array<{ date: string; count: number; distance: number }>> {
    // TODO: Implement actual query
    return [];
  }

  private async getUserPerformanceTrend(userId: string, period: string): Promise<Array<{ date: string; pace: number; speed: number }>> {
    // TODO: Implement actual query
    return [];
  }

  private async getUserLastActivityDate(userId: string): Promise<Date> {
    // TODO: Implement actual query
    return new Date();
  }

  // Club analytics methods
  private async getClubMembersCount(clubId: string): Promise<number> {
    // TODO: Implement actual query
    return 0;
  }

  private async getClubActivitiesCount(clubId: string, startDate?: Date, endDate?: Date): Promise<number> {
    // TODO: Implement actual query
    return 0;
  }

  private async getClubTotalDistance(clubId: string, startDate?: Date, endDate?: Date): Promise<number> {
    // TODO: Implement actual query
    return 0;
  }

  private async getClubTotalTime(clubId: string, startDate?: Date, endDate?: Date): Promise<number> {
    // TODO: Implement actual query
    return 0;
  }

  private async getClubEventsCount(clubId: string, startDate?: Date, endDate?: Date): Promise<number> {
    // TODO: Implement actual query
    return 0;
  }

  private async getClubChallengesCount(clubId: string, startDate?: Date, endDate?: Date): Promise<number> {
    // TODO: Implement actual query
    return 0;
  }

  private async getClubRacesCount(clubId: string, startDate?: Date, endDate?: Date): Promise<number> {
    // TODO: Implement actual query
    return 0;
  }

  private async getClubNewMembersCount(clubId: string, startDate: Date, endDate: Date): Promise<number> {
    // TODO: Implement actual query
    return 0;
  }

  private async getClubTotalRevenue(clubId: string): Promise<number> {
    // TODO: Implement actual query
    return 0;
  }

  private async getClubRevenueCount(clubId: string, startDate: Date, endDate: Date): Promise<number> {
    // TODO: Implement actual query
    return 0;
  }

  private async getClubMemberTrend(clubId: string, period: string): Promise<Array<{ date: string; count: number }>> {
    // TODO: Implement actual query
    return [];
  }

  private async getClubActivityTrend(clubId: string, period: string): Promise<Array<{ date: string; count: number; distance: number }>> {
    // TODO: Implement actual query
    return [];
  }

  private async getClubEventTrend(clubId: string, period: string): Promise<Array<{ date: string; count: number; participants: number }>> {
    // TODO: Implement actual query
    return [];
  }

  // System analytics methods
  private async getTopClubs(limit: number): Promise<Array<{ clubId: string; name: string; members: number; activities: number }>> {
    // TODO: Implement actual query
    return [];
  }

  private async getTopUsers(limit: number): Promise<Array<{ userId: string; name: string; activities: number; distance: number }>> {
    // TODO: Implement actual query
    return [];
  }

  private async getUserTrend(period: string): Promise<Array<{ date: string; count: number }>> {
    // TODO: Implement actual query
    return [];
  }

  private async getActivityTrend(period: string): Promise<Array<{ date: string; count: number; distance: number }>> {
    // TODO: Implement actual query
    return [];
  }

  private async getRevenueTrend(period: string): Promise<Array<{ date: string; amount: number }>> {
    // TODO: Implement actual query
    return [];
  }
}
