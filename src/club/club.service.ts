import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Club, ClubStatus } from './entities/club.entity';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { QueryClubDto } from './dto/query-club.dto';
import { ClubMemberService } from './services/club-member.service';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { createPaginatedResult, getPaginationParams } from '../common/utils/pagination.util';

@Injectable()
export class ClubService {
  constructor(
    @InjectRepository(Club)
    private clubRepository: Repository<Club>,
    private clubMemberService: ClubMemberService,
  ) {}

  /**
   * Tạo câu lạc bộ mới
   */
  async create(createClubDto: CreateClubDto, creatorUserId: string): Promise<Club> {
    // Tạo mã câu lạc bộ tự động
    const clubCode = await this.generateClubCode();
    
    const club = this.clubRepository.create({
      ...createClubDto,
      clubCode,
      status: ClubStatus.PENDING,
      foundedAt: createClubDto.foundedAt ? new Date(createClubDto.foundedAt) : undefined,
    });

    const savedClub = await this.clubRepository.save(club);
    
    // Tự động tạo Admin đầu tiên cho CLB
    await this.clubMemberService.createFirstAdmin(savedClub.id, creatorUserId);
    
    return savedClub;
  }

  /**
   * Lấy danh sách câu lạc bộ với phân trang và filter
   */
  async findAll(queryDto: QueryClubDto): Promise<PaginatedResult<Club>> {
    const queryBuilder = this.buildQueryBuilder(queryDto);
    const { page, limit, skip } = getPaginationParams(queryDto.page, queryDto.limit);
    
    const [clubs, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return createPaginatedResult(clubs, total, page, limit);
  }

  /**
   * Lấy câu lạc bộ theo ID
   */
  async findOne(id: string): Promise<Club> {
    const club = await this.clubRepository.findOne({
      where: { id, isDeleted: false }
    });

    if (!club) {
      throw new NotFoundException('Câu lạc bộ không tồn tại');
    }

    return club;
  }

  /**
   * Lấy câu lạc bộ theo mã
   */
  async findByCode(clubCode: string): Promise<Club> {
    const club = await this.clubRepository.findOne({
      where: { clubCode, isDeleted: false }
    });

    if (!club) {
      throw new NotFoundException('Câu lạc bộ không tồn tại');
    }

    return club;
  }

  /**
   * Cập nhật câu lạc bộ
   */
  async update(id: string, updateClubDto: UpdateClubDto): Promise<Club> {
    const club = await this.findOne(id);

    // Cập nhật thông tin
    Object.assign(club, updateClubDto);

    // Xử lý foundedAt nếu có
    if (updateClubDto.foundedAt) {
      club.foundedAt = new Date(updateClubDto.foundedAt);
    }

    return await this.clubRepository.save(club);
  }

  /**
   * Xóa mềm câu lạc bộ
   */
  async remove(id: string, deletedBy: string): Promise<void> {
    const club = await this.findOne(id);
    
    club.isDeleted = true;
    club.deletedAt = new Date();
    club.deletedBy = deletedBy;
    
    await this.clubRepository.save(club);
  }

  /**
   * Thay đổi trạng thái câu lạc bộ
   */
  async changeStatus(id: string, status: ClubStatus): Promise<Club> {
    const club = await this.findOne(id);
    club.status = status;
    return await this.clubRepository.save(club);
  }

  /**
   * Lấy câu lạc bộ theo thành phố
   */
  async findByCity(city: string, limit: number = 10): Promise<Club[]> {
    return await this.clubRepository.find({
      where: { city, isDeleted: false, isPublic: true },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Lấy câu lạc bộ theo loại
   */
  async findByType(type: string, limit: number = 10): Promise<Club[]> {
    return await this.clubRepository.find({
      where: { type: type as any, isDeleted: false, isPublic: true },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Tìm kiếm câu lạc bộ
   */
  async search(searchTerm: string, limit: number = 10): Promise<Club[]> {
    return await this.clubRepository
      .createQueryBuilder('club')
      .where('club.isDeleted = false')
      .andWhere('club.isPublic = true')
      .andWhere(
        '(club.name ILIKE :search OR club.description ILIKE :search OR club.shortName ILIKE :search)',
        { search: `%${searchTerm}%` }
      )
      .orderBy('club.createdAt', 'DESC')
      .take(limit)
      .getMany();
  }

  /**
   * Lấy thống kê câu lạc bộ
   */
  async getStats(): Promise<any> {
    const stats = await this.clubRepository
      .createQueryBuilder('club')
      .select([
        'COUNT(*) as totalClubs',
        'COUNT(CASE WHEN club.status = :active THEN 1 END) as activeClubs',
        'COUNT(CASE WHEN club.status = :pending THEN 1 END) as pendingClubs',
        'COUNT(CASE WHEN club.type = :running THEN 1 END) as runningClubs'
      ])
      .where('club.isDeleted = false')
      .setParameters({
        active: ClubStatus.ACTIVE,
        pending: ClubStatus.PENDING,
        running: 'running'
      })
      .getRawOne();

    return {
      totalClubs: parseInt(stats.totalClubs) || 0,
      activeClubs: parseInt(stats.activeClubs) || 0,
      pendingClubs: parseInt(stats.pendingClubs) || 0,
      runningClubs: parseInt(stats.runningClubs) || 0,
    };
  }

  /**
   * Tạo mã câu lạc bộ tự động
   */
  private async generateClubCode(): Promise<string> {
    const prefix = 'CLB';
    let counter = 1;
    let clubCode: string;

    do {
      clubCode = `${prefix}${counter.toString().padStart(4, '0')}`;
      const existingClub = await this.clubRepository.findOne({
        where: { clubCode }
      });
      
      if (!existingClub) {
        break;
      }
      counter++;
    } while (counter < 10000);

    if (counter >= 10000) {
      throw new Error('Không thể tạo mã câu lạc bộ mới');
    }

    return clubCode;
  }

  /**
   * Xây dựng query builder với các filter
   */
  private buildQueryBuilder(queryDto: QueryClubDto): SelectQueryBuilder<Club> {
    const queryBuilder = this.clubRepository
      .createQueryBuilder('club')
      .where('club.isDeleted = false');

    // Filter theo loại
    if (queryDto.type) {
      queryBuilder.andWhere('club.type = :type', { type: queryDto.type });
    }

    // Filter theo trạng thái
    if (queryDto.status) {
      queryBuilder.andWhere('club.status = :status', { status: queryDto.status });
    }

    // Filter theo thành phố
    if (queryDto.city && queryDto.city.trim()) {
      queryBuilder.andWhere('club.city = :city', { city: queryDto.city.trim() });
    }

    // Filter theo tỉnh/thành phố
    if (queryDto.state && queryDto.state.trim()) {
      queryBuilder.andWhere('club.state = :state', { state: queryDto.state.trim() });
    }

    // Filter theo quốc gia
    if (queryDto.country && queryDto.country.trim()) {
      queryBuilder.andWhere('club.country = :country', { country: queryDto.country.trim() });
    }

    // Filter theo quyền riêng tư
    if (queryDto.publicOnly) {
      queryBuilder.andWhere('club.isPublic = true');
    }

    // Filter theo quyền đăng ký mới
    if (queryDto.allowNewMembers) {
      queryBuilder.andWhere('club.allowNewMembers = true');
    }

    // Tìm kiếm theo tên hoặc mô tả
    if (queryDto.search && queryDto.search.trim()) {
      queryBuilder.andWhere(
        '(club.name ILIKE :search OR club.description ILIKE :search OR club.shortName ILIKE :search)',
        { search: `%${queryDto.search.trim()}%` }
      );
    }

    // Sắp xếp
    const sortOrder = queryDto.sortOrder === 'ASC' ? 'ASC' : 'DESC';
    queryBuilder.orderBy(`club.${queryDto.sortBy}`, sortOrder);

    return queryBuilder;
  }
}
