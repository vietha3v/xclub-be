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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { AchievementService } from './achievement.service';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { QueryAchievementDto } from './dto/query-achievement.dto';
import { AwardAchievementDto } from './dto/award-achievement.dto';
import { Achievement, AchievementType, AchievementTier } from './entities/achievement.entity';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@ApiTags('🏆 Quản lý thành tích')
@Controller('achievements')
@ApiBearerAuth('JWT-auth')
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  /**
   * Tạo thành tích mới
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Tạo thành tích mới',
    description: 'Tạo thành tích mới trong hệ thống (chỉ admin/moderator)'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Tạo thành tích thành công',
    type: Achievement
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền tạo thành tích' })
  async create(@Body() createAchievementDto: CreateAchievementDto, @Req() req: any) {
    return this.achievementService.create(createAchievementDto, req.user.userId);
  }

  /**
   * Lấy danh sách thành tích
   */
  @Get()
  @Public()
  @ApiOperation({ 
    summary: 'Lấy danh sách thành tích',
    description: 'Lấy danh sách thành tích với phân trang và tìm kiếm'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách thành tích',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Achievement' }
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
        hasNextPage: { type: 'boolean' },
        hasPreviousPage: { type: 'boolean' }
      }
    }
  })
  async findAll(@Query() queryDto: QueryAchievementDto) {
    return this.achievementService.findAll(queryDto);
  }

  /**
   * Lấy thành tích theo ID
   */
  @Get(':id')
  @Public()
  @ApiOperation({ 
    summary: 'Lấy thành tích theo ID',
    description: 'Lấy thông tin chi tiết của một thành tích'
  })
  @ApiParam({ name: 'id', description: 'ID của thành tích' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thông tin thành tích',
    type: Achievement
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thành tích' })
  async findOne(@Param('id') id: string) {
    return this.achievementService.findOne(id);
  }

  /**
   * Lấy thành tích theo mã
   */
  @Get('code/:achievementCode')
  @Public()
  @ApiOperation({ 
    summary: 'Lấy thành tích theo mã',
    description: 'Lấy thông tin thành tích theo mã thành tích'
  })
  @ApiParam({ name: 'achievementCode', description: 'Mã thành tích' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thông tin thành tích',
    type: Achievement
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thành tích' })
  async findByCode(@Param('achievementCode') achievementCode: string) {
    return this.achievementService.findByCode(achievementCode);
  }

  /**
   * Cập nhật thành tích
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Cập nhật thành tích',
    description: 'Cập nhật thông tin thành tích (chỉ người tạo hoặc admin)'
  })
  @ApiParam({ name: 'id', description: 'ID của thành tích' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cập nhật thành công',
    type: Achievement
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thành tích' })
  async update(
    @Param('id') id: string, 
    @Body() updateAchievementDto: UpdateAchievementDto,
    @Req() req: any
  ) {
    return this.achievementService.update(id, updateAchievementDto, req.user.userId);
  }

  /**
   * Xóa thành tích
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Xóa thành tích',
    description: 'Xóa thành tích (chỉ người tạo hoặc admin)'
  })
  @ApiParam({ name: 'id', description: 'ID của thành tích' })
  @ApiResponse({ 
    status: 200, 
    description: 'Xóa thành công',
    schema: { type: 'object', properties: { message: { type: 'string' } } }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thành tích' })
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.achievementService.remove(id, req.user.userId);
    return { message: 'Xóa thành tích thành công' };
  }

  /**
   * Lấy thành tích theo loại
   */
  @Get('type/:type')
  @Public()
  @ApiOperation({ 
    summary: 'Lấy thành tích theo loại',
    description: 'Lấy danh sách thành tích theo loại cụ thể'
  })
  @ApiParam({ name: 'type', description: 'Loại thành tích', enum: AchievementType })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách thành tích theo loại',
    type: [Achievement]
  })
  async findByType(@Param('type') type: AchievementType) {
    return this.achievementService.findByType(type);
  }

  /**
   * Lấy thành tích theo cấp độ
   */
  @Get('tier/:tier')
  @Public()
  @ApiOperation({ 
    summary: 'Lấy thành tích theo cấp độ',
    description: 'Lấy danh sách thành tích theo cấp độ cụ thể'
  })
  @ApiParam({ name: 'tier', description: 'Cấp độ thành tích', enum: AchievementTier })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách thành tích theo cấp độ',
    type: [Achievement]
  })
  async findByTier(@Param('tier') tier: AchievementTier) {
    return this.achievementService.findByTier(tier);
  }

  /**
   * Lấy thành tích theo CLB
   */
  @Get('club/:clubId')
  @Public()
  @ApiOperation({ 
    summary: 'Lấy thành tích theo CLB',
    description: 'Lấy danh sách thành tích của một CLB'
  })
  @ApiParam({ name: 'clubId', description: 'ID của CLB' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách thành tích của CLB',
    type: [Achievement]
  })
  async findByClub(@Param('clubId') clubId: string) {
    return this.achievementService.findByClub(clubId);
  }

  /**
   * Lấy thành tích theo người tạo
   */
  @Get('creator/:createdBy')
  @Public()
  @ApiOperation({ 
    summary: 'Lấy thành tích theo người tạo',
    description: 'Lấy danh sách thành tích do một người tạo'
  })
  @ApiParam({ name: 'createdBy', description: 'ID của người tạo' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách thành tích theo người tạo',
    type: [Achievement]
  })
  async findByCreator(@Param('createdBy') createdBy: string) {
    return this.achievementService.findByCreator(createdBy);
  }

  /**
   * Lấy thành tích phổ biến
   */
  @Get('popular')
  @Public()
  @ApiOperation({ 
    summary: 'Lấy thành tích phổ biến',
    description: 'Lấy danh sách thành tích phổ biến nhất'
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng thành tích (mặc định 10)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách thành tích phổ biến',
    type: [Achievement]
  })
  async getPopular(@Query('limit') limit?: number) {
    return this.achievementService.getPopularAchievements(limit);
  }

  /**
   * Lấy thành tích mới nhất
   */
  @Get('latest')
  @Public()
  @ApiOperation({ 
    summary: 'Lấy thành tích mới nhất',
    description: 'Lấy danh sách thành tích mới nhất'
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng thành tích (mặc định 10)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách thành tích mới nhất',
    type: [Achievement]
  })
  async getLatest(@Query('limit') limit?: number) {
    return this.achievementService.getLatestAchievements(limit);
  }

  /**
   * Lấy thống kê thành tích
   */
  @Get('stats/overview')
  @Public()
  @ApiOperation({ 
    summary: 'Lấy thống kê tổng quan',
    description: 'Lấy thống kê tổng quan về thành tích'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Thống kê tổng quan',
    schema: {
      type: 'object',
      properties: {
        totalAchievements: { type: 'number' },
        activeAchievements: { type: 'number' },
        inactiveAchievements: { type: 'number' },
        typeBreakdown: { type: 'object' },
        tierBreakdown: { type: 'object' },
        totalPoints: { type: 'number' },
        averagePoints: { type: 'number' }
      }
    }
  })
  async getStats() {
    return this.achievementService.getStats();
  }

  /**
   * Lấy tiến độ thành tích của người dùng
   */
  @Get('user/:userId/progress')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy tiến độ thành tích của người dùng',
    description: 'Lấy tiến độ hoàn thành thành tích của một người dùng'
  })
  @ApiParam({ name: 'userId', description: 'ID của người dùng' })
  @ApiResponse({ 
    status: 200, 
    description: 'Tiến độ thành tích của người dùng',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          achievementId: { type: 'string' },
          achievementCode: { type: 'string' },
          name: { type: 'string' },
          type: { type: 'string' },
          tier: { type: 'string' },
          targetValue: { type: 'number' },
          currentValue: { type: 'number' },
          progress: { type: 'number' },
          isCompleted: { type: 'boolean' },
          completedAt: { type: 'string', format: 'date-time' },
          points: { type: 'number' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  async getUserProgress(@Param('userId') userId: string) {
    return this.achievementService.getUserProgress(userId);
  }

  /**
   * Lấy tiến độ thành tích cụ thể của người dùng
   */
  @Get('user/:userId/progress/:achievementId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy tiến độ thành tích cụ thể',
    description: 'Lấy tiến độ hoàn thành của một thành tích cụ thể'
  })
  @ApiParam({ name: 'userId', description: 'ID của người dùng' })
  @ApiParam({ name: 'achievementId', description: 'ID của thành tích' })
  @ApiResponse({ 
    status: 200, 
    description: 'Tiến độ thành tích cụ thể',
    schema: {
      type: 'object',
      properties: {
        achievementId: { type: 'string' },
        achievementCode: { type: 'string' },
        name: { type: 'string' },
        type: { type: 'string' },
        tier: { type: 'string' },
        targetValue: { type: 'number' },
        currentValue: { type: 'number' },
        progress: { type: 'number' },
        isCompleted: { type: 'boolean' },
        completedAt: { type: 'string', format: 'date-time' },
        points: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng hoặc thành tích' })
  async getUserProgressSpecific(
    @Param('userId') userId: string,
    @Param('achievementId') achievementId: string
  ) {
    return this.achievementService.checkUserProgress(userId, achievementId);
  }

  /**
   * Trao thành tích cho người dùng
   */
  @Post('award')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Trao thành tích cho người dùng',
    description: 'Trao thành tích cho người dùng (chỉ admin/moderator)'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Trao thành tích thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        achievement: { type: 'object' },
        user: { type: 'object' },
        awardedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ hoặc chưa đạt điều kiện' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền trao thành tích' })
  async awardAchievement(@Body() awardDto: AwardAchievementDto) {
    return this.achievementService.awardAchievement(awardDto);
  }

  /**
   * Tìm kiếm thành tích
   */
  @Get('search')
  @Public()
  @ApiOperation({ 
    summary: 'Tìm kiếm thành tích',
    description: 'Tìm kiếm thành tích theo từ khóa'
  })
  @ApiQuery({ name: 'q', description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng kết quả (mặc định 10)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Kết quả tìm kiếm',
    type: [Achievement]
  })
  async search(
    @Query('q') query: string,
    @Query('limit') limit?: number
  ) {
    return this.achievementService.search(query, limit);
  }

  /**
   * Lấy thành tích theo tags
   */
  @Get('tags')
  @Public()
  @ApiOperation({ 
    summary: 'Lấy thành tích theo tags',
    description: 'Lấy danh sách thành tích theo tags'
  })
  @ApiQuery({ name: 'tags', description: 'Danh sách tags (phân cách bằng dấu phẩy)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách thành tích theo tags',
    type: [Achievement]
  })
  async findByTags(@Query('tags') tags: string) {
    const tagArray = tags.split(',').map(tag => tag.trim());
    return this.achievementService.findByTags(tagArray);
  }
}
