import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  UseGuards,
  Req,
  ParseIntPipe,
  DefaultValuePipe
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiQuery,
  ApiParam 
} from '@nestjs/swagger';
import { UserService, UserProfileResponse } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { User, UserStatus, UserExperience } from './entities/user.entity';

@ApiTags('👤 Quản lý người dùng')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}



  /**
   * Tạo user mới (chỉ admin)
   */
  @Post()
  @Roles('system_admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Tạo user mới (Admin)',
    description: 'Tạo user mới trong hệ thống (chỉ dành cho System Admin)'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Tạo user thành công',
    type: User
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 403, description: 'Không có quyền tạo user' })
  @ApiResponse({ status: 409, description: 'Email đã tồn tại' })
  async create(
    @Body() createUserDto: CreateUserDto,
    @Req() req: any
  ): Promise<User> {
    return this.userService.create(createUserDto, req.user?.userId);
  }

  /**
   * Lấy danh sách tất cả user (có phân trang và filter)
   */
  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Lấy danh sách user',
    description: 'Lấy danh sách tất cả user với phân trang và filter (chỉ dành cho System Admin)'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Trang hiện tại', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng item mỗi trang', type: Number })
  @ApiQuery({ name: 'search', required: false, description: 'Từ khóa tìm kiếm', type: String })
  @ApiQuery({ name: 'status', required: false, description: 'Lọc theo trạng thái', enum: UserStatus })
  @ApiQuery({ name: 'experience', required: false, description: 'Lọc theo kinh nghiệm', enum: UserExperience })
  @ApiResponse({ 
    status: 200, 
    description: 'Lấy danh sách user thành công',
    schema: {
      type: 'object',
      properties: {
        users: {
          type: 'array',
          items: { $ref: '#/components/schemas/UserProfileResponse' }
        },
        total: { type: 'number', description: 'Tổng số user' },
        page: { type: 'number', description: 'Trang hiện tại' },
        limit: { type: 'number', description: 'Số lượng item mỗi trang' }
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem danh sách user' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Req() req: any,
    @Query('search') search?: string,
    @Query('status') status?: UserStatus,
    @Query('experience') experience?: UserExperience
  ): Promise<{ users: UserProfileResponse[]; total: number; page: number; limit: number }> {
    return this.userService.findAll(page, limit, search, status, experience, req.user?.userId);
  }

  /**
   * Lấy thông tin user theo ID
   */
  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Lấy thông tin user',
    description: 'Lấy thông tin chi tiết của user theo ID'
  })
  @ApiParam({ name: 'id', description: 'ID của user', type: String })
  @ApiResponse({ 
    status: 200, 
    description: 'Lấy thông tin user thành công',
    type: User
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem user này' })
  @ApiResponse({ status: 404, description: 'User không tồn tại' })
  async findOne(
    @Param('id') id: string,
    @Req() req: any
  ): Promise<User> {
    return this.userService.findOne(id, req.user?.userId);
  }

  /**
   * Cập nhật thông tin user
   */
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Cập nhật thông tin user',
    description: 'Cập nhật thông tin của user (chỉ có thể cập nhật thông tin của chính mình hoặc admin)'
  })
  @ApiParam({ name: 'id', description: 'ID của user', type: String })
  @ApiResponse({ 
    status: 200, 
    description: 'Cập nhật thành công',
    type: User
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật user này' })
  @ApiResponse({ status: 404, description: 'User không tồn tại' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: any
  ): Promise<User> {
    return this.userService.update(id, updateUserDto, req.user?.userId);
  }

  /**
   * Xóa user (soft delete)
   */
  @Delete(':id')
  @Roles('system_admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Xóa user',
    description: 'Xóa user khỏi hệ thống (soft delete - chỉ dành cho System Admin)'
  })
  @ApiParam({ name: 'id', description: 'ID của user', type: String })
  @ApiResponse({ status: 200, description: 'Xóa user thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa user' })
  @ApiResponse({ status: 404, description: 'User không tồn tại' })
  async remove(
    @Param('id') id: string,
    @Req() req: any
  ): Promise<void> {
    return this.userService.remove(id, req.user?.userId);
  }

  /**
   * Cập nhật trạng thái user
   */
  @Patch(':id/status')
  @Roles('system_admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Cập nhật trạng thái user',
    description: 'Cập nhật trạng thái của user (chỉ dành cho System Admin)'
  })
  @ApiParam({ name: 'id', description: 'ID của user', type: String })
  @ApiResponse({ 
    status: 200, 
    description: 'Cập nhật trạng thái thành công',
    type: User
  })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật trạng thái' })
  @ApiResponse({ status: 404, description: 'User không tồn tại' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: UserStatus,
    @Req() req: any
  ): Promise<User> {
    return this.userService.updateStatus(id, status, req.user?.userId);
  }

  /**
   * Thêm vai trò cho user
   */
  @Post(':id/roles')
  @Roles('system_admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Thêm vai trò cho user',
    description: 'Thêm vai trò mới cho user (chỉ dành cho System Admin)'
  })
  @ApiParam({ name: 'id', description: 'ID của user', type: String })
  @ApiResponse({ 
    status: 200, 
    description: 'Thêm vai trò thành công',
    type: User
  })
  @ApiResponse({ status: 403, description: 'Không có quyền thêm vai trò' })
  @ApiResponse({ status: 404, description: 'User không tồn tại' })
  async addRole(
    @Param('id') id: string,
    @Body('role') role: string,
    @Req() req: any
  ): Promise<User> {
    return this.userService.addRole(id, role, req.user?.userId);
  }

  /**
   * Xóa vai trò của user
   */
  @Delete(':id/roles/:role')
  @Roles('system_admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Xóa vai trò của user',
    description: 'Xóa vai trò cụ thể của user (chỉ dành cho System Admin)'
  })
  @ApiParam({ name: 'id', description: 'ID của user', type: String })
  @ApiParam({ name: 'role', description: 'Vai trò cần xóa', type: String })
  @ApiResponse({ 
    status: 200, 
    description: 'Xóa vai trò thành công',
    type: User
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa vai trò' })
  @ApiResponse({ status: 404, description: 'User không tồn tại' })
  async removeRole(
    @Param('id') id: string,
    @Param('role') role: string,
    @Req() req: any
  ): Promise<User> {
    return this.userService.removeRole(id, role, req.user?.userId);
  }

  /**
   * Lấy thống kê user
   */
  @Get('stats/overview')
  @Roles('system_admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Lấy thống kê user',
    description: 'Lấy thống kê tổng quan về user trong hệ thống (chỉ dành cho System Admin)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lấy thống kê thành công',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: 'Tổng số user' },
        active: { type: 'number', description: 'Số user đang hoạt động' },
        verified: { type: 'number', description: 'Số user đã xác thực' },
        inactive: { type: 'number', description: 'Số user không hoạt động' }
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem thống kê' })
  async getStats(@Req() req: any): Promise<any> {
    return this.userService.getStats(req.user?.userId);
  }

  /**
   * Lấy profile công khai của user
   */
  @Get(':id/profile')
  @Public()
  @ApiOperation({ 
    summary: 'Lấy profile công khai',
    description: 'Lấy thông tin profile công khai của user (không cần đăng nhập)'
  })
  @ApiParam({ name: 'id', description: 'ID của user', type: String })
  @ApiResponse({ 
    status: 200, 
    description: 'Lấy profile thành công',
    type: UserProfileResponse
  })
  @ApiResponse({ status: 404, description: 'User không tồn tại hoặc không công khai' })
  async getPublicProfile(@Param('id') id: string): Promise<UserProfileResponse> {
    const user = await this.userService.findOne(id);
    
    // Chỉ trả về thông tin công khai
    return {
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
    };
  }
}
