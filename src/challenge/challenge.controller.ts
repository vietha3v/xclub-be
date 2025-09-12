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
import { ChallengeService } from './challenge.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { QueryChallengeDto } from './dto/query-challenge.dto';
import { Challenge, ChallengeStatus, ChallengeType, ChallengeCategory } from './entities/challenge.entity';
import { ChallengeParticipant } from './entities/challenge-participant.entity';

@ApiTags('🏆 Quản lý thử thách')
@Controller('challenges')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo thử thách mới' })
  @ApiResponse({ 
    status: 201, 
    description: 'Tạo thử thách thành công',
    type: Challenge
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async create(@Req() req, @Body() createChallengeDto: CreateChallengeDto): Promise<Challenge> {
    return this.challengeService.create(req.user.userId, createChallengeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách thử thách với phân trang và filter' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Trang hiện tại (mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng mỗi trang (mặc định: 10)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'status', required: false, enum: ChallengeStatus, description: 'Trạng thái thử thách' })
  @ApiQuery({ name: 'type', required: false, enum: ChallengeType, description: 'Loại thử thách' })
  @ApiQuery({ name: 'category', required: false, enum: ChallengeCategory, description: 'Phân loại thử thách' })
  @ApiQuery({ name: 'clubId', required: false, type: String, description: 'ID câu lạc bộ' })
  @ApiQuery({ name: 'eventId', required: false, type: String, description: 'ID sự kiện' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách thử thách',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/Challenge' } },
        total: { type: 'number', description: 'Tổng số thử thách' },
        page: { type: 'number', description: 'Trang hiện tại' },
        limit: { type: 'number', description: 'Số lượng mỗi trang' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async findAll(@Query() queryDto: QueryChallengeDto, @Req() req) {
    return this.challengeService.findAll(queryDto, req.user?.userId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Lấy thống kê thử thách' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thống kê thử thách',
    schema: {
      type: 'object',
      properties: {
        totalChallenges: { type: 'number', description: 'Tổng số thử thách' },
        activeChallenges: { type: 'number', description: 'Số thử thách đang hoạt động' },
        completedChallenges: { type: 'number', description: 'Số thử thách đã hoàn thành' },
        distanceChallenges: { type: 'number', description: 'Số thử thách theo khoảng cách' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async getStats() {
    return this.challengeService.getStats();
  }

  @Get(':id/results')
  @ApiOperation({ summary: 'Lấy kết quả chi tiết thử thách' })
  @ApiParam({ name: 'id', description: 'ID của thử thách' })
  @ApiResponse({ 
    status: 200, 
    description: 'Kết quả chi tiết thử thách',
    schema: {
      type: 'object',
      properties: {
        challenge: { $ref: '#/components/schemas/Challenge' },
        participants: { type: 'array', items: { $ref: '#/components/schemas/ChallengeParticipant' } },
        leaderboard: { type: 'array', items: { $ref: '#/components/schemas/ChallengeLeaderboard' } },
        stats: {
          type: 'object',
          properties: {
            totalParticipants: { type: 'number' },
            completedParticipants: { type: 'number' },
            averageScore: { type: 'number' },
            highestScore: { type: 'number' },
            completionRate: { type: 'number' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Thử thách không tồn tại' })
  async getChallengeResults(@Param('id') id: string) {
    return this.challengeService.getChallengeResults(id);
  }

  @Get(':id/completion-stats')
  @ApiOperation({ summary: 'Lấy thống kê hoàn thành thử thách' })
  @ApiParam({ name: 'id', description: 'ID của thử thách' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thống kê hoàn thành',
    schema: {
      type: 'object',
      properties: {
        totalParticipants: { type: 'number' },
        completedParticipants: { type: 'number' },
        pendingParticipants: { type: 'number' },
        activeParticipants: { type: 'number' },
        completionRate: { type: 'number' },
        averageCompletionTime: { type: 'number' },
        fastestCompletion: { type: 'number' },
        slowestCompletion: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Thử thách không tồn tại' })
  async getCompletionStats(@Param('id') id: string) {
    return this.challengeService.getCompletionStats(id);
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm thử thách' })
  @ApiQuery({ name: 'q', required: true, description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng kết quả (mặc định: 10)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Kết quả tìm kiếm',
    type: [Challenge]
  })
  @ApiResponse({ status: 400, description: 'Thiếu từ khóa tìm kiếm' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async search(@Query('q') searchTerm: string, @Query('limit') limit: number = 10) {
    if (!searchTerm) {
      throw new Error('Từ khóa tìm kiếm không được để trống');
    }
    return this.challengeService.search(searchTerm, limit);
  }


  @Get('type/:type')
  @ApiOperation({ summary: 'Lấy thử thách theo loại' })
  @ApiParam({ name: 'type', description: 'Loại thử thách' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng kết quả (mặc định: 10)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách thử thách theo loại',
    type: [Challenge]
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async findByType(@Param('type') type: ChallengeType, @Query('limit') limit: number = 10) {
    return this.challengeService.findByType(type, limit);
  }

  @Get('code/:challengeCode')
  @ApiOperation({ summary: 'Lấy thử thách theo mã' })
  @ApiParam({ name: 'challengeCode', description: 'Mã thử thách' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thông tin thử thách',
    type: Challenge
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Thử thách không tồn tại' })
  async findByCode(@Param('challengeCode') challengeCode: string): Promise<Challenge> {
    return this.challengeService.findByCode(challengeCode);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thử thách theo ID' })
  @ApiParam({ name: 'id', description: 'ID của thử thách' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thông tin thử thách',
    type: Challenge
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Thử thách không tồn tại' })
  async findOne(@Param('id') id: string): Promise<Challenge> {
    return this.challengeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thử thách' })
  @ApiParam({ name: 'id', description: 'ID của thử thách' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cập nhật thành công',
    type: Challenge
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Thử thách không tồn tại' })
  async update(
    @Param('id') id: string, 
    @Body() updateChallengeDto: UpdateChallengeDto
  ): Promise<Challenge> {
    return this.challengeService.update(id, updateChallengeDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Thay đổi trạng thái thử thách' })
  @ApiParam({ name: 'id', description: 'ID của thử thách' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thay đổi trạng thái thành công',
    type: Challenge
  })
  @ApiResponse({ status: 400, description: 'Trạng thái không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Thử thách không tồn tại' })
  async changeStatus(
    @Param('id') id: string, 
    @Body('status') status: ChallengeStatus
  ): Promise<Challenge> {
    return this.challengeService.changeStatus(id, status);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish thử thách (chuyển từ DRAFT sang UPCOMING/ACTIVE)' })
  @ApiParam({ name: 'id', description: 'ID của thử thách' })
  @ApiResponse({ 
    status: 200, 
    description: 'Publish thử thách thành công',
    type: Challenge
  })
  @ApiResponse({ status: 400, description: 'Không thể publish thử thách' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Thử thách không tồn tại' })
  async publishChallenge(@Req() req, @Param('id') id: string): Promise<Challenge> {
    return this.challengeService.publishChallenge(id, req.user.userId);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Đăng ký tham gia thử thách' })
  @ApiParam({ name: 'id', description: 'ID của thử thách' })
  @ApiResponse({ 
    status: 200, 
    description: 'Đăng ký thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', description: 'Trạng thái đăng ký' },
        requiresApproval: { type: 'boolean', description: 'Có cần xét duyệt không' },
        message: { type: 'string', description: 'Thông báo kết quả' },
        participantId: { type: 'string', description: 'ID người tham gia' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Không thể đăng ký tham gia' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Thử thách không tồn tại' })
  @ApiResponse({ status: 409, description: 'Đã tham gia thử thách này' })
  async joinChallenge(@Req() req, @Param('id') id: string, @Body() body: { autoApprovalPassword?: string } = {}) {
    return this.challengeService.joinChallenge(id, req.user.userId, body.autoApprovalPassword);
  }

  @Post(':id/leave')
  @ApiOperation({ summary: 'Rút lui khỏi thử thách' })
  @ApiParam({ name: 'id', description: 'ID của thử thách' })
  @ApiResponse({ 
    status: 200, 
    description: 'Rút lui thành công',
    type: Challenge
  })
  @ApiResponse({ status: 400, description: 'Không thể rút lui' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Thử thách không tồn tại' })
  async leaveChallenge(@Req() req, @Param('id') id: string): Promise<Challenge> {
    return this.challengeService.leaveChallenge(id, req.user.userId);
  }

  @Post(':id/participants/:userId/approve')
  @ApiOperation({ summary: 'Duyệt người tham gia thử thách' })
  @ApiParam({ name: 'id', description: 'ID của thử thách' })
  @ApiParam({ name: 'userId', description: 'ID của người dùng' })
  @ApiResponse({ 
    status: 200, 
    description: 'Duyệt thành công',
    type: Challenge
  })
  @ApiResponse({ status: 400, description: 'Không thể duyệt' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Thử thách hoặc người tham gia không tồn tại' })
  async approveParticipant(@Req() req, @Param('id') id: string, @Param('userId') userId: string): Promise<Challenge> {
    return this.challengeService.approveParticipant(id, userId, req.user.userId);
  }

  @Post(':id/participants/:userId/reject')
  @ApiOperation({ summary: 'Từ chối người tham gia thử thách' })
  @ApiParam({ name: 'id', description: 'ID của thử thách' })
  @ApiParam({ name: 'userId', description: 'ID của người dùng' })
  @ApiResponse({ 
    status: 200, 
    description: 'Từ chối thành công',
    type: Challenge
  })
  @ApiResponse({ status: 400, description: 'Không thể từ chối' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Thử thách hoặc người tham gia không tồn tại' })
  async rejectParticipant(@Req() req, @Param('id') id: string, @Param('userId') userId: string): Promise<Challenge> {
    return this.challengeService.rejectParticipant(id, userId, req.user.userId);
  }

  @Get(':id/participants/pending')
  @ApiOperation({ summary: 'Lấy danh sách người tham gia chờ duyệt' })
  @ApiParam({ name: 'id', description: 'ID của thử thách' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách người tham gia chờ duyệt',
    type: [ChallengeParticipant]
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Thử thách không tồn tại' })
  async getPendingParticipants(@Param('id') id: string) {
    return this.challengeService.getPendingParticipants(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa thử thách (xóa mềm)' })
  @ApiParam({ name: 'id', description: 'ID của thử thách' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Thử thách không tồn tại' })
  async remove(@Req() req, @Param('id') id: string): Promise<void> {
    return this.challengeService.remove(id, req.user.userId);
  }
}
