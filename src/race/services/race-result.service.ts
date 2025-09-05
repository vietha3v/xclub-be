import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RaceResult, ResultStatus, ResultSource } from '../entities/race-result.entity';
import { RaceParticipant } from '../entities/race-participant.entity';
import { Race } from '../entities/race.entity';

export interface ResultStats {
  totalResults: number;
  verifiedResults: number;
  pendingResults: number;
  disqualifiedResults: number;
  averageFinishTime: number;
  fastestTime: number;
  slowestTime: number;
  averageDistance: number;
  completionRate: number;
}

export interface LeaderboardEntry {
  rank: number;
  participantId: string;
  userId: string;
  bibNumber: string;
  finishTime: number;
  distance: number;
  averagePace: number;
  category: string;
  isCompleted: boolean;
}

@Injectable()
export class RaceResultService {
  constructor(
    @InjectRepository(RaceResult)
    private resultRepository: Repository<RaceResult>,
    @InjectRepository(RaceParticipant)
    private participantRepository: Repository<RaceParticipant>,
    @InjectRepository(Race)
    private raceRepository: Repository<Race>,
  ) {}

  /**
   * Tạo kết quả mới
   */
  async create(raceId: string, participantId: string, resultData: any): Promise<RaceResult> {
    // Kiểm tra người tham gia tồn tại
    const participant = await this.participantRepository.findOne({
      where: { id: participantId, raceId, isDeleted: false },
    });

    if (!participant) {
      throw new NotFoundException('Không tìm thấy người tham gia');
    }

    // Kiểm tra đã có kết quả chưa
    const existingResult = await this.resultRepository.findOne({
      where: { raceId, participantId, isDeleted: false },
    });

    if (existingResult) {
      throw new BadRequestException('Đã có kết quả cho người tham gia này');
    }

    const result = this.resultRepository.create({
      raceId,
      participantId,
      userId: participant.userId,
      bibNumber: participant.bibNumber,
      source: resultData.source || ResultSource.MANUAL,
      externalActivityId: resultData.externalActivityId,
      startTime: resultData.startTime,
      finishTime: resultData.finishTime,
      duration: resultData.duration,
      distance: resultData.distance,
      averagePace: resultData.averagePace,
      averageSpeed: resultData.averageSpeed,
      bestPace: resultData.bestPace,
      maxSpeed: resultData.maxSpeed,
      elevationGain: resultData.elevationGain,
      elevationLoss: resultData.elevationLoss,
      averageHeartRate: resultData.averageHeartRate,
      maxHeartRate: resultData.maxHeartRate,
      calories: resultData.calories,
      gpsData: resultData.gpsData,
      deviceData: resultData.deviceData,
      externalData: resultData.externalData,
      notes: resultData.notes,
      isCompleted: resultData.isCompleted || false,
      completionPercentage: resultData.completionPercentage || 0,
    });

    const savedResult = await this.resultRepository.save(result);

    // Cập nhật thông tin người tham gia
    if (savedResult.isCompleted) {
      await this.updateParticipantResult(participantId, savedResult);
    }

    return savedResult;
  }

  /**
   * Lấy kết quả theo ID
   */
  async findOne(id: string): Promise<RaceResult> {
    const result = await this.resultRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!result) {
      throw new NotFoundException('Không tìm thấy kết quả');
    }

    return result;
  }

  /**
   * Lấy kết quả theo người tham gia
   */
  async findByParticipant(raceId: string, participantId: string): Promise<RaceResult | null> {
    return await this.resultRepository.findOne({
      where: { raceId, participantId, isDeleted: false },
    });
  }

  /**
   * Lấy kết quả theo người dùng
   */
  async findByUser(raceId: string, userId: string): Promise<RaceResult | null> {
    return await this.resultRepository.findOne({
      where: { raceId, userId, isDeleted: false },
    });
  }

  /**
   * Cập nhật kết quả
   */
  async update(id: string, updateData: any): Promise<RaceResult> {
    const result = await this.findOne(id);

    Object.assign(result, updateData);
    const savedResult = await this.resultRepository.save(result);

    // Cập nhật thông tin người tham gia nếu cần
    if (savedResult.isCompleted) {
      await this.updateParticipantResult(result.participantId, savedResult);
    }

    return savedResult;
  }

  /**
   * Xác nhận kết quả
   */
  async verify(id: string, verifiedBy: string): Promise<RaceResult> {
    const result = await this.findOne(id);

    if (result.status !== ResultStatus.PENDING) {
      throw new BadRequestException('Chỉ có thể xác nhận kết quả đang chờ xử lý');
    }

    result.status = ResultStatus.VERIFIED;
    result.verifiedBy = verifiedBy;
    result.verifiedAt = new Date();

    return await this.resultRepository.save(result);
  }

  /**
   * Loại kết quả
   */
  async disqualify(id: string, reason: string): Promise<RaceResult> {
    const result = await this.findOne(id);

    result.status = ResultStatus.DISQUALIFIED;
    result.disqualificationReason = reason;
    result.disqualifiedAt = new Date();

    return await this.resultRepository.save(result);
  }

  /**
   * Xóa kết quả (soft delete)
   */
  async remove(id: string): Promise<void> {
    const result = await this.findOne(id);

    result.isDeleted = true;
    result.deletedAt = new Date();

    await this.resultRepository.save(result);
  }

  /**
   * Lấy bảng xếp hạng
   */
  async getLeaderboard(raceId: string, category?: string): Promise<LeaderboardEntry[]> {
    const query = this.resultRepository.createQueryBuilder('result')
      .leftJoin('result.participant', 'participant')
      .where('result.raceId = :raceId', { raceId })
      .andWhere('result.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('result.isCompleted = :isCompleted', { isCompleted: true })
      .andWhere('result.status = :status', { status: ResultStatus.VERIFIED })
      .andWhere('result.duration IS NOT NULL');

    if (category) {
      query.andWhere('participant.category = :category', { category });
    }

    const results = await query
      .orderBy('result.duration', 'ASC')
      .getMany();

    return results.map((result, index) => ({
      rank: index + 1,
      participantId: result.participantId,
      userId: result.userId,
      bibNumber: result.bibNumber || '',
      finishTime: result.duration || 0,
      distance: result.distance || 0,
      averagePace: result.averagePace || 0,
      category: category || 'overall',
      isCompleted: result.isCompleted,
    }));
  }

  /**
   * Lấy thống kê kết quả
   */
  async getStats(raceId: string): Promise<ResultStats> {
    const results = await this.resultRepository.find({
      where: { raceId, isDeleted: false },
    });

    const stats: ResultStats = {
      totalResults: results.length,
      verifiedResults: 0,
      pendingResults: 0,
      disqualifiedResults: 0,
      averageFinishTime: 0,
      fastestTime: 0,
      slowestTime: 0,
      averageDistance: 0,
      completionRate: 0,
    };

    const completedResults = results.filter(r => r.isCompleted && r.duration);
    const totalParticipants = await this.participantRepository.count({
      where: { raceId, isDeleted: false },
    });

    if (completedResults.length > 0) {
      const durations = completedResults.map(r => r.duration!);
      const distances = completedResults.map(r => r.distance || 0);

      stats.averageFinishTime = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      stats.fastestTime = Math.min(...durations);
      stats.slowestTime = Math.max(...durations);
      stats.averageDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
    }

    results.forEach(result => {
      switch (result.status) {
        case ResultStatus.VERIFIED:
          stats.verifiedResults++;
          break;
        case ResultStatus.PENDING:
          stats.pendingResults++;
          break;
        case ResultStatus.DISQUALIFIED:
          stats.disqualifiedResults++;
          break;
      }
    });

    stats.completionRate = totalParticipants > 0 ? (completedResults.length / totalParticipants) * 100 : 0;

    return stats;
  }

  /**
   * Lấy kết quả theo danh mục
   */
  async getResultsByCategory(raceId: string, category: string): Promise<RaceResult[]> {
    return await this.resultRepository
      .createQueryBuilder('result')
      .leftJoin('result.participant', 'participant')
      .where('result.raceId = :raceId', { raceId })
      .andWhere('participant.category = :category', { category })
      .andWhere('result.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('result.duration', 'ASC')
      .getMany();
  }

  /**
   * Lấy kết quả theo nguồn dữ liệu
   */
  async getResultsBySource(raceId: string, source: ResultSource): Promise<RaceResult[]> {
    return await this.resultRepository.find({
      where: { raceId, source, isDeleted: false },
      order: { duration: 'ASC' },
    });
  }

  /**
   * Lấy kết quả chưa xác nhận
   */
  async getPendingResults(raceId: string): Promise<RaceResult[]> {
    return await this.resultRepository.find({
      where: { raceId, status: ResultStatus.PENDING, isDeleted: false },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Cập nhật thông tin người tham gia từ kết quả
   */
  private async updateParticipantResult(participantId: string, result: RaceResult): Promise<void> {
    const participant = await this.participantRepository.findOne({
      where: { id: participantId },
    });

    if (participant) {
      participant.actualFinishTime = result.duration;
      participant.actualDistance = result.distance;
      participant.averagePace = result.averagePace;
      participant.averageSpeed = result.averageSpeed;
      participant.completionDate = new Date();

      await this.participantRepository.save(participant);
    }
  }

  /**
   * Tính toán thứ hạng
   */
  async calculateRanks(raceId: string): Promise<void> {
    const results = await this.resultRepository.find({
      where: { raceId, isCompleted: true, isDeleted: false },
      order: { duration: 'ASC' },
    });

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      result.overallRank = i + 1;

      // Tính thứ hạng theo danh mục
      const categoryResults = results.filter(r => 
        r.participantId !== result.participantId && 
        this.getParticipantCategory(r.participantId) === this.getParticipantCategory(result.participantId)
      );
      
      result.categoryRank = categoryResults.length + 1;

      await this.resultRepository.save(result);
    }
  }

  /**
   * Lấy danh mục của người tham gia
   */
  private async getParticipantCategory(participantId: string): Promise<string> {
    const participant = await this.participantRepository.findOne({
      where: { id: participantId },
    });
    return participant?.category || 'other';
  }

  /**
   * Import kết quả từ nguồn bên ngoài
   */
  async importFromExternal(raceId: string, externalData: any[]): Promise<RaceResult[]> {
    const results: RaceResult[] = [];

    for (const data of externalData) {
      try {
        const result = await this.create(raceId, data.participantId, {
          source: data.source,
          externalActivityId: data.externalActivityId,
          startTime: data.startTime,
          finishTime: data.finishTime,
          duration: data.duration,
          distance: data.distance,
          averagePace: data.averagePace,
          averageSpeed: data.averageSpeed,
          gpsData: data.gpsData,
          externalData: data.externalData,
        });

        results.push(result);
      } catch (error) {
        console.error(`Error importing result for participant ${data.participantId}:`, error);
      }
    }

    return results;
  }
}
