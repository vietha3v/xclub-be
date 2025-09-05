import { Injectable, Logger, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClubMember, MemberRole, MemberStatus } from '../entities/club-member.entity';
import { Club } from '../entities/club.entity';
import { ClubMemberService } from './club-member.service';

export enum ClubAction {
  // Quản lý câu lạc bộ
  MANAGE_CLUB = 'manage_club',           // Sửa/xóa thông tin CLB
  MANAGE_MEMBERS = 'manage_members',     // Thêm/xóa/sửa thành viên
  MANAGE_ROLES = 'manage_roles',         // Thay đổi vai trò thành viên
  
  // Tạo hoạt động (chỉ Admin CLB)
  CREATE_EVENT = 'create_event',          // Tạo sự kiện (private theo CLB)
  CREATE_CHALLENGE = 'create_challenge', // Tạo thử thách (private theo CLB)
  CREATE_RACE = 'create_race',           // Tạo giải chạy (public toàn hệ thống)
  
  // Quản lý hoạt động
  MANAGE_EVENT = 'manage_event',          // Sửa/xóa sự kiện
  MANAGE_CHALLENGE = 'manage_challenge', // Sửa/xóa thử thách
  MANAGE_RACE = 'manage_race',           // Sửa/xóa giải chạy
  
  // Tham gia hoạt động
  JOIN_EVENT = 'join_event',              // Tham gia sự kiện (chỉ thành viên CLB)
  JOIN_CHALLENGE = 'join_challenge',      // Tham gia thử thách (chỉ thành viên CLB)
  JOIN_RACE = 'join_race',                // Tham gia giải chạy (public toàn hệ thống)
  
  // Rời khỏi hoạt động
  LEAVE_EVENT = 'leave_event',            // Rời khỏi sự kiện
  LEAVE_CHALLENGE = 'leave_challenge',    // Rời khỏi thử thách
  LEAVE_RACE = 'leave_race',              // Rời khỏi giải chạy
  
  // Rời khỏi câu lạc bộ
  LEAVE_CLUB = 'leave_club',              // Rời khỏi câu lạc bộ
  
  // Xem thông tin
  VIEW_MEMBERS = 'view_members',          // Xem danh sách thành viên
  VIEW_ACTIVITIES = 'view_activities',    // Xem hoạt động
  VIEW_STATS = 'view_stats'               // Xem thống kê
}

export interface PermissionResult {
  allowed: boolean;
  reason?: string;
  memberRole?: MemberRole;
  memberStatus?: MemberStatus;
}

@Injectable()
export class ClubPermissionService {
  private readonly logger = new Logger(ClubPermissionService.name);

  constructor(
    @InjectRepository(ClubMember)
    private clubMemberRepo: Repository<ClubMember>,
    @InjectRepository(Club)
    private clubRepo: Repository<Club>,
    private clubMemberService: ClubMemberService,
  ) {}

  /**
   * Kiểm tra quyền thực hiện hành động trong câu lạc bộ
   */
  async checkPermission(
    clubId: string,
    userId: string,
    action: ClubAction
  ): Promise<PermissionResult> {
    try {
      // Lấy thông tin thành viên
      const member = await this.clubMemberRepo.findOne({
        where: { clubId, userId }
      });

      // Kiểm tra quyền đặc biệt cho Race (public)
      if (action === ClubAction.JOIN_RACE) {
        return {
          allowed: true,
          reason: 'Race là hoạt động public, tất cả người dùng đều có thể tham gia',
          memberRole: member?.role,
          memberStatus: member?.status
        };
      }

      // Kiểm tra quyền tạo Race (public, nhưng chỉ Admin CLB mới tạo được)
      if (action === ClubAction.CREATE_RACE) {
        if (!member) {
          return {
            allowed: false,
            reason: 'Chỉ Admin của câu lạc bộ mới có thể tạo Race'
          };
        }
        
        if (member.role === MemberRole.ADMIN && member.status === MemberStatus.ACTIVE) {
          return {
            allowed: true,
            memberRole: member.role,
            memberStatus: member.status
          };
        }
        
        return {
          allowed: false,
          reason: 'Chỉ Admin mới có thể tạo Race',
          memberRole: member.role,
          memberStatus: member.status
        };
      }

      // Các hành động khác yêu cầu phải là thành viên CLB
      if (!member) {
        return {
          allowed: false,
          reason: 'Bạn không phải thành viên của câu lạc bộ này'
        };
      }

      // Kiểm tra trạng thái thành viên
      if (member.status !== MemberStatus.ACTIVE) {
        return {
          allowed: false,
          reason: `Tài khoản của bạn đang ở trạng thái: ${member.status}`,
          memberRole: member.role,
          memberStatus: member.status
        };
      }

      // Kiểm tra quyền theo vai trò
      const hasPermission = this.checkRolePermission(member.role, action);
      
      if (hasPermission) {
        return {
          allowed: true,
          memberRole: member.role,
          memberStatus: member.status
        };
      }

      // Trả về lý do không có quyền
      const reason = this.getPermissionDeniedReason(member.role, action);
      
      return {
        allowed: false,
        reason,
        memberRole: member.role,
        memberStatus: member.status
      };

    } catch (error) {
      this.logger.error(`Lỗi kiểm tra quyền: ${error.message}`, error.stack);
      return {
        allowed: false,
        reason: 'Lỗi hệ thống khi kiểm tra quyền'
      };
    }
  }

  /**
   * Kiểm tra quyền theo vai trò
   */
  private checkRolePermission(role: MemberRole, action: ClubAction): boolean {
    switch (role) {
      case MemberRole.ADMIN:
        // Admin có tất cả quyền
        return true;

      case MemberRole.MODERATOR:
        // Moderator có quyền hạn chế
        return this.getModeratorPermissions().includes(action);

      case MemberRole.MEMBER:
        // Member chỉ có quyền cơ bản
        return this.getMemberBasicPermissions().includes(action);

      default:
        return false;
    }
  }

  /**
   * Quyền của Moderator
   */
  private getModeratorPermissions(): ClubAction[] {
    return [
      // Quản lý thành viên (hạn chế)
      ClubAction.VIEW_MEMBERS,
      ClubAction.VIEW_ACTIVITIES,
      ClubAction.VIEW_STATS,
      
      // Quản lý hoạt động (hạn chế)
      ClubAction.MANAGE_EVENT,
      ClubAction.MANAGE_CHALLENGE,
      ClubAction.MANAGE_RACE,
      
      // Tham gia hoạt động
      ClubAction.JOIN_EVENT,
      ClubAction.JOIN_CHALLENGE,
      ClubAction.JOIN_RACE,
      ClubAction.LEAVE_EVENT,
      ClubAction.LEAVE_CHALLENGE,
      ClubAction.LEAVE_RACE,
      
      // Rời khỏi CLB
      ClubAction.LEAVE_CLUB
    ];
  }

  /**
   * Quyền cơ bản của Member
   */
  private getMemberBasicPermissions(): ClubAction[] {
    return [
      // Xem thông tin cơ bản
      ClubAction.VIEW_MEMBERS,
      ClubAction.VIEW_ACTIVITIES,
      ClubAction.VIEW_STATS,
      
      // Tham gia hoạt động
      ClubAction.JOIN_EVENT,
      ClubAction.JOIN_CHALLENGE,
      ClubAction.JOIN_RACE,
      ClubAction.LEAVE_EVENT,
      ClubAction.LEAVE_CHALLENGE,
      ClubAction.LEAVE_RACE,
      
      // Rời khỏi CLB
      ClubAction.LEAVE_CLUB
    ];
  }



  /**
   * Lý do không có quyền
   */
  private getPermissionDeniedReason(role: MemberRole, action: ClubAction): string {
    const actionNames = {
      [ClubAction.CREATE_EVENT]: 'tạo sự kiện',
      [ClubAction.CREATE_CHALLENGE]: 'tạo thử thách',
      [ClubAction.CREATE_RACE]: 'tạo giải chạy',
      [ClubAction.MANAGE_CLUB]: 'quản lý câu lạc bộ',
      [ClubAction.MANAGE_MEMBERS]: 'quản lý thành viên',
      [ClubAction.MANAGE_ROLES]: 'quản lý vai trò',
      [ClubAction.MANAGE_EVENT]: 'quản lý sự kiện',
      [ClubAction.MANAGE_CHALLENGE]: 'quản lý thử thách',
      [ClubAction.MANAGE_RACE]: 'quản lý giải chạy',
      [ClubAction.VIEW_MEMBERS]: 'xem danh sách thành viên',
      [ClubAction.VIEW_ACTIVITIES]: 'xem hoạt động',
      [ClubAction.VIEW_STATS]: 'xem thống kê'
    };

    const actionName = actionNames[action] || action;

    switch (role) {
      case MemberRole.MODERATOR:
        return `Moderator không có quyền ${actionName}. Chỉ Admin mới có quyền này.`;
      
      case MemberRole.MEMBER:
        return `Thành viên thường không có quyền ${actionName}. Chỉ Admin/Moderator mới có quyền này.`;
      
      default:
        return `Vai trò hiện tại không có quyền ${actionName}`;
    }
  }

  /**
   * Kiểm tra quyền và throw exception nếu không có quyền
   */
  async requirePermission(
    clubId: string,
    userId: string,
    action: ClubAction
  ): Promise<void> {
    const result = await this.checkPermission(clubId, userId, action);
    
    if (!result.allowed) {
      throw new ForbiddenException(result.reason || 'Không có quyền thực hiện hành động này');
    }
  }

  /**
   * Kiểm tra quyền tạo hoạt động
   */
  async requireCreateActivityPermission(
    clubId: string,
    userId: string,
    activityType: 'event' | 'challenge' | 'race'
  ): Promise<void> {
    let action: ClubAction;
    
    switch (activityType) {
      case 'event':
        action = ClubAction.CREATE_EVENT;
        break;
      case 'challenge':
        action = ClubAction.CREATE_CHALLENGE;
        break;
      case 'race':
        action = ClubAction.CREATE_RACE;
        break;
      default:
        throw new Error('Loại hoạt động không hợp lệ');
    }

    await this.requirePermission(clubId, userId, action);
  }

  /**
   * Kiểm tra quyền quản lý hoạt động
   */
  async requireManageActivityPermission(
    clubId: string,
    userId: string,
    activityType: 'event' | 'challenge' | 'race'
  ): Promise<void> {
    let action: ClubAction;
    
    switch (activityType) {
      case 'event':
        action = ClubAction.MANAGE_EVENT;
        break;
      case 'challenge':
        action = ClubAction.MANAGE_CHALLENGE;
        break;
      case 'race':
        action = ClubAction.MANAGE_RACE;
        break;
      default:
        throw new Error('Loại hoạt động không hợp lệ');
    }

    await this.requirePermission(clubId, userId, action);
  }

  /**
   * Kiểm tra quyền tham gia hoạt động
   */
  async requireJoinActivityPermission(
    clubId: string,
    userId: string,
    activityType: 'event' | 'challenge' | 'race'
  ): Promise<void> {
    let action: ClubAction;
    
    switch (activityType) {
      case 'event':
        action = ClubAction.JOIN_EVENT;
        break;
      case 'challenge':
        action = ClubAction.JOIN_CHALLENGE;
        break;
      case 'race':
        action = ClubAction.JOIN_RACE;
        break;
      default:
        throw new Error('Loại hoạt động không hợp lệ');
    }

    await this.requirePermission(clubId, userId, action);
  }

  /**
   * Kiểm tra quyền rời khỏi hoạt động
   */
  async requireLeaveActivityPermission(
    clubId: string,
    userId: string,
    activityType: 'event' | 'challenge' | 'race'
  ): Promise<void> {
    let action: ClubAction;
    
    switch (activityType) {
      case 'event':
        action = ClubAction.LEAVE_EVENT;
        break;
      case 'challenge':
        action = ClubAction.LEAVE_CHALLENGE;
        break;
      case 'race':
        action = ClubAction.LEAVE_RACE;
        break;
      default:
        throw new Error('Loại hoạt động không hợp lệ');
    }

    await this.requirePermission(clubId, userId, action);
  }

  /**
   * Kiểm tra quyền tham gia Race (public - không cần là thành viên CLB)
   */
  async checkRaceJoinPermission(userId: string): Promise<boolean> {
    // Race là public, tất cả người dùng đều có thể tham gia
    return true;
  }

  /**
   * Kiểm tra quyền xem thông tin hoạt động
   */
  async checkActivityViewPermission(
    clubId: string,
    userId: string,
    activityType: 'event' | 'challenge' | 'race'
  ): Promise<boolean> {
    // Race luôn public
    if (activityType === 'race') {
      return true;
    }

    // Event và Challenge chỉ dành cho thành viên CLB
    const member = await this.clubMemberRepo.findOne({
      where: { clubId, userId, status: MemberStatus.ACTIVE }
    });

    return !!member;
  }

  /**
   * Lấy thông tin quyền của thành viên
   */
  async getMemberPermissions(clubId: string, userId: string): Promise<{
    role: MemberRole;
    status: MemberStatus;
    permissions: ClubAction[];
    canCreateActivities: boolean;
    canManageClub: boolean;
    canManageMembers: boolean;
    canJoinRace: boolean;
    canViewPublicActivities: boolean;
  }> {
    const member = await this.clubMemberRepo.findOne({
      where: { clubId, userId }
    });

    if (!member) {
      // Không phải thành viên CLB, chỉ có quyền public
      return {
        role: MemberRole.MEMBER, // Default role
        status: MemberStatus.INACTIVE, // Default status
        permissions: [ClubAction.JOIN_RACE],
        canCreateActivities: false,
        canManageClub: false,
        canManageMembers: false,
        canJoinRace: true,
        canViewPublicActivities: true
      };
    }

    const permissions = this.getRolePermissions(member.role);
    const canCreateActivities = member.role === MemberRole.ADMIN;
    const canManageClub = member.role === MemberRole.ADMIN;
    const canManageMembers = member.role === MemberRole.ADMIN || member.role === MemberRole.MODERATOR;
    const canJoinRace = true; // Race luôn public
    const canViewPublicActivities = true; // Có thể xem hoạt động public

    return {
      role: member.role,
      status: member.status,
      permissions,
      canCreateActivities,
      canManageClub,
      canManageMembers,
      canJoinRace,
      canViewPublicActivities
    };
  }

  /**
   * Lấy danh sách quyền theo vai trò
   */
   getRolePermissions(role: MemberRole): ClubAction[] {
    switch (role) {
      case MemberRole.ADMIN:
        return Object.values(ClubAction); // Tất cả quyền
      
      case MemberRole.MODERATOR:
        return this.getModeratorPermissions();
      
      case MemberRole.MEMBER:
        return this.getMemberBasicPermissions();
      
      default:
        return [];
    }
  }

  /**
   * Tóm tắt quyền theo loại hoạt động
   */
  getActivityPermissionSummary(): {
    event: { access: string; create: string; manage: string };
    challenge: { access: string; create: string; manage: string };
    race: { access: string; create: string; manage: string };
  } {
    return {
      event: {
        access: 'Chỉ thành viên câu lạc bộ',
        create: 'Chỉ Admin câu lạc bộ',
        manage: 'Admin và Moderator'
      },
      challenge: {
        access: 'Chỉ thành viên câu lạc bộ',
        create: 'Chỉ Admin câu lạc bộ',
        manage: 'Admin và Moderator'
      },
      race: {
        access: 'Tất cả người dùng hệ thống',
        create: 'Chỉ Admin câu lạc bộ',
        manage: 'Admin và Moderator'
      }
    };
  }
}
