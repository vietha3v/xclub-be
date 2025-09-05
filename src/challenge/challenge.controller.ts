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
import { Challenge, ChallengeStatus, ChallengeType } from './entities/challenge.entity';

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
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách thử thách',
    schema: {
      type: 'object',
      properties: {
        challenges: { type: 'array', items: { $ref: '#/components/schemas/Challenge' } },
        total: { type: 'number', description: 'Tổng số thử thách' },
        page: { type: 'number', description: 'Trang hiện tại' },
        limit: { type: 'number', description: 'Số lượng mỗi trang' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async findAll(@Query() queryDto: QueryChallengeDto) {
    return this.challengeService.findAll(queryDto);
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

  @Get('club/:clubId')
  @ApiOperation({ summary: 'Lấy thử thách theo câu lạc bộ' })
  @ApiParam({ name: 'clubId', description: 'ID của câu lạc bộ' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng kết quả (mặc định: 10)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách thử thách theo câu lạc bộ',
    type: [Challenge]
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async findByClub(@Param('clubId') clubId: string, @Query('limit') limit: number = 10) {
    return this.challengeService.findByClub(clubId, limit);
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

  @Post(':id/join')
  @ApiOperation({ summary: 'Đăng ký tham gia thử thách' })
  @ApiParam({ name: 'id', description: 'ID của thử thách' })
  @ApiResponse({ 
    status: 200, 
    description: 'Đăng ký thành công',
    type: Challenge
  })
  @ApiResponse({ status: 400, description: 'Không thể đăng ký tham gia' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Thử thách không tồn tại' })
  @ApiResponse({ status: 409, description: 'Đã tham gia thử thách này' })
  async joinChallenge(@Req() req, @Param('id') id: string): Promise<Challenge> {
    return this.challengeService.joinChallenge(id, req.user.userId);
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
