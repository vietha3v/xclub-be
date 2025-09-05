import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RaceParticipant, ParticipantStatus, PaymentStatus, RegistrationCategory } from '../entities/race-participant.entity';
import { Race } from '../entities/race.entity';

export interface ParticipantStats {
  totalParticipants: number;
  confirmedParticipants: number;
  completedParticipants: number;
  withdrawnParticipants: number;
  disqualifiedParticipants: number;
  totalRevenue: number;
  categoryBreakdown: Record<string, number>;
  paymentStatusBreakdown: Record<string, number>;
}

@Injectable()
export class RaceParticipantService {
  constructor(
    @InjectRepository(RaceParticipant)
    private participantRepository: Repository<RaceParticipant>,
    @InjectRepository(Race)
    private raceRepository: Repository<Race>,
  ) {}

  /**
   * Tạo người tham gia mới
   */
  async create(raceId: string, userId: string, data: any): Promise<RaceParticipant> {
    // Kiểm tra giải chạy tồn tại
    const race = await this.raceRepository.findOne({ where: { id: raceId } });
    if (!race) {
      throw new NotFoundException('Không tìm thấy giải chạy');
    }

    // Kiểm tra đã đăng ký chưa
    const existingParticipant = await this.participantRepository.findOne({
      where: { raceId, userId, isDeleted: false }
    });

    if (existingParticipant) {
      throw new BadRequestException('Bạn đã đăng ký tham gia giải chạy này');
    }

    // Tạo số báo danh
    const bibNumber = await this.generateBibNumber(raceId);

    const participant = this.participantRepository.create({
      raceId,
      userId,
      bibNumber,
      registrationDate: new Date(),
      status: ParticipantStatus.REGISTERED,
      category: data.category || RegistrationCategory.OTHER,
      registeredDistance: data.distance,
      phoneNumber: data.phoneNumber,
      address: data.address,
      medicalInfo: data.medicalInfo,
      runningExperience: data.runningExperience,
      expectedFinishTime: data.expectedFinishTime,
      specialNotes: data.specialNotes,
      additionalInfo: data.additionalInfo,
      paymentAmount: race.registrationFee,
      paymentStatus: (race.registrationFee && race.registrationFee > 0) ? PaymentStatus.PENDING : PaymentStatus.PAID,
    });

    return await this.participantRepository.save(participant);
  }

  /**
   * Lấy danh sách người tham gia theo giải chạy
   */
  async findByRace(raceId: string): Promise<RaceParticipant[]> {
    return await this.participantRepository.find({
      where: { raceId, isDeleted: false },
      order: { bibNumber: 'ASC' },
    });
  }

  /**
   * Lấy người tham gia theo ID
   */
  async findOne(id: string): Promise<RaceParticipant> {
    const participant = await this.participantRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!participant) {
      throw new NotFoundException('Không tìm thấy người tham gia');
    }

    return participant;
  }

  /**
   * Lấy người tham gia theo raceId và userId
   */
  async findByRaceAndUser(raceId: string, userId: string): Promise<RaceParticipant | null> {
    return await this.participantRepository.findOne({
      where: { raceId, userId, isDeleted: false },
    });
  }

  /**
   * Cập nhật thông tin người tham gia
   */
  async update(id: string, updateData: any): Promise<RaceParticipant> {
    const participant = await this.findOne(id);

    Object.assign(participant, updateData);
    return await this.participantRepository.save(participant);
  }

  /**
   * Xác nhận tham gia
   */
  async confirm(id: string): Promise<RaceParticipant> {
    const participant = await this.findOne(id);

    if (participant.status !== ParticipantStatus.REGISTERED) {
      throw new BadRequestException('Chỉ có thể xác nhận người tham gia đã đăng ký');
    }

    participant.status = ParticipantStatus.CONFIRMED;
    participant.confirmationDate = new Date();

    return await this.participantRepository.save(participant);
  }

  /**
   * Đánh dấu hoàn thành
   */
  async complete(id: string, resultData: any): Promise<RaceParticipant> {
    const participant = await this.findOne(id);

    if (participant.status !== ParticipantStatus.CONFIRMED) {
      throw new BadRequestException('Chỉ có thể đánh dấu hoàn thành người tham gia đã xác nhận');
    }

    participant.status = ParticipantStatus.COMPLETED;
    participant.completionDate = new Date();
    participant.actualFinishTime = resultData.finishTime;
    participant.actualDistance = resultData.distance;
    participant.averagePace = resultData.averagePace;
    participant.averageSpeed = resultData.averageSpeed;

    return await this.participantRepository.save(participant);
  }

  /**
   * Rút lui tham gia
   */
  async withdraw(id: string, reason?: string): Promise<RaceParticipant> {
    const participant = await this.findOne(id);

    if (participant.status === ParticipantStatus.COMPLETED) {
      throw new BadRequestException('Không thể rút lui sau khi đã hoàn thành');
    }

    participant.status = ParticipantStatus.WITHDRAWN;
    participant.withdrawalDate = new Date();
    participant.withdrawalReason = reason;

    return await this.participantRepository.save(participant);
  }

  /**
   * Loại khỏi giải chạy
   */
  async disqualify(id: string, reason: string): Promise<RaceParticipant> {
    const participant = await this.findOne(id);

    participant.status = ParticipantStatus.DISQUALIFIED;
    participant.withdrawalReason = reason;
    participant.withdrawalDate = new Date();

    return await this.participantRepository.save(participant);
  }

  /**
   * Cập nhật trạng thái thanh toán
   */
  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus, transactionId?: string): Promise<RaceParticipant> {
    const participant = await this.findOne(id);

    participant.paymentStatus = paymentStatus;
    participant.paymentTransactionId = transactionId;
    
    if (paymentStatus === PaymentStatus.PAID) {
      participant.paymentDate = new Date();
    }

    return await this.participantRepository.save(participant);
  }

  /**
   * Cập nhật kết quả
   */
  async updateResult(id: string, resultData: any): Promise<RaceParticipant> {
    const participant = await this.findOne(id);

    participant.actualFinishTime = resultData.finishTime;
    participant.actualDistance = resultData.distance;
    participant.averagePace = resultData.averagePace;
    participant.averageSpeed = resultData.averageSpeed;
    participant.categoryRank = resultData.categoryRank;
    participant.overallRank = resultData.overallRank;
    participant.genderRank = resultData.genderRank;
    participant.ageGroupRank = resultData.ageGroupRank;
    participant.points = resultData.points || 0;

    return await this.participantRepository.save(participant);
  }

  /**
   * Xóa người tham gia (soft delete)
   */
  async remove(id: string): Promise<void> {
    const participant = await this.findOne(id);

    participant.isDeleted = true;
    participant.deletedAt = new Date();

    await this.participantRepository.save(participant);
  }

  /**
   * Lấy thống kê người tham gia
   */
  async getStats(raceId: string): Promise<ParticipantStats> {
    const participants = await this.participantRepository.find({
      where: { raceId, isDeleted: false },
    });

    const stats: ParticipantStats = {
      totalParticipants: participants.length,
      confirmedParticipants: 0,
      completedParticipants: 0,
      withdrawnParticipants: 0,
      disqualifiedParticipants: 0,
      totalRevenue: 0,
      categoryBreakdown: {},
      paymentStatusBreakdown: {},
    };

    participants.forEach(participant => {
      // Đếm theo trạng thái
      switch (participant.status) {
        case ParticipantStatus.CONFIRMED:
          stats.confirmedParticipants++;
          break;
        case ParticipantStatus.COMPLETED:
          stats.completedParticipants++;
          break;
        case ParticipantStatus.WITHDRAWN:
          stats.withdrawnParticipants++;
          break;
        case ParticipantStatus.DISQUALIFIED:
          stats.disqualifiedParticipants++;
          break;
      }

      // Tính doanh thu
      if (participant.paymentStatus === PaymentStatus.PAID && participant.paymentAmount) {
        stats.totalRevenue += participant.paymentAmount;
      }

      // Đếm theo danh mục
      const category = participant.category;
      stats.categoryBreakdown[category] = (stats.categoryBreakdown[category] || 0) + 1;

      // Đếm theo trạng thái thanh toán
      const paymentStatus = participant.paymentStatus;
      stats.paymentStatusBreakdown[paymentStatus] = (stats.paymentStatusBreakdown[paymentStatus] || 0) + 1;
    });

    return stats;
  }

  /**
   * Lấy bảng xếp hạng
   */
  async getLeaderboard(raceId: string, category?: string): Promise<RaceParticipant[]> {
    const query = this.participantRepository.createQueryBuilder('participant')
      .where('participant.raceId = :raceId', { raceId })
      .andWhere('participant.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('participant.status = :status', { status: ParticipantStatus.COMPLETED })
      .andWhere('participant.actualFinishTime IS NOT NULL');

    if (category) {
      query.andWhere('participant.category = :category', { category });
    }

    return await query
      .orderBy('participant.actualFinishTime', 'ASC')
      .getMany();
  }

  /**
   * Tạo số báo danh duy nhất
   */
  private async generateBibNumber(raceId: string): Promise<string> {
    const race = await this.raceRepository.findOne({ where: { id: raceId } });
    if (!race) {
      throw new NotFoundException('Không tìm thấy giải chạy');
    }

    // Tạo prefix từ tên giải chạy
    const prefix = race.name
      .replace(/[^A-Z]/g, '')
      .substring(0, 3)
      .toUpperCase();

    // Tìm số báo danh cao nhất
    const lastParticipant = await this.participantRepository.findOne({
      where: { raceId },
      order: { bibNumber: 'DESC' },
    });

    let nextNumber = 1;
    if (lastParticipant && lastParticipant.bibNumber) {
      const lastNumber = parseInt(lastParticipant.bibNumber.replace(/\D/g, ''));
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }

  /**
   * Lấy danh sách người tham gia theo trạng thái
   */
  async findByStatus(raceId: string, status: ParticipantStatus): Promise<RaceParticipant[]> {
    return await this.participantRepository.find({
      where: { raceId, status, isDeleted: false },
      order: { bibNumber: 'ASC' },
    });
  }

  /**
   * Lấy danh sách người tham gia theo danh mục
   */
  async findByCategory(raceId: string, category: RegistrationCategory): Promise<RaceParticipant[]> {
    return await this.participantRepository.find({
      where: { raceId, category, isDeleted: false },
      order: { bibNumber: 'ASC' },
    });
  }

  /**
   * Lấy danh sách người tham gia theo trạng thái thanh toán
   */
  async findByPaymentStatus(raceId: string, paymentStatus: PaymentStatus): Promise<RaceParticipant[]> {
    return await this.participantRepository.find({
      where: { raceId, paymentStatus, isDeleted: false },
      order: { bibNumber: 'ASC' },
    });
  }
}
