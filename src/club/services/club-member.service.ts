import { Injectable, Logger, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Club } from '../entities/club.entity';
import { ClubMember, MemberRole, MemberStatus } from '../entities/club-member.entity';
import { 
  AddMemberDto, 
  UpdateMemberRoleDto, 
  UpdateMemberStatusDto, 
  TransferAdminDto, 
  RemoveMemberDto,
  MemberResponseDto 
} from '../dto/manage-member.dto';

@Injectable()
export class ClubMemberService {
  private readonly logger = new Logger(ClubMemberService.name);

  constructor(
    @InjectRepository(Club)
    private clubRepo: Repository<Club>,
    @InjectRepository(ClubMember)
    private clubMemberRepo: Repository<ClubMember>,
  ) {}

  /**
   * Thêm thành viên mới vào câu lạc bộ
   */
  async addMember(clubId: string, addMemberDto: AddMemberDto, currentUserId: string): Promise<MemberResponseDto> {
    // Kiểm tra quyền admin
    await this.checkAdminPermission(clubId, currentUserId);

    // Kiểm tra club có tồn tại không
    const club = await this.clubRepo.findOne({ where: { id: clubId, isDeleted: false } });
    if (!club) {
      throw new NotFoundException('Câu lạc bộ không tồn tại');
    }

    // Kiểm tra user có tồn tại không (sẽ kiểm tra khi tạo member)
    // User sẽ được validate thông qua foreign key constraint

    // Kiểm tra user đã là thành viên chưa
    const existingMember = await this.clubMemberRepo.findOne({
      where: { clubId, userId: addMemberDto.userId }
    });
    if (existingMember) {
      throw new BadRequestException('Người dùng đã là thành viên của câu lạc bộ này');
    }

    // Kiểm tra số lượng thành viên tối đa
    if (club.maxMembers) {
      const currentMemberCount = await this.clubMemberRepo.count({
        where: { clubId, status: MemberStatus.ACTIVE }
      });
      if (currentMemberCount >= club.maxMembers) {
        throw new BadRequestException('Câu lạc bộ đã đạt số lượng thành viên tối đa');
      }
    }

    // Tạo thành viên mới
    const newMember = this.clubMemberRepo.create({
      clubId,
      userId: addMemberDto.userId,
      role: addMemberDto.role || MemberRole.MEMBER,
      status: club.requireApproval ? MemberStatus.PENDING : MemberStatus.ACTIVE,
      notes: addMemberDto.notes,
    });

    const savedMember = await this.clubMemberRepo.save(newMember);
    
    this.logger.log(`Thêm thành viên ${addMemberDto.userId} vào club ${clubId} với vai trò ${addMemberDto.role}`);

    return this.mapToMemberResponseDto(savedMember);
  }

  /**
   * Cập nhật vai trò của thành viên
   */
  async updateMemberRole(
    clubId: string, 
    userId: string, 
    updateRoleDto: UpdateMemberRoleDto, 
    currentUserId: string
  ): Promise<MemberResponseDto> {
    // Kiểm tra quyền admin
    await this.checkAdminPermission(clubId, currentUserId);

    // Kiểm tra thành viên cần cập nhật
    const member = await this.clubMemberRepo.findOne({
      where: { clubId, userId },
      relations: ['user']
    });
    if (!member) {
      throw new NotFoundException('Thành viên không tồn tại trong câu lạc bộ');
    }

    // Không thể thay đổi vai trò của chính mình
    if (userId === currentUserId) {
      throw new BadRequestException('Không thể thay đổi vai trò của chính mình');
    }

    // Cập nhật vai trò
    member.role = updateRoleDto.role;
    if (updateRoleDto.notes) {
      member.notes = updateRoleDto.notes;
    }

    const updatedMember = await this.clubMemberRepo.save(member);
    
    this.logger.log(`Cập nhật vai trò thành viên ${userId} trong club ${clubId} thành ${updateRoleDto.role}`);

    return this.mapToMemberResponseDto(updatedMember);
  }

  /**
   * Cập nhật trạng thái của thành viên
   */
  async updateMemberStatus(
    clubId: string, 
    userId: string, 
    updateStatusDto: UpdateMemberStatusDto, 
    currentUserId: string
  ): Promise<MemberResponseDto> {
    // Kiểm tra quyền admin
    await this.checkAdminPermission(clubId, currentUserId);

    // Kiểm tra thành viên cần cập nhật
    const member = await this.clubMemberRepo.findOne({
      where: { clubId, userId },
      relations: ['user']
    });
    if (!member) {
      throw new NotFoundException('Thành viên không tồn tại trong câu lạc bộ');
    }

    // Không thể thay đổi trạng thái của chính mình
    if (userId === currentUserId) {
      throw new BadRequestException('Không thể thay đổi trạng thái của chính mình');
    }

    // Cập nhật trạng thái
    member.status = updateStatusDto.status;
    if (updateStatusDto.reason) {
      member.notes = updateStatusDto.notes || member.notes;
    }

    const updatedMember = await this.clubMemberRepo.save(member);
    
    this.logger.log(`Cập nhật trạng thái thành viên ${userId} trong club ${clubId} thành ${updateStatusDto.status}`);

    return this.mapToMemberResponseDto(updatedMember);
  }

  /**
   * Chuyển giao quyền admin
   */
  async transferAdmin(
    clubId: string, 
    transferAdminDto: TransferAdminDto, 
    currentUserId: string
  ): Promise<MemberResponseDto> {
    // Kiểm tra quyền admin
    await this.checkAdminPermission(clubId, currentUserId);

    // Xác nhận chuyển giao
    if (!transferAdminDto.confirmTransfer) {
      throw new BadRequestException('Vui lòng xác nhận việc chuyển giao quyền admin');
    }

    // Kiểm tra thành viên sẽ nhận quyền admin
    const newAdminMember = await this.clubMemberRepo.findOne({
      where: { clubId, userId: transferAdminDto.newAdminUserId },
      relations: ['user']
    });
    if (!newAdminMember) {
      throw new NotFoundException('Thành viên không tồn tại trong câu lạc bộ');
    }

    if (newAdminMember.status !== MemberStatus.ACTIVE) {
      throw new BadRequestException('Chỉ có thể chuyển giao quyền admin cho thành viên đang hoạt động');
    }

    // Kiểm tra có phải admin cuối cùng không
    const adminCount = await this.clubMemberRepo.count({
      where: { clubId, role: MemberRole.ADMIN, status: MemberStatus.ACTIVE }
    });
    if (adminCount <= 1) {
      throw new BadRequestException('Không thể chuyển giao quyền admin khi chỉ còn 1 admin duy nhất');
    }

    // Thực hiện chuyển giao
    const currentAdminMember = await this.clubMemberRepo.findOne({
      where: { clubId, userId: currentUserId }
    });

    // Cập nhật vai trò
    if (currentAdminMember) {
      currentAdminMember.role = MemberRole.MEMBER;
    }
    newAdminMember.role = MemberRole.ADMIN;

    // Lưu thay đổi
    const membersToSave = currentAdminMember ? [currentAdminMember, newAdminMember] : [newAdminMember];
    await this.clubMemberRepo.save(membersToSave);
    
    this.logger.log(`Chuyển giao quyền admin từ ${currentUserId} sang ${transferAdminDto.newAdminUserId} trong club ${clubId}`);

    return this.mapToMemberResponseDto(newAdminMember);
  }

  /**
   * Gỡ quyền admin (chuyển về member)
   */
  async removeAdminRole(
    clubId: string, 
    userId: string, 
    currentUserId: string
  ): Promise<MemberResponseDto> {
    // Kiểm tra quyền admin
    await this.checkAdminPermission(clubId, currentUserId);

    // Không thể gỡ quyền admin của chính mình
    if (userId === currentUserId) {
      throw new BadRequestException('Không thể gỡ quyền admin của chính mình. Hãy chuyển giao quyền admin trước.');
    }

    // Kiểm tra thành viên cần gỡ quyền
    const member = await this.clubMemberRepo.findOne({
      where: { clubId, userId },
      relations: ['user']
    });
    if (!member) {
      throw new NotFoundException('Thành viên không tồn tại trong câu lạc bộ');
    }

    if (member.role !== MemberRole.ADMIN) {
      throw new BadRequestException('Thành viên này không phải admin');
    }

    // Kiểm tra có phải admin cuối cùng không
    const adminCount = await this.clubMemberRepo.count({
      where: { clubId, role: MemberRole.ADMIN, status: MemberStatus.ACTIVE }
    });
    if (adminCount <= 1) {
      throw new BadRequestException('Không thể gỡ quyền admin khi chỉ còn 1 admin duy nhất');
    }

    // Gỡ quyền admin
    member.role = MemberRole.MEMBER;
    const updatedMember = await this.clubMemberRepo.save(member);
    
    this.logger.log(`Gỡ quyền admin của thành viên ${userId} trong club ${clubId}`);

    return this.mapToMemberResponseDto(updatedMember);
  }

  /**
   * Xóa thành viên khỏi câu lạc bộ
   */
  async removeMember(
    clubId: string, 
    userId: string, 
    removeMemberDto: RemoveMemberDto, 
    currentUserId: string
  ): Promise<void> {
    // Kiểm tra quyền admin
    await this.checkAdminPermission(clubId, currentUserId);

    // Không thể xóa chính mình
    if (userId === currentUserId) {
      throw new BadRequestException('Không thể xóa chính mình khỏi câu lạc bộ. Hãy chuyển giao quyền admin trước.');
    }

    // Kiểm tra thành viên cần xóa
    const member = await this.clubMemberRepo.findOne({
      where: { clubId, userId }
    });
    if (!member) {
      throw new NotFoundException('Thành viên không tồn tại trong câu lạc bộ');
    }

    // Không thể xóa admin cuối cùng
    if (member.role === MemberRole.ADMIN) {
      const adminCount = await this.clubMemberRepo.count({
        where: { clubId, role: MemberRole.ADMIN, status: MemberStatus.ACTIVE }
      });
      if (adminCount <= 1) {
        throw new BadRequestException('Không thể xóa admin cuối cùng của câu lạc bộ');
      }
    }

    // Xóa thành viên
    await this.clubMemberRepo.remove(member);
    
    this.logger.log(`Xóa thành viên ${userId} khỏi club ${clubId}`);
  }

  /**
   * Lấy danh sách thành viên
   */
  async getMembers(
    clubId: string, 
    currentUserId: string,
    page: number = 1,
    limit: number = 20,
    role?: MemberRole,
    status?: MemberStatus
  ): Promise<{ members: MemberResponseDto[]; total: number }> {
    // Kiểm tra quyền xem danh sách thành viên
    const currentMember = await this.clubMemberRepo.findOne({
      where: { clubId, userId: currentUserId }
    });
    
    if (!currentMember) {
      throw new ForbiddenException('Bạn không phải thành viên của câu lạc bộ này');
    }

    // Chỉ admin và moderator mới có thể xem danh sách chi tiết
    const canViewDetails = currentMember.role === MemberRole.ADMIN || currentMember.role === MemberRole.MODERATOR;

    // Xây dựng query
    const query = this.clubMemberRepo
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.user', 'user')
      .where('member.clubId = :clubId', { clubId });

    if (role) {
      query.andWhere('member.role = :role', { role });
    }
    if (status) {
      query.andWhere('member.status = :status', { status });
    }

    // Phân trang
    const total = await query.getCount();
    const members = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('member.joinedAt', 'ASC')
      .getMany();

    // Map response
    const memberResponses = members.map(member => this.mapToMemberResponseDto(member));

    return { members: memberResponses, total };
  }

  /**
   * Kiểm tra quyền admin
   */
  private async checkAdminPermission(clubId: string, userId: string): Promise<void> {
    const member = await this.clubMemberRepo.findOne({
      where: { clubId, userId, role: MemberRole.ADMIN, status: MemberStatus.ACTIVE }
    });

    if (!member) {
      throw new ForbiddenException('Chỉ admin mới có thể thực hiện hành động này');
    }
  }

  /**
   * Map entity sang response DTO
   */
  private mapToMemberResponseDto(member: ClubMember): MemberResponseDto {
    return {
      id: member.id,
      clubId: member.clubId,
      userId: member.userId,
      role: member.role,
      status: member.status,
      joinedAt: member.joinedAt,
      leftAt: member.leftAt,
      leaveReason: member.leaveReason,
      notes: member.notes,
      metadata: member.metadata,
      user: member.user ? {
        id: member.user.id,
        username: member.user.username,
        firstName: member.user.firstName,
        lastName: member.user.lastName,
        avatar: member.user.avatar,
        email: member.user.email,
      } : undefined
    };
  }

  /**
   * Tự động tạo admin đầu tiên khi tạo club
   */
  async createFirstAdmin(clubId: string, creatorUserId: string): Promise<ClubMember> {
    const firstAdmin = this.clubMemberRepo.create({
      clubId,
      userId: creatorUserId,
      role: MemberRole.ADMIN,
      status: MemberStatus.ACTIVE,
      notes: 'Người tạo câu lạc bộ - Admin đầu tiên',
    });

    const savedAdmin = await this.clubMemberRepo.save(firstAdmin);
    
    this.logger.log(`Tạo admin đầu tiên ${creatorUserId} cho club ${clubId}`);
    
    return savedAdmin;
  }
}
