import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, MoreThan, LessThan, In } from 'typeorm';
import { Race, RaceStatus, RaceType, RaceVisibility } from './entities/race.entity';
import { CreateRaceDto } from './dto/create-race.dto';
import { UpdateRaceDto } from './dto/update-race.dto';
import { QueryRaceDto } from './dto/query-race.dto';
import { RegisterRaceDto } from './dto/register-race.dto';
import { v4 as uuidv4 } from 'uuid';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { createPaginatedResult, getPaginationParams } from '../common/utils/pagination.util';


export interface RaceStats {
  totalRaces: number;
  activeRaces: number;
  completedRaces: number;
  upcomingRaces: number;
  totalParticipants: number;
  totalRevenue: number;
}

@Injectable()
export class RaceService {
  constructor(
    @InjectRepository(Race)
    private raceRepository: Repository<Race>,
  ) {}

  /**
   * Tạo giải chạy mới
   */
  async create(createRaceDto: CreateRaceDto, userId: string): Promise<Race> {
    try {
      // Tạo mã giải chạy duy nhất
      const raceCode = await this.generateUniqueRaceCode(createRaceDto.name);

      const race = this.raceRepository.create({
        ...createRaceDto,
        raceCode,
        createdBy: userId,
        status: RaceStatus.DRAFT,
        currency: createRaceDto.currency || 'VND',
        allowRegistration: createRaceDto.allowRegistration ?? true,
        requireApproval: createRaceDto.requireApproval ?? false,
        allowWithdrawal: createRaceDto.allowWithdrawal ?? true,
      });

      return await this.raceRepository.save(race);
    } catch (error) {
      throw new BadRequestException('Không thể tạo giải chạy: ' + error.message);
    }
  }

  /**
   * Lấy danh sách giải chạy với phân trang và filter
   */
  async findAll(queryDto: QueryRaceDto): Promise<PaginatedResult<Race>> {
    const {
      search,
      type,
      status,
      visibility,
      clubId,
      createdBy,
      startDateFrom,
      startDateTo,
      minDistance,
      maxDistance,
      minFee,
      maxFee,
      sortBy = 'startDate',
      sortOrder = 'ASC',
      upcoming,
      registrationOpen
    } = queryDto;
    const { page, limit, skip } = getPaginationParams(queryDto.page, queryDto.limit);

    const query = this.raceRepository.createQueryBuilder('race')
      .where('race.isDeleted = :isDeleted', { isDeleted: false });

    // Search
    if (search) {
      query.andWhere(
        '(race.name ILIKE :search OR race.description ILIKE :search OR race.tags::text ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Filter by type
    if (type) {
      query.andWhere('race.type = :type', { type });
    }

    // Filter by status
    if (status) {
      query.andWhere('race.status = :status', { status });
    }

    // Filter by visibility
    if (visibility) {
      query.andWhere('race.visibility = :visibility', { visibility });
    }

    // Filter by club
    if (clubId) {
      query.andWhere('race.clubId = :clubId', { clubId });
    }

    // Filter by creator
    if (createdBy) {
      query.andWhere('race.createdBy = :createdBy', { createdBy });
    }

    // Filter by date range
    if (startDateFrom) {
      query.andWhere('race.startDate >= :startDateFrom', { startDateFrom });
    }
    if (startDateTo) {
      query.andWhere('race.startDate <= :startDateTo', { startDateTo });
    }

    // Filter by distance
    if (minDistance !== undefined) {
      query.andWhere('race.mainDistance >= :minDistance', { minDistance });
    }
    if (maxDistance !== undefined) {
      query.andWhere('race.mainDistance <= :maxDistance', { maxDistance });
    }

    // Filter by fee
    if (minFee !== undefined) {
      query.andWhere('race.registrationFee >= :minFee', { minFee });
    }
    if (maxFee !== undefined) {
      query.andWhere('race.registrationFee <= :maxFee', { maxFee });
    }

    // Filter upcoming races
    if (upcoming) {
      query.andWhere('race.startDate > :now', { now: new Date() });
    }

    // Filter registration open
    if (registrationOpen) {
      query.andWhere('race.allowRegistration = :allowRegistration', { allowRegistration: true })
        .andWhere('race.status IN (:...statuses)', { 
          statuses: [RaceStatus.PUBLISHED, RaceStatus.REGISTRATION_OPEN] 
        });
    }

    // Sorting
    const validSortFields = ['startDate', 'createdAt', 'name', 'registrationFee', 'maxParticipants'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'startDate';
    query.orderBy(`race.${sortField}`, sortOrder);

    // Pagination
    query.skip(skip).take(limit);

    const [races, total] = await query.getManyAndCount();

    return createPaginatedResult(races, total, page, limit);
  }

  /**
   * Lấy giải chạy theo ID
   */
  async findOne(id: string): Promise<Race> {
    const race = await this.raceRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!race) {
      throw new NotFoundException('Không tìm thấy giải chạy');
    }

    return race;
  }

  /**
   * Lấy giải chạy theo mã
   */
  async findByCode(raceCode: string): Promise<Race> {
    const race = await this.raceRepository.findOne({
      where: { raceCode, isDeleted: false },
    });

    if (!race) {
      throw new NotFoundException('Không tìm thấy giải chạy với mã: ' + raceCode);
    }

    return race;
  }

  /**
   * Cập nhật giải chạy
   */
  async update(id: string, updateRaceDto: UpdateRaceDto, userId: string): Promise<Race> {
    const race = await this.findOne(id);

    // Kiểm tra quyền chỉnh sửa
    if (race.createdBy !== userId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa giải chạy này');
    }

    // Không cho phép chỉnh sửa khi đã hoàn thành hoặc hủy
    if (race.status === RaceStatus.COMPLETED || race.status === RaceStatus.CANCELLED) {
      throw new BadRequestException('Không thể chỉnh sửa giải chạy đã hoàn thành hoặc hủy');
    }

    Object.assign(race, updateRaceDto);
    return await this.raceRepository.save(race);
  }

  /**
   * Xóa giải chạy (soft delete)
   */
  async remove(id: string, userId: string): Promise<void> {
    const race = await this.findOne(id);

    // Kiểm tra quyền xóa
    if (race.createdBy !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa giải chạy này');
    }

    // Không cho phép xóa khi đã có người tham gia
    if (race.participants && race.participants.length > 0) {
      throw new BadRequestException('Không thể xóa giải chạy đã có người tham gia');
    }

    race.isDeleted = true;
    race.deletedAt = new Date();
    race.deletedBy = userId;

    await this.raceRepository.save(race);
  }

  /**
   * Công bố giải chạy
   */
  async publish(id: string, userId: string): Promise<Race> {
    const race = await this.findOne(id);

    if (race.createdBy !== userId) {
      throw new ForbiddenException('Bạn không có quyền công bố giải chạy này');
    }

    if (race.status !== RaceStatus.DRAFT) {
      throw new BadRequestException('Chỉ có thể công bố giải chạy ở trạng thái draft');
    }

    race.status = RaceStatus.PUBLISHED;
    return await this.raceRepository.save(race);
  }

  /**
   * Mở đăng ký
   */
  async openRegistration(id: string, userId: string): Promise<Race> {
    const race = await this.findOne(id);

    if (race.createdBy !== userId) {
      throw new ForbiddenException('Bạn không có quyền mở đăng ký giải chạy này');
    }

    if (race.status !== RaceStatus.PUBLISHED) {
      throw new BadRequestException('Chỉ có thể mở đăng ký giải chạy đã được công bố');
    }

    race.status = RaceStatus.REGISTRATION_OPEN;
    return await this.raceRepository.save(race);
  }

  /**
   * Đóng đăng ký
   */
  async closeRegistration(id: string, userId: string): Promise<Race> {
    const race = await this.findOne(id);

    if (race.createdBy !== userId) {
      throw new ForbiddenException('Bạn không có quyền đóng đăng ký giải chạy này');
    }

    if (race.status !== RaceStatus.REGISTRATION_OPEN) {
      throw new BadRequestException('Chỉ có thể đóng đăng ký giải chạy đang mở đăng ký');
    }

    race.status = RaceStatus.REGISTRATION_CLOSED;
    return await this.raceRepository.save(race);
  }

  /**
   * Kích hoạt giải chạy
   */
  async activate(id: string, userId: string): Promise<Race> {
    const race = await this.findOne(id);

    if (race.createdBy !== userId) {
      throw new ForbiddenException('Bạn không có quyền kích hoạt giải chạy này');
    }

    if (race.status !== RaceStatus.REGISTRATION_CLOSED) {
      throw new BadRequestException('Chỉ có thể kích hoạt giải chạy đã đóng đăng ký');
    }

    race.status = RaceStatus.ACTIVE;
    return await this.raceRepository.save(race);
  }

  /**
   * Hoàn thành giải chạy
   */
  async complete(id: string, userId: string): Promise<Race> {
    const race = await this.findOne(id);

    if (race.createdBy !== userId) {
      throw new ForbiddenException('Bạn không có quyền hoàn thành giải chạy này');
    }

    if (race.status !== RaceStatus.ACTIVE) {
      throw new BadRequestException('Chỉ có thể hoàn thành giải chạy đang hoạt động');
    }

    race.status = RaceStatus.COMPLETED;
    return await this.raceRepository.save(race);
  }

  /**
   * Hủy giải chạy
   */
  async cancel(id: string, reason: string, userId: string): Promise<Race> {
    const race = await this.findOne(id);

    if (race.createdBy !== userId) {
      throw new ForbiddenException('Bạn không có quyền hủy giải chạy này');
    }

    if (race.status === RaceStatus.COMPLETED || race.status === RaceStatus.CANCELLED) {
      throw new BadRequestException('Không thể hủy giải chạy đã hoàn thành hoặc hủy');
    }

    race.status = RaceStatus.CANCELLED;
    race.settings = { ...race.settings, cancellationReason: reason };
    return await this.raceRepository.save(race);
  }

  /**
   * Đăng ký tham gia giải chạy
   */
  async registerParticipant(raceId: string, userId: string, registerDto: RegisterRaceDto): Promise<any> {
    const race = await this.findOne(raceId);

    // Kiểm tra điều kiện đăng ký
    if (!race.allowRegistration) {
      throw new BadRequestException('Giải chạy không cho phép đăng ký');
    }

    if (race.status !== RaceStatus.REGISTRATION_OPEN) {
      throw new BadRequestException('Giải chạy không đang mở đăng ký');
    }

    // Kiểm tra thời gian đăng ký
    const now = new Date();
    if (race.registrationStartDate && now < race.registrationStartDate) {
      throw new BadRequestException('Chưa đến thời gian đăng ký');
    }
    if (race.registrationEndDate && now > race.registrationEndDate) {
      throw new BadRequestException('Đã hết thời gian đăng ký');
    }

    // Kiểm tra số lượng tham gia
    const currentParticipants = race.participants ? race.participants.length : 0;
    if (race.maxParticipants && currentParticipants >= race.maxParticipants) {
      throw new BadRequestException('Giải chạy đã đủ số lượng tham gia');
    }

    // Kiểm tra đã đăng ký chưa
    if (race.participants && race.participants.includes(userId)) {
      throw new BadRequestException('Bạn đã đăng ký tham gia giải chạy này');
    }

    // Thêm người tham gia
    const participants = race.participants || [];
    participants.push(userId);
    race.participants = participants;

    // Cập nhật thống kê
    race.stats = {
      ...race.stats,
      totalRegistrations: (race.stats?.totalRegistrations || 0) + 1,
      lastRegistrationAt: new Date(),
    };

    await this.raceRepository.save(race);

    return {
      message: 'Đăng ký tham gia thành công',
      raceId: race.id,
      raceName: race.name,
      participantId: userId,
      registrationDate: new Date(),
    };
  }

  /**
   * Hủy đăng ký tham gia
   */
  async unregisterParticipant(raceId: string, userId: string): Promise<void> {
    const race = await this.findOne(raceId);

    if (!race.allowWithdrawal) {
      throw new BadRequestException('Giải chạy không cho phép hủy đăng ký');
    }

    if (!race.participants || !race.participants.includes(userId)) {
      throw new BadRequestException('Bạn chưa đăng ký tham gia giải chạy này');
    }

    // Xóa người tham gia
    race.participants = race.participants.filter(id => id !== userId);

    // Cập nhật thống kê
    race.stats = {
      ...race.stats,
      totalRegistrations: Math.max((race.stats?.totalRegistrations || 1) - 1, 0),
    };

    await this.raceRepository.save(race);
  }

  /**
   * Lấy thống kê giải chạy
   */
  async getStats(id: string): Promise<any> {
    const race = await this.findOne(id);

    return {
      id: race.id,
      name: race.name,
      status: race.status,
      totalParticipants: race.participants ? race.participants.length : 0,
      maxParticipants: race.maxParticipants,
      registrationFee: race.registrationFee,
      totalRevenue: (race.participants ? race.participants.length : 0) * (race.registrationFee || 0),
      startDate: race.startDate,
      endDate: race.endDate,
      createdAt: race.createdAt,
      stats: race.stats,
    };
  }

  /**
   * Lấy thống kê tổng quan
   */
  async getOverallStats(): Promise<RaceStats> {
    const [totalRaces, activeRaces, completedRaces, upcomingRaces] = await Promise.all([
      this.raceRepository.count({ where: { isDeleted: false } }),
      this.raceRepository.count({ where: { status: RaceStatus.ACTIVE, isDeleted: false } }),
      this.raceRepository.count({ where: { status: RaceStatus.COMPLETED, isDeleted: false } }),
      this.raceRepository.count({ 
        where: { 
          startDate: MoreThan(new Date()), 
          isDeleted: false 
        } 
      }),
    ]);

    // Tính tổng số người tham gia và doanh thu
    const races = await this.raceRepository.find({
      where: { isDeleted: false },
      select: ['participants', 'registrationFee'],
    });

    const totalParticipants = races.reduce((sum, race) => {
      return sum + (race.participants ? race.participants.length : 0);
    }, 0);

    const totalRevenue = races.reduce((sum, race) => {
      const participants = race.participants ? race.participants.length : 0;
      const fee = race.registrationFee || 0;
      return sum + (participants * fee);
    }, 0);

    return {
      totalRaces,
      activeRaces,
      completedRaces,
      upcomingRaces,
      totalParticipants,
      totalRevenue,
    };
  }

  /**
   * Tìm kiếm giải chạy
   */
  async search(searchTerm: string, limit: number = 10): Promise<Race[]> {
    return await this.raceRepository.find({
      where: [
        { name: Like(`%${searchTerm}%`), isDeleted: false },
        { description: Like(`%${searchTerm}%`), isDeleted: false },
      ],
      take: limit,
      order: { startDate: 'ASC' },
    });
  }

  /**
   * Lấy giải chạy theo loại
   */
  async findByType(type: RaceType, limit: number = 10): Promise<Race[]> {
    return await this.raceRepository.find({
      where: { type, isDeleted: false },
      take: limit,
      order: { startDate: 'ASC' },
    });
  }

  /**
   * Lấy giải chạy theo câu lạc bộ
   */
  async findByClub(clubId: string, limit: number = 10): Promise<Race[]> {
    return await this.raceRepository.find({
      where: { clubId, isDeleted: false },
      take: limit,
      order: { startDate: 'ASC' },
    });
  }

  /**
   * Lấy giải chạy sắp diễn ra
   */
  async getUpcoming(limit: number = 10): Promise<Race[]> {
    return await this.raceRepository.find({
      where: { 
        startDate: MoreThan(new Date()),
        isDeleted: false,
        status: In([RaceStatus.PUBLISHED, RaceStatus.REGISTRATION_OPEN, RaceStatus.REGISTRATION_CLOSED])
      },
      take: limit,
      order: { startDate: 'ASC' },
    });
  }

  /**
   * Tạo mã giải chạy duy nhất
   */
  private async generateUniqueRaceCode(name: string): Promise<string> {
    // Tạo mã từ tên giải chạy
    const baseCode = name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 10);

    let raceCode = baseCode;
    let counter = 1;

    // Kiểm tra tính duy nhất
    while (await this.raceRepository.findOne({ where: { raceCode } })) {
      raceCode = `${baseCode}-${counter}`;
      counter++;
    }

    return raceCode;
  }
}
