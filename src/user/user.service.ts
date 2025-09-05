import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserStatus, UserExperience } from './entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UserProfileResponse {
  @ApiProperty({ description: 'ID của user' })
  id: string;

  @ApiProperty({ description: 'Email' })
  email: string;

  @ApiProperty({ description: 'Tên' })
  firstName: string;

  @ApiProperty({ description: 'Họ' })
  lastName: string;



  @ApiProperty({ description: 'Avatar' })
  avatar?: string;

  @ApiProperty({ description: 'Kinh nghiệm chạy bộ' })
  experience: UserExperience;

  @ApiProperty({ description: 'Vị trí' })
  location?: string;

  @ApiProperty({ description: 'Hồ sơ công khai' })
  isPublic: boolean;

  @ApiProperty({ description: 'Danh sách vai trò' })
  roles: string[];

  @ApiProperty({ description: 'Thời gian tạo' })
  createdAt: Date;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Tạo user mới (đăng ký tài khoản)
   * @param createUserDto - DTO chứa thông tin tạo user
   * @param currentUserId - ID của user hiện tại (nếu có - cho admin)
   */
  async create(createUserDto: CreateUserDto, currentUserId?: string): Promise<User> {
    try {
      // Kiểm tra quyền tạo user (chỉ khi có currentUserId - admin tạo)
      if (currentUserId) {
        const currentUser = await this.findOne(currentUserId);
        if (!currentUser.roles.includes('system_admin')) {
          throw new ForbiddenException('Không có quyền tạo user mới');
        }
      }

      // Kiểm tra email đã tồn tại
      const existingUser = await this.userRepository.findOne({
        where: { email: createUserDto.email.toLowerCase() }
      });

      if (existingUser) {
        throw new BadRequestException('Email đã được sử dụng');
      }

      // Tạo user mới
      const newUser = this.userRepository.create({
        ...createUserDto,
        email: createUserDto.email.toLowerCase(),
        roles: createUserDto.roles || ['runner'],
        experience: createUserDto.experience || UserExperience.BEGINNER,
        status: UserStatus.ACTIVE,
        isVerified: false,
        isPublic: false,
      });

      return await this.userRepository.save(newUser);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy danh sách tất cả user (có phân trang và filter)
   * @param page - Trang hiện tại
   * @param limit - Số lượng item mỗi trang
   * @param search - Từ khóa tìm kiếm
   * @param status - Lọc theo trạng thái
   * @param experience - Lọc theo kinh nghiệm
   * @param currentUserId - ID của user hiện tại
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: UserStatus,
    experience?: UserExperience,
    currentUserId?: string
  ): Promise<{ users: UserProfileResponse[]; total: number; page: number; limit: number }> {
    try {
      // Kiểm tra quyền xem danh sách user
      if (currentUserId) {
        const currentUser = await this.findOne(currentUserId);
        if (!currentUser.roles.includes('system_admin')) {
          throw new ForbiddenException('Không có quyền xem danh sách user');
        }
      }

      const skip = (page - 1) * limit;
      const whereConditions: FindOptionsWhere<User> = {};

      // Thêm điều kiện tìm kiếm
      if (search) {
        whereConditions.email = Like(`%${search}%`);
        // Hoặc tìm theo tên
        whereConditions.firstName = Like(`%${search}%`);
        whereConditions.lastName = Like(`%${search}%`);
      }

      if (status) {
        whereConditions.status = status;
      }

      if (experience) {
        whereConditions.experience = experience;
      }

      // Chỉ hiển thị user công khai nếu không phải admin
      if (!currentUserId || !(await this.hasRole(currentUserId, 'system_admin'))) {
        whereConditions.isPublic = true;
      }

      const [users, total] = await this.userRepository.findAndCount({
        where: whereConditions,
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
        select: [
          'id', 'email', 'firstName', 'lastName', 'avatar', 'experience',
          'location', 'isPublic', 'roles', 'createdAt'
        ]
      });

      // Chuyển đổi thành UserProfileResponse
      const userProfiles: UserProfileResponse[] = users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,

        avatar: user.avatar,
        experience: user.experience,
        location: user.location,
        isPublic: user.isPublic,
        roles: user.roles,
        createdAt: user.createdAt,
      }));

      return {
        users: userProfiles,
        total,
        page,
        limit
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Tìm user theo ID
   * @param id - ID của user
   * @param currentUserId - ID của user hiện tại
   */
  async findOne(id: string, currentUserId?: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { id }
      });

      if (!user) {
        throw new NotFoundException('User không tồn tại');
      }

      // Kiểm tra quyền xem user
      if (currentUserId && currentUserId !== id) {
        const currentUser = await this.findOne(currentUserId);
        
        // Nếu không phải admin và user không công khai
        if (!currentUser.roles.includes('system_admin') && !user.isPublic) {
          throw new ForbiddenException('Không có quyền xem user này');
        }
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Tìm user theo email
   * @param email - Email của user
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        where: { email: email.toLowerCase() }
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Cập nhật thông tin user
   * @param id - ID của user
   * @param updateUserDto - DTO chứa thông tin cập nhật
   * @param currentUserId - ID của user hiện tại
   */
  async update(id: string, updateUserDto: UpdateUserDto, currentUserId?: string): Promise<User> {
    try {
      // Kiểm tra quyền cập nhật
      if (currentUserId && currentUserId !== id) {
        const currentUser = await this.findOne(currentUserId);
        if (!currentUser.roles.includes('system_admin')) {
          throw new ForbiddenException('Chỉ có thể cập nhật thông tin của chính mình');
        }
      }

      const user = await this.findOne(id);
      
      // Cập nhật thông tin
      Object.assign(user, updateUserDto);
      
      // Cập nhật thời gian
      user.updatedAt = new Date();

      return await this.userRepository.save(user);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xóa user (soft delete)
   * @param id - ID của user
   * @param currentUserId - ID của user hiện tại
   */
  async remove(id: string, currentUserId?: string): Promise<void> {
    try {
      // Kiểm tra quyền xóa
      if (currentUserId) {
        const currentUser = await this.findOne(currentUserId);
        if (!currentUser.roles.includes('system_admin')) {
          throw new ForbiddenException('Không có quyền xóa user');
        }
      }

      const user = await this.findOne(id);
      
      // Soft delete - chỉ cập nhật trạng thái
      user.status = UserStatus.BANNED;
      user.updatedAt = new Date();
      
      await this.userRepository.save(user);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cập nhật trạng thái user
   * @param id - ID của user
   * @param status - Trạng thái mới
   * @param currentUserId - ID của user hiện tại
   */
  async updateStatus(id: string, status: UserStatus, currentUserId?: string): Promise<User> {
    try {
      // Kiểm tra quyền cập nhật trạng thái
      if (currentUserId) {
        const currentUser = await this.findOne(currentUserId);
        if (!currentUser.roles.includes('system_admin')) {
          throw new ForbiddenException('Không có quyền cập nhật trạng thái user');
        }
      }

      const user = await this.findOne(id);
      user.status = status;
      user.updatedAt = new Date();

      return await this.userRepository.save(user);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Thêm vai trò cho user
   * @param id - ID của user
   * @param role - Vai trò mới
   * @param currentUserId - ID của user hiện tại
   */
  async addRole(id: string, role: string, currentUserId?: string): Promise<User> {
    try {
      // Kiểm tra quyền thêm vai trò
      if (currentUserId) {
        const currentUser = await this.findOne(currentUserId);
        if (!currentUser.roles.includes('system_admin')) {
          throw new ForbiddenException('Không có quyền thêm vai trò');
        }
      }

      const user = await this.findOne(id);
      
      if (!user.roles.includes(role)) {
        user.roles.push(role);
        user.updatedAt = new Date();
        return await this.userRepository.save(user);
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xóa vai trò của user
   * @param id - ID của user
   * @param role - Vai trò cần xóa
   * @param currentUserId - ID của user hiện tại
   */
  async removeRole(id: string, role: string, currentUserId?: string): Promise<User> {
    try {
      // Kiểm tra quyền xóa vai trò
      if (currentUserId) {
        const currentUser = await this.findOne(currentUserId);
        if (!currentUser.roles.includes('system_admin')) {
          throw new ForbiddenException('Không có quyền xóa vai trò');
        }
      }

      const user = await this.findOne(id);
      
      user.roles = user.roles.filter(r => r !== role);
      user.updatedAt = new Date();
      
      return await this.userRepository.save(user);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Kiểm tra user có vai trò cụ thể không
   * @param userId - ID của user
   * @param role - Vai trò cần kiểm tra
   */
  async hasRole(userId: string, role: string): Promise<boolean> {
    try {
      const user = await this.findOne(userId);
      return user.roles.includes(role);
    } catch (error) {
      return false;
    }
  }

  /**
   * Cập nhật thời gian hoạt động cuối
   * @param id - ID của user
   */
  async updateLastActivity(id: string): Promise<void> {
    try {
      await this.userRepository.update(id, {
        lastActivityAt: new Date()
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật thời gian hoạt động:', error);
    }
  }

  /**
   * Lấy thống kê user
   * @param currentUserId - ID của user hiện tại
   */
  async getStats(currentUserId?: string): Promise<any> {
    try {
      // Kiểm tra quyền xem thống kê
      if (currentUserId) {
        const currentUser = await this.findOne(currentUserId);
        if (!currentUser.roles.includes('system_admin')) {
          throw new ForbiddenException('Không có quyền xem thống kê');
        }
      }

      const totalUsers = await this.userRepository.count();
      const activeUsers = await this.userRepository.count({ where: { status: UserStatus.ACTIVE } });
      const verifiedUsers = await this.userRepository.count({ where: { isVerified: true } });

      return {
        total: totalUsers,
        active: activeUsers,
        verified: verifiedUsers,
        inactive: totalUsers - activeUsers
      };
    } catch (error) {
      throw error;
    }
  }
}
