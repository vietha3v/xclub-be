import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Club, ClubStatus, ClubType } from './entities/club.entity';
import { ClubMember, MemberRole, MemberStatus } from './entities/club-member.entity';
import { Event } from '../event/entities/event.entity';
import { Challenge } from '../challenge/entities/challenge.entity';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { QueryClubDto } from './dto/query-club.dto';
import { JoinClubDto, LeaveClubDto, JoinClubResponseDto, LeaveClubResponseDto } from './dto/join-leave-club.dto';
import { ClubResponseDto } from './dto/club-response.dto';
import { ClubMemberService } from './services/club-member.service';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { createPaginatedResult, getPaginationParams } from '../common/utils/pagination.util';

@Injectable()
export class ClubService {
  constructor(
    @InjectRepository(Club)
    private clubRepository: Repository<Club>,
    @InjectRepository(ClubMember)
    private clubMemberRepository: Repository<ClubMember>,
    private clubMemberService: ClubMemberService,
  ) {}

  /**
   * Transform Club entity to ClubResponseDto (loại bỏ các trường không cần thiết)
   */
  private transformToResponseDto(club: Club, userRole?: MemberRole[] | null, additionalData?: any): ClubResponseDto {
    const { isPublic, isDeleted, deletedAt, deletedBy, ...clubData } = club;
    
    return {
      ...clubData,
      userRole: userRole || null,
      ...additionalData
    } as ClubResponseDto;
  }

  /**
   * Tạo câu lạc bộ mới
   */
  async create(createClubDto: CreateClubDto, creatorUserId: string): Promise<Club> {
    // Tạo mã câu lạc bộ tự động
    const clubCode = await this.generateClubCode();
    
    const club = this.clubRepository.create({
      ...createClubDto,
      clubCode,
      type: createClubDto.type as ClubType || ClubType.RUNNING,
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
  async findAll(queryDto: QueryClubDto, userId?: string): Promise<PaginatedResult<any>> {
    const queryBuilder = this.buildQueryBuilder(queryDto);
    const { page, limit, skip } = getPaginationParams(queryDto.page, queryDto.limit);
    
    const [clubs, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // Thêm trường role cho mỗi club
    const clubsWithMembership = clubs.map(club => {
      const userMembers = userId ? club.members?.filter(member => 
        String(member.userId) === String(userId) && member.status === MemberStatus.ACTIVE
      ) || [] : [];
      
      const userRoles = userMembers.map(member => member.role);
      
      return this.transformToResponseDto(club, userRoles.length > 0 ? userRoles : null);
    });

    return createPaginatedResult(clubsWithMembership, total, page, limit);
  }

  /**
   * Lấy câu lạc bộ theo ID với đầy đủ thông tin
   */
  async findOne(id: string, userId?: string): Promise<any> {
    // Lấy thông tin CLB cơ bản
    const club = await this.clubRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['members', 'members.user']
    });

    if (!club) {
      throw new NotFoundException('Câu lạc bộ không tồn tại');
    }

    // Lấy events và challenges bằng query riêng
    const [events, challenges] = await Promise.all([
      this.clubRepository.manager
        .createQueryBuilder(Event, 'event')
        .where('event.clubId = :clubId', { clubId: id })
        .andWhere('event.status = :status', { status: 'active' })
        .andWhere('event.startDate > :now', { now: new Date() })
        .getMany(),
      
      this.clubRepository.manager
        .createQueryBuilder(Challenge, 'challenge')
        .where('challenge.clubId = :clubId', { clubId: id })
        .andWhere('challenge.status = :status', { status: 'active' })
        .getMany()
    ]);

    // Lấy thông tin chi tiết
    const activeMembers = club.members?.filter(member => member.status === MemberStatus.ACTIVE) || [];
    
    // Xác định vai trò của người dùng hiện tại
    console.log('Debug findOne:', {
      userId,
      totalMembers: club.members?.length || 0,
      activeMembers: activeMembers.length,
      memberUserIds: activeMembers.map(m => m.userId)
    });
    
    const currentUserMembers = userId ? activeMembers.filter(member => String(member.userId) === String(userId)) : [];
    const userRoles = currentUserMembers.map(member => member.role);
    const userRole = userRoles.length > 0 ? userRoles : null;
    const isAdmin = userRoles.includes(MemberRole.ADMIN);
    
    console.log('Debug userRole:', {
      currentUserMembers: currentUserMembers.length,
      userRoles,
      userRole,
      isAdmin
    });

    return this.transformToResponseDto(club, userRole, {
      // Thống kê
      memberCount: activeMembers.length,
      adminCount: activeMembers.filter(m => m.role === MemberRole.ADMIN).length,
      moderatorCount: activeMembers.filter(m => m.role === MemberRole.MODERATOR).length,
      eventCount: events.length,
      challengeCount: challenges.length,
      
      // Danh sách chi tiết
      members: activeMembers.map(member => ({
        id: member.id,
        role: member.role,
        status: member.status,
        joinedAt: member.joinedAt,
        user: {
          id: member.user?.id,
          firstName: member.user?.firstName,
          lastName: member.user?.lastName,
          email: member.user?.email,
          avatar: member.user?.avatar,
          phoneNumber: member.user?.phoneNumber
        }
      })),
      
      events: events.map(event => ({
        id: event.id,
        name: event.name,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        status: event.status,
        type: event.type,
        eventCode: event.eventCode
      })),
      
      challenges: challenges.map(challenge => ({
        id: challenge.id,
        name: challenge.name,
        description: challenge.description,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
        status: challenge.status,
        type: challenge.type,
        difficulty: challenge.difficulty,
        maxParticipants: challenge.maxParticipants
      }))
    });
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
  async update(id: string, updateClubDto: UpdateClubDto, userId: string): Promise<Club> {
    const club = await this.findOne(id);

    // Kiểm tra quyền admin CLB
    const isAdmin = await this.checkClubAdmin(id, userId);
    if (!isAdmin) {
      throw new ForbiddenException('Chỉ admin CLB mới có quyền cập nhật');
    }

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

    // Kiểm tra quyền admin CLB
    const isAdmin = await this.checkClubAdmin(id, deletedBy);
    if (!isAdmin) {
      throw new ForbiddenException('Chỉ admin CLB mới có quyền xóa');
    }
    
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
   * Kiểm tra quyền admin CLB
   */
  async checkClubAdmin(clubId: string, userId: string): Promise<boolean> {
    const member = await this.clubMemberRepository.findOne({
      where: {
        clubId,
        userId,
        role: MemberRole.ADMIN,
        status: MemberStatus.ACTIVE
      }
    });
    return !!member;
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
      .leftJoinAndSelect('club.members', 'member')
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

  /**
   * Lấy danh sách CLB của người dùng
   */
  async getUserClubs(userId: string): Promise<any[]> {
    const queryBuilder = this.clubRepository
      .createQueryBuilder('club')
      .leftJoinAndSelect('club.members', 'member')
      .leftJoin('member.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('member.status = :status', { status: MemberStatus.ACTIVE })
      .andWhere('club.isDeleted = false')
      .orderBy('member.joinedAt', 'DESC');

    const clubs = await queryBuilder.getMany();

    return clubs.map(club => {
      // Tìm tất cả member info cho user hiện tại (có thể có nhiều vai trò)
      const userMembers = club.members?.filter(member => String(member.userId) === String(userId)) || [];
      const userRoles = userMembers.map(member => member.role);
      
      return {
        id: userMembers[0]?.id, // Lấy ID của member đầu tiên
        club: this.transformToResponseDto(club, userRoles.length > 0 ? userRoles : null),
        role: userRoles, // Trả về array roles
        joinedAt: userMembers[0]?.joinedAt,
        status: userMembers[0]?.status
      };
    });
  }

  /**
   * Tham gia câu lạc bộ
   */
  async joinClub(clubId: string, userId: string, joinClubDto: JoinClubDto): Promise<JoinClubResponseDto> {
    // Kiểm tra CLB có tồn tại không
    const club = await this.clubRepository.findOne({
      where: { id: clubId, isDeleted: false }
    });
    if (!club) {
      throw new NotFoundException('Câu lạc bộ không tồn tại');
    }

    // Kiểm tra CLB có cho phép thành viên mới không
    if (!club.allowNewMembers) {
      throw new BadRequestException('Câu lạc bộ hiện tại không nhận thành viên mới');
    }

    // Kiểm tra CLB có đang hoạt động không
    if (club.status !== ClubStatus.ACTIVE) {
      throw new BadRequestException('Câu lạc bộ hiện tại không hoạt động');
    }

    // Kiểm tra user đã là thành viên chưa
    const existingMember = await this.clubMemberRepository.findOne({
      where: { clubId, userId }
    });
    if (existingMember) {
      if (existingMember.status === MemberStatus.ACTIVE) {
        throw new BadRequestException('Bạn đã là thành viên của câu lạc bộ này');
      } else if (existingMember.status === MemberStatus.PENDING) {
        throw new BadRequestException('Bạn đã gửi yêu cầu tham gia và đang chờ duyệt');
      }
    }

    // Kiểm tra số lượng thành viên tối đa
    if (club.maxMembers) {
      const currentMemberCount = await this.clubMemberRepository.count({
        where: { clubId, status: MemberStatus.ACTIVE }
      });
      if (currentMemberCount >= club.maxMembers) {
        throw new BadRequestException('Câu lạc bộ đã đạt số lượng thành viên tối đa');
      }
    }

    // Xác định trạng thái thành viên
    const memberStatus = club.requireApproval ? MemberStatus.PENDING : MemberStatus.ACTIVE;

    // Tạo hoặc cập nhật thành viên
    let member: ClubMember;
    if (existingMember) {
      // Cập nhật thành viên cũ (có thể là inactive hoặc suspended)
      existingMember.status = memberStatus;
      existingMember.role = MemberRole.MEMBER;
      existingMember.notes = joinClubDto.message || existingMember.notes;
      existingMember.joinedAt = new Date();
      member = await this.clubMemberRepository.save(existingMember);
    } else {
      // Tạo thành viên mới
      const newMember = this.clubMemberRepository.create({
        clubId,
        userId,
        role: MemberRole.MEMBER,
        status: memberStatus,
        notes: joinClubDto.message,
      });
      member = await this.clubMemberRepository.save(newMember);
    }

    return {
      message: memberStatus === MemberStatus.ACTIVE 
        ? 'Tham gia câu lạc bộ thành công!' 
        : 'Yêu cầu tham gia đã được gửi, vui lòng chờ admin duyệt',
      status: memberStatus,
      role: member.role,
      joinedAt: member.joinedAt,
      adminNote: memberStatus === MemberStatus.PENDING 
        ? 'Yêu cầu của bạn đang chờ admin duyệt' 
        : undefined
    };
  }

  /**
   * Rời khỏi câu lạc bộ
   */
  async leaveClub(clubId: string, userId: string, leaveClubDto: LeaveClubDto): Promise<LeaveClubResponseDto> {
    // Kiểm tra CLB có tồn tại không
    const club = await this.clubRepository.findOne({
      where: { id: clubId, isDeleted: false }
    });
    if (!club) {
      throw new NotFoundException('Câu lạc bộ không tồn tại');
    }

    // Kiểm tra user có là thành viên không
    const member = await this.clubMemberRepository.findOne({
      where: { clubId, userId, status: MemberStatus.ACTIVE }
    });
    if (!member) {
      throw new BadRequestException('Bạn không phải thành viên của câu lạc bộ này');
    }

    // Kiểm tra có phải admin cuối cùng không
    if (member.role === MemberRole.ADMIN) {
      const adminCount = await this.clubMemberRepository.count({
        where: { clubId, role: MemberRole.ADMIN, status: MemberStatus.ACTIVE }
      });
      if (adminCount <= 1) {
        throw new BadRequestException('Không thể rời CLB khi bạn là admin cuối cùng. Hãy chuyển giao quyền admin trước.');
      }
    }

    // Cập nhật trạng thái thành viên
    member.status = MemberStatus.INACTIVE;
    member.leftAt = new Date();
    member.leaveReason = leaveClubDto.reason;
    
    await this.clubMemberRepository.save(member);

    return {
      message: 'Rời câu lạc bộ thành công',
      leftAt: member.leftAt,
      reason: leaveClubDto.reason
    };
  }

}
