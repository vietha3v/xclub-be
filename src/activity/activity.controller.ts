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
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActivityService } from './activity.service';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { QueryActivityDto } from './dto/query-activity.dto';
import { Activity, ActivityType } from './entities/activity.entity';

@ApiTags('🏃‍♂️ Ghi nhận hoạt động')
@Controller('activities')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  // POST method removed - Activities should only be created through integration sync
  // Use /integrations/sync endpoint instead

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách hoạt động với phân trang và filter' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách hoạt động',
    schema: {
      type: 'object',
      properties: {
        activities: { type: 'array', items: { $ref: '#/components/schemas/Activity' } },
        total: { type: 'number', description: 'Tổng số hoạt động' },
        page: { type: 'number', description: 'Trang hiện tại' },
        limit: { type: 'number', description: 'Số lượng mỗi trang' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async findAll(@Req() req, @Query() queryDto: QueryActivityDto) {
    return this.activityService.findAll(req.user.userId, queryDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Lấy thống kê hoạt động của user' })
  @ApiQuery({ name: 'source', required: false, enum: ['local', 'strava', 'synced'], description: 'Nguồn thống kê: local (từ DB), strava (từ Strava API), synced (từ DB đã đồng bộ)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thống kê hoạt động',
    schema: {
      type: 'object',
      properties: {
        totalActivities: { type: 'number', description: 'Tổng số hoạt động' },
        totalDistance: { type: 'number', description: 'Tổng khoảng cách (km)' },
        totalDuration: { type: 'number', description: 'Tổng thời gian (giây)' },
        totalCalories: { type: 'number', description: 'Tổng calories' },
        averageSpeed: { type: 'number', description: 'Tốc độ trung bình (km/h)' },
        averagePace: { type: 'number', description: 'Pace trung bình (s/km)' },
        source: { type: 'string', description: 'Nguồn dữ liệu: local hoặc strava' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async getUserStats(@Req() req, @Query('source') source: string = 'local') {
    if (source === 'strava') {
      // Lấy stats đã được sync từ Strava và lưu trong database
      return this.activityService.getSyncedStats(req.user.userId);
    } else if (source === 'synced') {
      return this.activityService.getSyncedStats(req.user.userId);
    }
    return this.activityService.getUserStats(req.user.userId);
  }

  @Post('stats/sync')
  @ApiOperation({ summary: 'Đồng bộ thống kê từ Strava' })
  @ApiResponse({ 
    status: 200, 
    description: 'Đồng bộ thống kê thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 400, description: 'Chưa kết nối với Strava hoặc token hết hạn' })
  async syncStatsFromStrava(@Req() req) {
    return this.activityService.syncStatsFromStrava(req.user.userId);
  }

  @Post('sync-all')
  @ApiOperation({ summary: 'Đồng bộ toàn bộ (activities + statistics) từ Strava' })
  @ApiResponse({ 
    status: 200, 
    description: 'Đồng bộ thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            activities: { type: 'object' },
            stats: { type: 'object' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 400, description: 'Chưa kết nối với Strava hoặc token hết hạn' })
  async syncAllFromStrava(@Req() req) {
    return this.activityService.syncAllFromStrava(req.user.userId);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Lấy hoạt động gần đây' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng hoạt động (mặc định: 5)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách hoạt động gần đây',
    type: [Activity]
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async getRecentActivities(@Req() req, @Query('limit') limit: number = 5) {
    return this.activityService.getRecentActivities(req.user.userId, limit);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Lấy hoạt động theo loại' })
  @ApiParam({ name: 'type', enum: ActivityType, description: 'Loại hoạt động' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng hoạt động (mặc định: 10)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách hoạt động theo loại',
    type: [Activity]
  })
  @ApiResponse({ status: 400, description: 'Loại hoạt động không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async getActivitiesByType(
    @Req() req, 
    @Param('type') type: ActivityType, 
    @Query('limit') limit: number = 10
  ) {
    return this.activityService.getActivitiesByTypeFromDB(req.user.userId, type, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy hoạt động theo ID' })
  @ApiParam({ name: 'id', description: 'ID của hoạt động' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thông tin hoạt động',
    type: Activity
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập hoạt động này' })
  @ApiResponse({ status: 404, description: 'Hoạt động không tồn tại' })
  async findOne(@Req() req, @Param('id') id: string): Promise<Activity> {
    return this.activityService.findOne(req.user.userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật hoạt động' })
  @ApiParam({ name: 'id', description: 'ID của hoạt động' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cập nhật thành công',
    type: Activity
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật hoạt động này' })
  @ApiResponse({ status: 404, description: 'Hoạt động không tồn tại' })
  async update(
    @Req() req, 
    @Param('id') id: string, 
    @Body() updateActivityDto: UpdateActivityDto
  ): Promise<Activity> {
    return this.activityService.update(req.user.userId, id, updateActivityDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa hoạt động (xóa mềm)' })
  @ApiParam({ name: 'id', description: 'ID của hoạt động' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa hoạt động này' })
  @ApiResponse({ status: 404, description: 'Hoạt động không tồn tại' })
  async remove(@Req() req, @Param('id') id: string): Promise<void> {
    return this.activityService.remove(req.user.userId, id);
  }
}
