import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChallengeParticipant, ParticipantStatus } from '../entities/challenge-participant.entity';
import { Challenge, ChallengeType, ChallengeStatus } from '../entities/challenge.entity';

@Injectable()
export class ChallengeParticipantService {
  constructor(
    @InjectRepository(ChallengeParticipant)
    private participantRepository: Repository<ChallengeParticipant>,
    @InjectRepository(Challenge)
    private challengeRepository: Repository<Challenge>,
  ) {}

  async joinChallenge(challengeId: string, userId: string): Promise<ChallengeParticipant> {
    // Kiểm tra thử thách tồn tại
    const challenge = await this.challengeRepository.findOne({
      where: { id: challengeId, isDeleted: false }
    });
    if (!challenge) {
      throw new NotFoundException('Thử thách không tồn tại');
    }

    // Kiểm tra trạng thái thử thách
    if (challenge.status !== ChallengeStatus.ACTIVE) {
      throw new BadRequestException('Thử thách không trong trạng thái hoạt động');
    }

    // Kiểm tra đã tham gia chưa
    const existingParticipant = await this.participantRepository.findOne({
      where: { challengeId, userId, isDeleted: false }
    });
    if (existingParticipant) {
      throw new ConflictException('Bạn đã tham gia thử thách này');
    }

    // Kiểm tra thời gian đăng ký
    if (challenge.registrationEndDate && new Date() > challenge.registrationEndDate) {
      throw new BadRequestException('Đã hết thời gian đăng ký tham gia');
    }

    // Kiểm tra số lượng người tham gia tối đa
    if (challenge.maxParticipants) {
      const currentParticipants = await this.participantRepository.count({
        where: { challengeId, isDeleted: false }
      });
      if (currentParticipants >= challenge.maxParticipants) {
        throw new BadRequestException('Thử thách đã đạt giới hạn người tham gia');
      }
    }

    // Tạo người tham gia mới
    const participant = this.participantRepository.create({
      challengeId,
      userId,
      status: challenge.requireApproval ? ParticipantStatus.PENDING : ParticipantStatus.ACTIVE,
      currentProgress: 0,
      currentStreak: 0,
      joinedAt: new Date(),
      lastActivityAt: new Date(),
    });

    const savedParticipant = await this.participantRepository.save(participant);

    // Cập nhật số người tham gia trong challenge
    await this.updateChallengeParticipantCount(challengeId);

    return savedParticipant;
  }

  async leaveChallenge(challengeId: string, userId: string): Promise<void> {
    const participant = await this.participantRepository.findOne({
      where: { challengeId, userId, isDeleted: false }
    });

    if (!participant) {
      throw new NotFoundException('Bạn chưa tham gia thử thách này');
    }

    // Không cho phép rút lui khi đã hoàn thành
    if (participant.status === ParticipantStatus.COMPLETED) {
      throw new BadRequestException('Không thể rút lui khỏi thử thách đã hoàn thành');
    }

    // Xóa mềm
    participant.isDeleted = true;
    participant.deletedAt = new Date();
    await this.participantRepository.save(participant);

    // Cập nhật số người tham gia trong challenge
    await this.updateChallengeParticipantCount(challengeId);
  }

  async updateProgress(challengeId: string, userId: string, progress: number, activityId?: string): Promise<ChallengeParticipant> {
    const participant = await this.participantRepository.findOne({
      where: { challengeId, userId, isDeleted: false }
    });

    if (!participant) {
      throw new NotFoundException('Bạn chưa tham gia thử thách này');
    }

    // Cập nhật tiến độ
    participant.currentProgress = progress;
    participant.lastActivityAt = new Date();

    // Cập nhật hoạt động liên quan
    if (activityId) {
      if (!participant.relatedActivities) {
        participant.relatedActivities = [];
      }
      if (!participant.relatedActivities.includes(activityId)) {
        participant.relatedActivities.push(activityId);
      }
    }

    // Kiểm tra hoàn thành
    const challenge = await this.challengeRepository.findOne({
      where: { id: challengeId }
    });

    if (challenge && this.checkChallengeCompletion(participant, challenge)) {
      participant.status = ParticipantStatus.COMPLETED;
      participant.completedAt = new Date();
      participant.finalScore = this.calculateFinalScore(participant, challenge!);
      
      // Cập nhật số người hoàn thành trong challenge
      await this.updateChallengeCompletedCount(challengeId);
    }

    return await this.participantRepository.save(participant);
  }

  async getParticipants(challengeId: string, status?: ParticipantStatus): Promise<ChallengeParticipant[]> {
    const whereCondition: any = { challengeId, isDeleted: false };
    if (status) {
      whereCondition.status = status;
    }

    return await this.participantRepository.find({
      where: whereCondition,
      order: { currentProgress: 'DESC', joinedAt: 'ASC' }
    });
  }

  async getLeaderboard(challengeId: string, limit: number = 50): Promise<ChallengeParticipant[]> {
    return await this.participantRepository.find({
      where: { challengeId, isDeleted: false },
      order: { currentProgress: 'DESC', joinedAt: 'ASC' },
      take: limit
    });
  }

  async getUserChallenges(userId: string, status?: ParticipantStatus): Promise<ChallengeParticipant[]> {
    const whereCondition: any = { userId, isDeleted: false };
    if (status) {
      whereCondition.status = status;
    }

    return await this.participantRepository.find({
      where: whereCondition,
      relations: ['challenge'],
      order: { lastActivityAt: 'DESC' }
    });
  }

  private async updateChallengeParticipantCount(challengeId: string): Promise<void> {
    const count = await this.participantRepository.count({
      where: { challengeId, isDeleted: false }
    });

    await this.challengeRepository.update(challengeId, { participantCount: count });
  }

  private async updateChallengeCompletedCount(challengeId: string): Promise<void> {
    const count = await this.participantRepository.count({
      where: { challengeId, status: ParticipantStatus.COMPLETED, isDeleted: false }
    });

    await this.challengeRepository.update(challengeId, { completedCount: count });
  }

  private checkChallengeCompletion(participant: ChallengeParticipant, challenge: Challenge): boolean {
    // Kiểm tra theo loại thử thách
    switch (challenge.type) {
      case ChallengeType.DISTANCE:
        return participant.currentProgress >= challenge.targetValue;
      case ChallengeType.FREQUENCY:
        return participant.currentProgress >= challenge.minOccurrences;
      case ChallengeType.STREAK:
        return participant.currentStreak >= challenge.minStreak;
      case ChallengeType.TIME:
        return participant.currentProgress >= challenge.targetValue;
      case ChallengeType.COMBINED:
        // Logic phức tạp hơn cho thử thách kết hợp
        return this.checkCombinedChallengeCompletion(participant, challenge);
      default:
        return false;
    }
  }

  private checkCombinedChallengeCompletion(participant: ChallengeParticipant, challenge: Challenge): boolean {
    // Kiểm tra tất cả điều kiện
    const distanceOk = challenge.type === ChallengeType.DISTANCE ? participant.currentProgress >= challenge.targetValue : true;
    const frequencyOk = challenge.type === ChallengeType.FREQUENCY ? participant.currentProgress >= challenge.minOccurrences : true;
    const streakOk = challenge.type === ChallengeType.STREAK ? participant.currentStreak >= challenge.minStreak : true;
    
    return distanceOk && frequencyOk && streakOk;
  }

  private calculateFinalScore(participant: ChallengeParticipant, challenge: Challenge): number {
    // Tính điểm dựa trên tiến độ và thời gian
    let score = challenge.points || 0;
    
    // Bonus cho hoàn thành sớm
    if (challenge.timeLimit) {
      const daysTaken = (new Date().getTime() - participant.joinedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysTaken < challenge.timeLimit) {
        score += Math.floor((challenge.timeLimit - daysTaken) * 10);
      }
    }

    return score;
  }

  async approveParticipant(challengeId: string, userId: string): Promise<ChallengeParticipant> {
    const participant = await this.participantRepository.findOne({
      where: { challengeId, userId, isDeleted: false }
    });

    if (!participant) {
      throw new NotFoundException('Người tham gia không tồn tại');
    }

    if (participant.status !== ParticipantStatus.PENDING) {
      throw new BadRequestException('Chỉ có thể duyệt người tham gia đang chờ duyệt');
    }

    participant.status = ParticipantStatus.ACTIVE;
    const savedParticipant = await this.participantRepository.save(participant);

    // Cập nhật số người tham gia trong challenge
    await this.updateChallengeParticipantCount(challengeId);

    return savedParticipant;
  }

  async rejectParticipant(challengeId: string, userId: string): Promise<void> {
    const participant = await this.participantRepository.findOne({
      where: { challengeId, userId, isDeleted: false }
    });

    if (!participant) {
      throw new NotFoundException('Người tham gia không tồn tại');
    }

    if (participant.status !== ParticipantStatus.PENDING) {
      throw new BadRequestException('Chỉ có thể từ chối người tham gia đang chờ duyệt');
    }

    // Xóa mềm participant
    participant.isDeleted = true;
    participant.deletedAt = new Date();
    await this.participantRepository.save(participant);

    // Cập nhật số người tham gia trong challenge
    await this.updateChallengeParticipantCount(challengeId);
  }

  async getPendingParticipants(challengeId: string): Promise<ChallengeParticipant[]> {
    return await this.participantRepository.find({
      where: { 
        challengeId, 
        status: ParticipantStatus.PENDING, 
        isDeleted: false 
      },
      order: { joinedAt: 'ASC' }
    });
  }
}
