import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChallengeLeaderboard } from '../entities/challenge-leaderboard.entity';
import { ChallengeParticipant, ParticipantStatus } from '../entities/challenge-participant.entity';
import { Challenge, ChallengeStatus } from '../entities/challenge.entity';

@Injectable()
export class ChallengeLeaderboardService {
  private readonly logger = new Logger(ChallengeLeaderboardService.name);

  constructor(
    @InjectRepository(ChallengeLeaderboard)
    private leaderboardRepository: Repository<ChallengeLeaderboard>,
    @InjectRepository(ChallengeParticipant)
    private participantRepository: Repository<ChallengeParticipant>,
    @InjectRepository(Challenge)
    private challengeRepository: Repository<Challenge>,
  ) {}

  /**
   * Cập nhật bảng xếp hạng cho một thử thách
   * Được gọi khi có thay đổi tiến độ hoặc tham gia/rời thử thách
   */
  async updateLeaderboard(challengeId: string): Promise<void> {
    try {
      this.logger.log(`Bắt đầu cập nhật bảng xếp hạng cho challenge: ${challengeId}`);

      // Lấy tất cả người tham gia còn hoạt động
      const participants = await this.participantRepository.find({
        where: { challengeId, isDeleted: false },
        order: { currentProgress: 'DESC', joinedAt: 'ASC' }
      });

      // Xóa bảng xếp hạng cũ
      await this.leaderboardRepository.delete({ challengeId });

      // Tạo bảng xếp hạng mới
      const leaderboardEntries = participants.map((participant, index) => {
        const rank = index + 1;
        const score = this.calculateScore(participant);
        
        return this.leaderboardRepository.create({
          challengeId,
          rank,
          userId: participant.userId,
          score,
          progress: participant.currentProgress,
          streak: participant.currentStreak,
          completionTime: participant.completionTime,
          lastUpdatedAt: new Date(),
        });
      });

      // Lưu bảng xếp hạng mới
      if (leaderboardEntries.length > 0) {
        await this.leaderboardRepository.save(leaderboardEntries);
      }

      this.logger.log(`Cập nhật bảng xếp hạng thành công cho challenge: ${challengeId}, ${leaderboardEntries.length} người tham gia`);
    } catch (error) {
      this.logger.error(`Lỗi cập nhật bảng xếp hạng cho challenge: ${challengeId}`, error.stack);
      throw error;
    }
  }

  /**
   * Lấy bảng xếp hạng của một thử thách
   * Truy vấn nhanh từ bảng đã được tính toán sẵn
   */
  async getLeaderboard(challengeId: string, limit: number = 50): Promise<ChallengeLeaderboard[]> {
    return await this.leaderboardRepository.find({
      where: { challengeId, isDeleted: false },
      order: { rank: 'ASC' },
      take: limit
    });
  }

  /**
   * Lấy xếp hạng của một người dùng trong thử thách
   */
  async getUserRank(challengeId: string, userId: string): Promise<ChallengeLeaderboard | null> {
    return await this.leaderboardRepository.findOne({
      where: { challengeId, userId, isDeleted: false }
    });
  }

  /**
   * Lấy top 10 người dùng có điểm cao nhất
   */
  async getTopUsers(challengeId: string, limit: number = 10): Promise<ChallengeLeaderboard[]> {
    return await this.leaderboardRepository.find({
      where: { challengeId, isDeleted: false },
      order: { score: 'DESC', rank: 'ASC' },
      take: limit
    });
  }

  /**
   * Cập nhật bảng xếp hạng cho tất cả thử thách đang hoạt động
   * Được gọi bởi cron job định kỳ
   */
  async updateAllActiveChallenges(): Promise<void> {
    try {
      this.logger.log('Bắt đầu cập nhật bảng xếp hạng cho tất cả thử thách đang hoạt động');

      const activeChallenges = await this.challengeRepository.find({
        where: { status: ChallengeStatus.ACTIVE, isDeleted: false }
      });

      for (const challenge of activeChallenges) {
        try {
          await this.updateLeaderboard(challenge.id);
        } catch (error) {
          this.logger.error(`Lỗi cập nhật bảng xếp hạng cho challenge: ${challenge.id}`, error.stack);
          // Tiếp tục với challenge tiếp theo
        }
      }

      this.logger.log(`Hoàn thành cập nhật bảng xếp hạng cho ${activeChallenges.length} thử thách`);
    } catch (error) {
      this.logger.error('Lỗi cập nhật bảng xếp hạng cho tất cả thử thách', error.stack);
      throw error;
    }
  }

  /**
   * Cập nhật bảng xếp hạng cho một người dùng cụ thể
   * Được gọi khi người dùng cập nhật tiến độ
   */
  async updateUserRank(challengeId: string, userId: string): Promise<void> {
    try {
      // Cập nhật bảng xếp hạng cho toàn bộ challenge
      await this.updateLeaderboard(challengeId);
    } catch (error) {
      this.logger.error(`Lỗi cập nhật xếp hạng cho user: ${userId} trong challenge: ${challengeId}`, error.stack);
      throw error;
    }
  }

  /**
   * Tính điểm cho người tham gia
   */
  private calculateScore(participant: ChallengeParticipant): number {
    let score = 0;

    // Điểm cơ bản từ tiến độ
    score += participant.currentProgress * 10;

    // Bonus cho chuỗi liên tiếp
    score += participant.currentStreak * 50;

    // Bonus cho hoàn thành
    if (participant.status === ParticipantStatus.COMPLETED) {
      score += 1000;
      
      // Bonus thời gian hoàn thành
      if (participant.completionTime) {
        score += Math.max(0, 500 - participant.completionTime);
      }
    }

    return score;
  }

  /**
   * Lấy thống kê bảng xếp hạng
   */
  async getLeaderboardStats(challengeId: string): Promise<{
    totalParticipants: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
  }> {
    const leaderboard = await this.getLeaderboard(challengeId, 1000);
    
    if (leaderboard.length === 0) {
      return {
        totalParticipants: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0
      };
    }

    const scores = leaderboard.map(entry => Number(entry.score));
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const averageScore = totalScore / scores.length;

    return {
      totalParticipants: leaderboard.length,
      averageScore: Math.round(averageScore * 100) / 100,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores)
    };
  }
}
