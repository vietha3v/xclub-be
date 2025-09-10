import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Challenge, ChallengeStatus, ChallengeType } from './entities/challenge.entity';
import { ChallengeParticipant, ParticipantStatus } from './entities/challenge-participant.entity';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { QueryChallengeDto } from './dto/query-challenge.dto';
import { ChallengeParticipantService } from './services/challenge-participant.service';
import { ChallengeLeaderboardService } from './services/challenge-leaderboard.service';

@Injectable()
export class ChallengeService {
  constructor(
    @InjectRepository(Challenge)
    private challengeRepository: Repository<Challenge>,
    @InjectRepository(ChallengeParticipant)
    private participantRepository: Repository<ChallengeParticipant>,
    private challengeParticipantService: ChallengeParticipantService,
    private challengeLeaderboardService: ChallengeLeaderboardService,
  ) {}

  async create(creatorId: string, createChallengeDto: CreateChallengeDto): Promise<Challenge> {
    // Tạo mã thử thách duy nhất
    const challengeCode = await this.generateUniqueChallengeCode();
    
    const challenge = this.challengeRepository.create({
      ...createChallengeDto,
      createdBy: creatorId,
      challengeCode,
      status: ChallengeStatus.PUBLISHED, // Mặc định là PUBLISHED
      participants: [],
      participantCount: 0,
      completedCount: 0,
      isDeleted: false,
      startDate: new Date(createChallengeDto.startDate),
      endDate: new Date(createChallengeDto.endDate),
      registrationStartDate: createChallengeDto.registrationStartDate ? new Date(createChallengeDto.registrationStartDate) : undefined,
      registrationEndDate: createChallengeDto.registrationEndDate ? new Date(createChallengeDto.registrationEndDate) : undefined,
    });

    const savedChallenge = await this.challengeRepository.save(challenge);
    
    // Tự động tính status hiện tại
    savedChallenge.status = this.calculateCurrentStatus(savedChallenge);
    
    return savedChallenge;
  }

  async findAll(queryDto: QueryChallengeDto, userId?: string) {
    const { page = 1, limit = 10, status, type, category, clubId, eventId, search } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.challengeRepository
      .createQueryBuilder('challenge')
      .where('challenge.isDeleted = :isDeleted', { isDeleted: false });

    // Filter theo trạng thái
    if (status) {
      queryBuilder.andWhere('challenge.status = :status', { status });
    }

    // Filter theo loại
    if (type) {
      queryBuilder.andWhere('challenge.type = :type', { type });
    }

    // Filter theo phân loại
    if (category) {
      queryBuilder.andWhere('challenge.category = :category', { category });
    }

    // Filter theo câu lạc bộ
    if (clubId) {
      queryBuilder.andWhere('challenge.clubId = :clubId', { clubId });
    }

    // Filter theo sự kiện
    if (eventId) {
      queryBuilder.andWhere('challenge.eventId = :eventId', { eventId });
    }

    // Tìm kiếm theo tên hoặc mô tả
    if (search) {
      queryBuilder.andWhere(
        '(challenge.name ILIKE :search OR challenge.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [challenges, total] = await queryBuilder
      .orderBy('challenge.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // Thêm thông tin về việc user đã đăng ký hay chưa
    const challengesWithUserStatus = await Promise.all(
      challenges.map(async (challenge) => {
        let userParticipant: ChallengeParticipant | null = null;
        
        if (userId) {
          // Query riêng để lấy thông tin participant của user
          userParticipant = await this.participantRepository.findOne({
            where: { 
              challengeId: challenge.id, 
              userId, 
              isDeleted: false 
            }
          });
        }
        
        return {
          ...challenge,
          userRegistrationStatus: userParticipant ? userParticipant.status : null
        };
      })
    );

    return {
      challenges: challengesWithUserStatus,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Challenge> {
    const challenge = await this.challengeRepository.findOne({
      where: { id, isDeleted: false }
    });

    if (!challenge) {
      throw new NotFoundException('Thử thách không tồn tại');
    }

    // Bỏ tính status để test
    // challenge.status = this.calculateCurrentStatus(challenge);

    return challenge;
  }

  async findByCode(challengeCode: string): Promise<Challenge> {
    const challenge = await this.challengeRepository.findOne({
      where: { challengeCode, isDeleted: false }
    });

    if (!challenge) {
      throw new NotFoundException('Thử thách không tồn tại');
    }

    return challenge;
  }


  async findByType(type: ChallengeType, limit: number = 10): Promise<Challenge[]> {
    return await this.challengeRepository.find({
      where: { type, isDeleted: false },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async search(searchTerm: string, limit: number = 10): Promise<Challenge[]> {
    return await this.challengeRepository.find({
      where: [
        { name: Like(`%${searchTerm}%`), isDeleted: false },
        { description: Like(`%${searchTerm}%`), isDeleted: false },
      ],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async update(id: string, updateChallengeDto: UpdateChallengeDto): Promise<Challenge> {
    const challenge = await this.findOne(id);
    
    // Không cho phép thay đổi một số trường khi đã bắt đầu
    if (challenge.status === ChallengeStatus.ACTIVE || challenge.status === ChallengeStatus.COMPLETED) {
      const { startDate, endDate, targetDistance, targetTime, maxParticipants } = updateChallengeDto;
      if (startDate || endDate || targetDistance || targetTime || maxParticipants) {
        throw new BadRequestException('Không thể thay đổi thông tin cơ bản khi thử thách đã bắt đầu');
      }
    }

    Object.assign(challenge, updateChallengeDto);
    return await this.challengeRepository.save(challenge);
  }

  async changeStatus(id: string, status: ChallengeStatus): Promise<Challenge> {
    const challenge = await this.findOne(id);
    
    // Kiểm tra logic chuyển trạng thái
    if (!this.canChangeStatus(challenge.status, status)) {
      throw new BadRequestException(`Không thể chuyển từ trạng thái ${challenge.status} sang ${status}`);
    }

    challenge.status = status;
    
    // Cập nhật thời gian bắt đầu/kết thúc nếu cần
    if (status === ChallengeStatus.ACTIVE && !challenge.startDate) {
      challenge.startDate = new Date();
    }
    
    if (status === ChallengeStatus.COMPLETED && !challenge.endDate) {
      challenge.endDate = new Date();
    }

    return await this.challengeRepository.save(challenge);
  }

  /**
   * Publish thử thách - chuyển từ DRAFT sang UPCOMING/ACTIVE
   */
  async publishChallenge(id: string, publisherId: string): Promise<Challenge> {
    const challenge = await this.challengeRepository.findOne({
      where: { id, isDeleted: false }
    });

    if (!challenge) {
      throw new NotFoundException('Thử thách không tồn tại');
    }

    // Bỏ validation DRAFT vì đã xóa DRAFT status
    // if (challenge.status !== ChallengeStatus.DRAFT) {
    //   throw new BadRequestException(`Chỉ có thể publish thử thách từ trạng thái DRAFT, hiện tại: ${challenge.status}`);
    // }

    // Kiểm tra quyền publish (chỉ người tạo hoặc admin)
    if (challenge.createdBy !== publisherId) {
      // TODO: Thêm kiểm tra quyền admin
      throw new ForbiddenException('Chỉ người tạo thử thách mới có thể publish');
    }

    // Validation: Kiểm tra thông tin cần thiết để publish
    if (!challenge.name || !challenge.description) {
      throw new BadRequestException('Thử thách phải có tên và mô tả để publish');
    }

    if (!challenge.startDate || !challenge.endDate) {
      throw new BadRequestException('Thử thách phải có ngày bắt đầu và kết thúc để publish');
    }

    if (challenge.startDate >= challenge.endDate) {
      throw new BadRequestException('Ngày bắt đầu phải trước ngày kết thúc');
    }

    // Tính status mới dựa trên thời gian
    const newStatus = this.calculateCurrentStatus(challenge);
    challenge.status = newStatus;

    // Cập nhật thời gian publish
    challenge.updatedAt = new Date();

    return await this.challengeRepository.save(challenge);
  }

  async joinChallenge(id: string, userId: string, autoApprovalPassword?: string): Promise<{ success: boolean; requiresApproval?: boolean; message: string; participantId?: string }> {
    const challenge = await this.findOne(id);
    
    // Kiểm tra mật khẩu phê duyệt tự động nếu có
    let autoApproved = false;
    if (!challenge.allowFreeRegistration && autoApprovalPassword && challenge.autoApprovalPassword) {
      if (autoApprovalPassword === challenge.autoApprovalPassword) {
        autoApproved = true;
      } else {
        throw new BadRequestException('Mật khẩu phê duyệt không đúng');
      }
    }
    
    // Sử dụng ChallengeParticipantService để tham gia với trạng thái phù hợp
    const participant = await this.challengeParticipantService.joinChallenge(id, userId, autoApproved);
    
    // Cập nhật bảng xếp hạng
    await this.challengeLeaderboardService.updateLeaderboard(id);
    
    // Trả về response thông báo
    return {
      success: true,
      requiresApproval: !challenge.allowFreeRegistration && !autoApproved,
      message: autoApproved 
        ? 'Đăng ký thành công! Chúc mừng bạn đã tham gia thử thách.'
        : !challenge.allowFreeRegistration 
          ? 'Đăng ký thành công! Đang chờ xét duyệt.' 
          : 'Đăng ký thành công! Chúc mừng bạn đã tham gia thử thách.',
      participantId: participant.id
    };
  }

  async leaveChallenge(id: string, userId: string): Promise<Challenge> {
    const challenge = await this.findOne(id);
    
    // Sử dụng ChallengeParticipantService để rời thử thách
    await this.challengeParticipantService.leaveChallenge(id, userId);
    
    // Cập nhật bảng xếp hạng
    await this.challengeLeaderboardService.updateLeaderboard(id);
    
    return challenge;
  }

  async remove(id: string, userId: string): Promise<void> {
    const challenge = await this.findOne(id);
    
    // Kiểm tra quyền xóa
    if (challenge.createdBy !== userId) {
      throw new BadRequestException('Không có quyền xóa thử thách này');
    }

    // Xóa mềm
    challenge.isDeleted = true;
    challenge.deletedAt = new Date();
    challenge.deletedBy = userId;
    
    await this.challengeRepository.save(challenge);
  }

  async getStats() {
    const [totalChallenges, activeChallenges, completedChallenges] = await Promise.all([
      this.challengeRepository.count({ where: { isDeleted: false } }),
      this.challengeRepository.count({ where: { status: ChallengeStatus.ACTIVE, isDeleted: false } }),
      this.challengeRepository.count({ where: { status: ChallengeStatus.COMPLETED, isDeleted: false } }),
    ]);

    const distanceChallenges = await this.challengeRepository.count({
      where: { type: ChallengeType.DISTANCE, isDeleted: false }
    });

    return {
      totalChallenges,
      activeChallenges,
      completedChallenges,
      distanceChallenges,
    };
  }

  // Các method mới sử dụng ChallengeParticipantService
  async getParticipants(challengeId: string) {
    return await this.challengeParticipantService.getParticipants(challengeId);
  }

  async getUserChallenges(userId: string) {
    return await this.challengeParticipantService.getUserChallenges(userId);
  }

  // Các method mới sử dụng ChallengeLeaderboardService
  async getLeaderboard(challengeId: string, limit: number = 50) {
    return await this.challengeLeaderboardService.getLeaderboard(challengeId, limit);
  }

  async getUserRank(challengeId: string, userId: string) {
    return await this.challengeLeaderboardService.getUserRank(challengeId, userId);
  }

  async getTopUsers(challengeId: string, limit: number = 10) {
    return await this.challengeLeaderboardService.getTopUsers(challengeId, limit);
  }

  async getLeaderboardStats(challengeId: string) {
    return await this.challengeLeaderboardService.getLeaderboardStats(challengeId);
  }

  private async generateUniqueChallengeCode(): Promise<string> {
    let code = '';
    let isUnique = false;
    
    while (!isUnique) {
      code = 'CH' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const existingChallenge = await this.challengeRepository.findOne({
        where: { challengeCode: code }
      });
      
      if (!existingChallenge) {
        isUnique = true;
      }
    }
    
    return code;
  }

  async approveParticipant(challengeId: string, userId: string, approverId: string): Promise<Challenge> {
    const challenge = await this.findOne(challengeId);
    
    // Kiểm tra quyền duyệt (chỉ người tạo thử thách mới có quyền)
    if (challenge.createdBy !== approverId) {
      throw new BadRequestException('Không có quyền duyệt người tham gia thử thách này');
    }

    // Sử dụng ChallengeParticipantService để duyệt
    await this.challengeParticipantService.approveParticipant(challengeId, userId);
    
    // Cập nhật bảng xếp hạng
    await this.challengeLeaderboardService.updateLeaderboard(challengeId);
    
    return this.findOne(challengeId);
  }

  async rejectParticipant(challengeId: string, userId: string, rejectorId: string): Promise<Challenge> {
    const challenge = await this.findOne(challengeId);
    
    // Kiểm tra quyền từ chối (chỉ người tạo thử thách mới có quyền)
    if (challenge.createdBy !== rejectorId) {
      throw new BadRequestException('Không có quyền từ chối người tham gia thử thách này');
    }

    // Sử dụng ChallengeParticipantService để từ chối
    await this.challengeParticipantService.rejectParticipant(challengeId, userId);
    
    return this.findOne(challengeId);
  }

  async getPendingParticipants(challengeId: string): Promise<ChallengeParticipant[]> {
    const challenge = await this.findOne(challengeId);
    
    // Kiểm tra thử thách có yêu cầu phê duyệt không
    if (challenge.allowFreeRegistration) {
      throw new BadRequestException('Thử thách này không yêu cầu phê duyệt');
    }

    return this.challengeParticipantService.getPendingParticipants(challengeId);
  }

  async getChallengeResults(challengeId: string) {
    const challenge = await this.findOne(challengeId);
    const participants = await this.challengeParticipantService.getParticipants(challengeId);
    const leaderboard = await this.challengeLeaderboardService.getLeaderboard(challengeId);
    const stats = await this.challengeLeaderboardService.getLeaderboardStats(challengeId);

    return {
      challenge,
      participants,
      leaderboard,
      stats: {
        ...stats,
        completionRate: participants.length > 0 ? (stats.totalParticipants / participants.length) * 100 : 0
      }
    };
  }

  async getCompletionStats(challengeId: string) {
    const challenge = await this.findOne(challengeId);
    const participants = await this.challengeParticipantService.getParticipants(challengeId);
    
    const totalParticipants = participants.length;
    const completedParticipants = participants.filter(p => p.status === ParticipantStatus.COMPLETED).length;
    const pendingParticipants = participants.filter(p => p.status === ParticipantStatus.PENDING).length;
    const activeParticipants = participants.filter(p => p.status === ParticipantStatus.ACTIVE).length;
    
    const completionRate = totalParticipants > 0 ? (completedParticipants / totalParticipants) * 100 : 0;
    
    const completedWithTime = participants.filter(p => p.status === ParticipantStatus.COMPLETED && p.completionTime);
    const completionTimes = completedWithTime.map(p => p.completionTime!);
    
    const averageCompletionTime = completionTimes.length > 0 
      ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length 
      : 0;
    
    const fastestCompletion = completionTimes.length > 0 ? Math.min(...completionTimes) : 0;
    const slowestCompletion = completionTimes.length > 0 ? Math.max(...completionTimes) : 0;

    return {
      totalParticipants,
      completedParticipants,
      pendingParticipants,
      activeParticipants,
      completionRate,
      averageCompletionTime,
      fastestCompletion,
      slowestCompletion
    };
  }

  private canChangeStatus(currentStatus: ChallengeStatus, newStatus: ChallengeStatus): boolean {
    const allowedTransitions = {
      // [ChallengeStatus.DRAFT]: [ChallengeStatus.UPCOMING, ChallengeStatus.CANCELLED], // Bỏ DRAFT vì đã xóa
      [ChallengeStatus.UPCOMING]: [ChallengeStatus.ACTIVE, ChallengeStatus.CANCELLED],
      [ChallengeStatus.ACTIVE]: [ChallengeStatus.PAUSED, ChallengeStatus.COMPLETED, ChallengeStatus.CANCELLED],
      [ChallengeStatus.PAUSED]: [ChallengeStatus.ACTIVE, ChallengeStatus.CANCELLED],
      [ChallengeStatus.COMPLETED]: [], // Không thể thay đổi từ COMPLETED
      [ChallengeStatus.CANCELLED]: [], // Không thể thay đổi từ CANCELLED
    };

    return allowedTransitions[currentStatus]?.includes(newStatus) || false;
  }

  /**
   * Tự động tính status hiện tại dựa trên thời gian
   */
  private calculateCurrentStatus(challenge: Challenge): ChallengeStatus {
    const now = new Date();
    
    // Nếu đã bị hủy hoặc hoàn thành, giữ nguyên status
    if (challenge.status === ChallengeStatus.CANCELLED || 
        challenge.status === ChallengeStatus.COMPLETED) {
      return challenge.status;
    }

    // Nếu đang tạm dừng, giữ nguyên
    if (challenge.status === ChallengeStatus.PAUSED) {
      return challenge.status;
    }

    // Tính status dựa trên thời gian
    if (now < challenge.startDate) {
      return ChallengeStatus.UPCOMING;
    } else if (now >= challenge.startDate && now <= challenge.endDate) {
      return ChallengeStatus.ACTIVE;
    } else if (now > challenge.endDate) {
      return ChallengeStatus.COMPLETED;
    }

    // Fallback
    return challenge.status;
  }
}
