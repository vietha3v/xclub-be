import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChallengeTeamLeaderboard } from '../entities/challenge-team-leaderboard.entity';
import { ChallengeTeam } from '../entities/challenge-team.entity';
import { Challenge, ChallengeStatus } from '../entities/challenge.entity';

@Injectable()
export class ChallengeTeamLeaderboardService {
  private readonly logger = new Logger(ChallengeTeamLeaderboardService.name);

  constructor(
    @InjectRepository(ChallengeTeamLeaderboard)
    private leaderboardRepository: Repository<ChallengeTeamLeaderboard>,
    @InjectRepository(ChallengeTeam)
    private teamRepository: Repository<ChallengeTeam>,
    @InjectRepository(Challenge)
    private challengeRepository: Repository<Challenge>,
  ) {}

  /**
   * Cập nhật bảng xếp hạng team cho một thử thách
   */
  async updateTeamLeaderboard(challengeId: string): Promise<void> {
    try {
      this.logger.log(`Bắt đầu cập nhật bảng xếp hạng team cho challenge: ${challengeId}`);

      // Lấy tất cả teams còn hoạt động
      const teams = await this.teamRepository.find({
        where: { challengeId, isDeleted: false },
        order: { totalDistance: 'DESC', createdAt: 'ASC' }
      });

      // Xóa bảng xếp hạng cũ
      await this.leaderboardRepository.delete({ challengeId });

      // Tạo bảng xếp hạng mới
      const leaderboardEntries = teams.map((team, index) => {
        const rank = index + 1;
        const averageDistance = team.memberCount > 0 ? team.totalDistance / team.memberCount : 0;
        
        return this.leaderboardRepository.create({
          challengeId,
          rank,
          teamId: team.id,
          totalDistance: team.totalDistance,
          memberCount: team.memberCount,
          averageDistance,
          lastUpdatedAt: new Date(),
        });
      });

      // Lưu bảng xếp hạng mới
      if (leaderboardEntries.length > 0) {
        await this.leaderboardRepository.save(leaderboardEntries);
      }

      this.logger.log(`Cập nhật bảng xếp hạng team thành công cho challenge: ${challengeId}, ${leaderboardEntries.length} teams`);
    } catch (error) {
      this.logger.error(`Lỗi cập nhật bảng xếp hạng team cho challenge: ${challengeId}`, error.stack);
      throw error;
    }
  }

  /**
   * Lấy bảng xếp hạng team của một thử thách
   */
  async getTeamLeaderboard(challengeId: string, limit: number = 50): Promise<ChallengeTeamLeaderboard[]> {
    return await this.leaderboardRepository.find({
      where: { challengeId, isDeleted: false },
      relations: ['team'],
      order: { rank: 'ASC' },
      take: limit
    });
  }

  /**
   * Lấy xếp hạng của một team trong thử thách
   */
  async getTeamRank(challengeId: string, teamId: string): Promise<ChallengeTeamLeaderboard | null> {
    return await this.leaderboardRepository.findOne({
      where: { challengeId, teamId, isDeleted: false },
      relations: ['team']
    });
  }

  /**
   * Lấy top teams có điểm cao nhất
   */
  async getTopTeams(challengeId: string, limit: number = 10): Promise<ChallengeTeamLeaderboard[]> {
    return await this.leaderboardRepository.find({
      where: { challengeId, isDeleted: false },
      relations: ['team'],
      order: { totalDistance: 'DESC', rank: 'ASC' },
      take: limit
    });
  }

  /**
   * Cập nhật bảng xếp hạng team cho tất cả thử thách đang hoạt động
   */
  async updateAllActiveTeamChallenges(): Promise<void> {
    try {
      this.logger.log('Bắt đầu cập nhật bảng xếp hạng team cho tất cả thử thách đang hoạt động');

      const activeChallenges = await this.challengeRepository.find({
        where: { status: ChallengeStatus.ACTIVE, isDeleted: false }
      });

      for (const challenge of activeChallenges) {
        try {
          await this.updateTeamLeaderboard(challenge.id);
        } catch (error) {
          this.logger.error(`Lỗi cập nhật bảng xếp hạng team cho challenge: ${challenge.id}`, error.stack);
          // Tiếp tục với challenge tiếp theo
        }
      }

      this.logger.log(`Hoàn thành cập nhật bảng xếp hạng team cho ${activeChallenges.length} thử thách`);
    } catch (error) {
      this.logger.error('Lỗi cập nhật bảng xếp hạng team cho tất cả thử thách', error.stack);
      throw error;
    }
  }

  /**
   * Cập nhật bảng xếp hạng team cho một team cụ thể
   */
  async updateTeamRank(challengeId: string, teamId: string): Promise<void> {
    try {
      // Cập nhật bảng xếp hạng cho toàn bộ challenge
      await this.updateTeamLeaderboard(challengeId);
    } catch (error) {
      this.logger.error(`Lỗi cập nhật xếp hạng team: ${teamId} trong challenge: ${challengeId}`, error.stack);
      throw error;
    }
  }

  /**
   * Lấy thống kê bảng xếp hạng team
   */
  async getTeamLeaderboardStats(challengeId: string): Promise<{
    totalTeams: number;
    averageDistance: number;
    highestDistance: number;
    lowestDistance: number;
  }> {
    const leaderboard = await this.getTeamLeaderboard(challengeId, 1000);
    
    if (leaderboard.length === 0) {
      return {
        totalTeams: 0,
        averageDistance: 0,
        highestDistance: 0,
        lowestDistance: 0
      };
    }

    const distances = leaderboard.map(entry => Number(entry.totalDistance));
    const totalDistance = distances.reduce((sum, distance) => sum + distance, 0);
    const averageDistance = totalDistance / distances.length;

    return {
      totalTeams: leaderboard.length,
      averageDistance: Math.round(averageDistance * 100) / 100,
      highestDistance: Math.max(...distances),
      lowestDistance: Math.min(...distances)
    };
  }
}
