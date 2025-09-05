import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Request, 
  HttpStatus,
  HttpCode,
  Logger 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiBody 
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SyncActivityService } from '../services/sync-activity.service';
import { SyncActivityDto, SyncActivityResponseDto } from '../dto/sync-activity.dto';

@ApiTags('Integration - Sync Activities')
@Controller('integrations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SyncActivityController {
  private readonly logger = new Logger(SyncActivityController.name);

  constructor(private readonly syncActivityService: SyncActivityService) {}

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đồng bộ hoạt động thủ công',
    description: 'Người dùng có thể bấm nút để đồng bộ hoạt động từ Strava/Garmin ngay lập tức'
  })
  @ApiBody({
    type: SyncActivityDto,
    description: 'Thông tin đồng bộ hoạt động'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Đồng bộ thành công',
    type: SyncActivityResponseDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ hoặc token hết hạn'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa đăng nhập hoặc token không hợp lệ'
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Lỗi server hoặc lỗi kết nối với nền tảng bên ngoài'
  })
  async syncActivities(
    @Body() syncDto: SyncActivityDto,
    @Request() req: any
  ): Promise<SyncActivityResponseDto> {
    try {
      this.logger.log(`User ${req.user.userId} yêu cầu đồng bộ hoạt động`);

      // Đảm bảo userId từ JWT token
      syncDto.userId = req.user.userId;

      // Gọi service đồng bộ
      const result = await this.syncActivityService.syncUserActivities(syncDto);

      this.logger.log(`Đồng bộ hoàn thành cho user ${req.user.userId}: ${result.message}`);

      return result;

    } catch (error) {
      this.logger.error(`Lỗi API đồng bộ hoạt động: ${error.message}`, error.stack);
      
      return {
        success: false,
        newActivities: 0,
        syncTime: new Date().toISOString(),
        message: 'Đồng bộ thất bại do lỗi server',
        error: error.message,
      };
    }
  }

  @Post('sync/strava')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đồng bộ hoạt động từ Strava',
    description: 'Đồng bộ hoạt động cụ thể từ Strava'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Đồng bộ thành công',
    type: SyncActivityResponseDto
  })
  async syncFromStrava(
    @Body() syncDto: SyncActivityDto,
    @Request() req: any
  ): Promise<SyncActivityResponseDto> {
    syncDto.userId = req.user.userId;
    syncDto.platform = 'strava';
    
    return this.syncActivityService.syncUserActivities(syncDto);
  }

  @Post('sync/garmin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đồng bộ hoạt động từ Garmin',
    description: 'Đồng bộ hoạt động cụ thể từ Garmin'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Đồng bộ thành công',
    type: SyncActivityResponseDto
  })
  async syncFromGarmin(
    @Body() syncDto: SyncActivityDto,
    @Request() req: any
  ): Promise<SyncActivityResponseDto> {
    syncDto.userId = req.user.userId;
    syncDto.platform = 'garmin';
    
    return this.syncActivityService.syncUserActivities(syncDto);
  }
}
