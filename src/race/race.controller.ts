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
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiParam, 
  ApiQuery 
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { RaceService } from './race.service';
import { RaceParticipantService } from './services/race-participant.service';
import { RaceResultService } from './services/race-result.service';
import { CreateRaceDto } from './dto/create-race.dto';
import { UpdateRaceDto } from './dto/update-race.dto';
import { QueryRaceDto } from './dto/query-race.dto';
import { RegisterRaceDto } from './dto/register-race.dto';
import { Race, RaceType } from './entities/race.entity';
import { RaceParticipant, ParticipantStatus, PaymentStatus } from './entities/race-participant.entity';
import { RaceResult, ResultStatus, ResultSource } from './entities/race-result.entity';

@ApiTags('🏁 Quản lý giải chạy')
@Controller('races')
@ApiBearerAuth('JWT-auth')
export class RaceController {
  constructor(
    private readonly raceService: RaceService,
    private readonly participantService: RaceParticipantService,
    private readonly resultService: RaceResultService,
  ) {}

  /**
   * Tạo giải chạy mới
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Tạo giải chạy mới',
    description: 'Tạo một giải chạy mới trong hệ thống'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Tạo giải chạy thành công',
    type: Race
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async create(@Body() createRaceDto: CreateRaceDto, @Req() req: any): Promise<Race> {
    return this.raceService.create(createRaceDto, req.user.userId);
  }

  /**
   * Lấy danh sách giải chạy với phân trang và filter
   */
  @Get()
  @Public()
  @ApiOperation({ 
    summary: 'Lấy danh sách giải chạy',
    description: 'Lấy danh sách giải chạy với phân trang và các bộ lọc'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lấy danh sách giải chạy thành công',
    schema: {
      type: 'object',
      properties: {
        races: {
          type: 'array',
          items: { $ref: '#/components/schemas/Race' }
        },
        total: { type: 'number', description: 'Tổng số giải chạy' },
        page: { type: 'number', description: 'Trang hiện tại' },
        limit: { type: 'number', description: 'Số lượng mỗi trang' },
        totalPages: { type: 'number', description: 'Tổng số trang' }
      }
    }
  })
  async findAll(@Query() queryDto: QueryRaceDto) {
    return this.raceService.findAll(queryDto);
  }

  /**
   * Lấy thống kê tổng quan về giải chạy
   */
  @Get('stats/overview')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy thống kê tổng quan',
    description: 'Lấy thống kê tổng quan về tất cả giải chạy trong hệ thống'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lấy thống kê thành công',
    schema: {
      type: 'object',
      properties: {
        totalRaces: { type: 'number', description: 'Tổng số giải chạy' },
        activeRaces: { type: 'number', description: 'Số giải chạy đang hoạt động' },
        completedRaces: { type: 'number', description: 'Số giải chạy đã hoàn thành' },
        upcomingRaces: { type: 'number', description: 'Số giải chạy sắp diễn ra' },
        totalParticipants: { type: 'number', description: 'Tổng số người tham gia' },
        totalRevenue: { type: 'number', description: 'Tổng doanh thu' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async getOverallStats() {
    return this.raceService.getOverallStats();
  }

  /**
   * Tìm kiếm giải chạy
   */
  @Get('search')
  @Public()
  @ApiOperation({ 
    summary: 'Tìm kiếm giải chạy',
    description: 'Tìm kiếm giải chạy theo từ khóa'
  })
  @ApiQuery({ name: 'q', required: true, description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng kết quả (mặc định: 10)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Kết quả tìm kiếm',
    type: [Race]
  })
  @ApiResponse({ status: 400, description: 'Thiếu từ khóa tìm kiếm' })
  async search(@Query('q') searchTerm: string, @Query('limit') limit: number = 10) {
    if (!searchTerm) {
      throw new Error('Từ khóa tìm kiếm không được để trống');
    }
    return this.raceService.search(searchTerm, limit);
  }

  /**
   * Lấy giải chạy theo loại
   */
  @Get('type/:type')
  @Public()
  @ApiOperation({ 
    summary: 'Lấy giải chạy theo loại',
    description: 'Lấy danh sách giải chạy theo loại cụ thể'
  })
  @ApiParam({ name: 'type', enum: RaceType, description: 'Loại giải chạy' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng kết quả (mặc định: 10)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách giải chạy theo loại',
    type: [Race]
  })
  @ApiResponse({ status: 400, description: 'Loại giải chạy không hợp lệ' })
  async findByType(@Param('type') type: RaceType, @Query('limit') limit: number = 10) {
    return this.raceService.findByType(type, limit);
  }

  /**
   * Lấy giải chạy theo câu lạc bộ
   */
  @Get('club/:clubId')
  @Public()
  @ApiOperation({ 
    summary: 'Lấy giải chạy theo câu lạc bộ',
    description: 'Lấy danh sách giải chạy của một câu lạc bộ cụ thể'
  })
  @ApiParam({ name: 'clubId', description: 'ID của câu lạc bộ' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng kết quả (mặc định: 10)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách giải chạy theo câu lạc bộ',
    type: [Race]
  })
  @ApiResponse({ status: 404, description: 'Câu lạc bộ không tồn tại' })
  async findByClub(@Param('clubId') clubId: string, @Query('limit') limit: number = 10) {
    return this.raceService.findByClub(clubId, limit);
  }

  /**
   * Lấy giải chạy sắp diễn ra
   */
  @Get('upcoming')
  @Public()
  @ApiOperation({ 
    summary: 'Lấy giải chạy sắp diễn ra',
    description: 'Lấy danh sách giải chạy sắp diễn ra'
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng kết quả (mặc định: 10)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách giải chạy sắp diễn ra',
    type: [Race]
  })
  async getUpcoming(@Query('limit') limit: number = 10) {
    return this.raceService.getUpcoming(limit);
  }

  /**
   * Lấy giải chạy theo mã
   */
  @Get('code/:raceCode')
  @Public()
  @ApiOperation({ 
    summary: 'Lấy giải chạy theo mã',
    description: 'Lấy thông tin giải chạy theo mã duy nhất'
  })
  @ApiParam({ name: 'raceCode', description: 'Mã giải chạy' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thông tin giải chạy',
    type: Race
  })
  @ApiResponse({ status: 404, description: 'Giải chạy không tồn tại' })
  async findByCode(@Param('raceCode') raceCode: string): Promise<Race> {
    return this.raceService.findByCode(raceCode);
  }

  /**
   * Lấy giải chạy theo ID
   */
  @Get(':id')
  @Public()
  @ApiOperation({ 
    summary: 'Lấy giải chạy theo ID',
    description: 'Lấy thông tin chi tiết của một giải chạy'
  })
  @ApiParam({ name: 'id', description: 'ID của giải chạy' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thông tin giải chạy',
    type: Race
  })
  @ApiResponse({ status: 404, description: 'Giải chạy không tồn tại' })
  async findOne(@Param('id') id: string): Promise<Race> {
    return this.raceService.findOne(id);
  }

  /**
   * Cập nhật giải chạy
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Cập nhật giải chạy',
    description: 'Cập nhật thông tin của một giải chạy'
  })
  @ApiParam({ name: 'id', description: 'ID của giải chạy' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cập nhật giải chạy thành công',
    type: Race
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền chỉnh sửa' })
  @ApiResponse({ status: 404, description: 'Giải chạy không tồn tại' })
  async update(
    @Param('id') id: string, 
    @Body() updateRaceDto: UpdateRaceDto,
    @Req() req: any
  ): Promise<Race> {
    return this.raceService.update(id, updateRaceDto, req.user.userId);
  }

  /**
   * Công bố giải chạy
   */
  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Công bố giải chạy',
    description: 'Công bố giải chạy để mọi người có thể xem'
  })
  @ApiParam({ name: 'id', description: 'ID của giải chạy' })
  @ApiResponse({ 
    status: 200, 
    description: 'Công bố giải chạy thành công',
    type: Race
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền công bố' })
  @ApiResponse({ status: 404, description: 'Giải chạy không tồn tại' })
  async publish(@Param('id') id: string, @Req() req: any): Promise<Race> {
    return this.raceService.publish(id, req.user.userId);
  }

  /**
   * Mở đăng ký
   */
  @Patch(':id/open-registration')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Mở đăng ký',
    description: 'Mở đăng ký cho giải chạy'
  })
  @ApiParam({ name: 'id', description: 'ID của giải chạy' })
  @ApiResponse({ 
    status: 200, 
    description: 'Mở đăng ký thành công',
    type: Race
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền mở đăng ký' })
  @ApiResponse({ status: 404, description: 'Giải chạy không tồn tại' })
  async openRegistration(@Param('id') id: string, @Req() req: any): Promise<Race> {
    return this.raceService.openRegistration(id, req.user.userId);
  }

  /**
   * Đóng đăng ký
   */
  @Patch(':id/close-registration')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Đóng đăng ký',
    description: 'Đóng đăng ký cho giải chạy'
  })
  @ApiParam({ name: 'id', description: 'ID của giải chạy' })
  @ApiResponse({ 
    status: 200, 
    description: 'Đóng đăng ký thành công',
    type: Race
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền đóng đăng ký' })
  @ApiResponse({ status: 404, description: 'Giải chạy không tồn tại' })
  async closeRegistration(@Param('id') id: string, @Req() req: any): Promise<Race> {
    return this.raceService.closeRegistration(id, req.user.userId);
  }

  /**
   * Kích hoạt giải chạy
   */
  @Patch(':id/activate')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Kích hoạt giải chạy',
    description: 'Kích hoạt giải chạy để bắt đầu'
  })
  @ApiParam({ name: 'id', description: 'ID của giải chạy' })
  @ApiResponse({ 
    status: 200, 
    description: 'Kích hoạt giải chạy thành công',
    type: Race
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền kích hoạt' })
  @ApiResponse({ status: 404, description: 'Giải chạy không tồn tại' })
  async activate(@Param('id') id: string, @Req() req: any): Promise<Race> {
    return this.raceService.activate(id, req.user.userId);
  }

  /**
   * Hoàn thành giải chạy
   */
  @Patch(':id/complete')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Hoàn thành giải chạy',
    description: 'Đánh dấu giải chạy đã hoàn thành'
  })
  @ApiParam({ name: 'id', description: 'ID của giải chạy' })
  @ApiResponse({ 
    status: 200, 
    description: 'Hoàn thành giải chạy thành công',
    type: Race
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền hoàn thành' })
  @ApiResponse({ status: 404, description: 'Giải chạy không tồn tại' })
  async complete(@Param('id') id: string, @Req() req: any): Promise<Race> {
    return this.raceService.complete(id, req.user.userId);
  }

  /**
   * Hủy giải chạy
   */
  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Hủy giải chạy',
    description: 'Hủy giải chạy với lý do cụ thể'
  })
  @ApiParam({ name: 'id', description: 'ID của giải chạy' })
  @ApiResponse({ 
    status: 200, 
    description: 'Hủy giải chạy thành công',
    type: Race
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền hủy' })
  @ApiResponse({ status: 404, description: 'Giải chạy không tồn tại' })
  async cancel(
    @Param('id') id: string, 
    @Body('reason') reason: string,
    @Req() req: any
  ): Promise<Race> {
    return this.raceService.cancel(id, reason, req.user.userId);
  }

  /**
   * Đăng ký tham gia giải chạy
   */
  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Đăng ký tham gia giải chạy',
    description: 'Đăng ký tham gia một giải chạy'
  })
  @ApiParam({ name: 'id', description: 'ID của giải chạy' })
  @ApiResponse({ 
    status: 201, 
    description: 'Đăng ký tham gia thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        raceId: { type: 'string' },
        raceName: { type: 'string' },
        participantId: { type: 'string' },
        registrationDate: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Không thể đăng ký tham gia' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Giải chạy không tồn tại' })
  @ApiResponse({ status: 409, description: 'Đã đăng ký tham gia giải chạy này' })
  async register(
    @Param('id') id: string, 
    @Body() registerDto: RegisterRaceDto,
    @Req() req: any
  ) {
    return this.raceService.registerParticipant(id, req.user.userId, registerDto);
  }

  /**
   * Hủy đăng ký tham gia
   */
  @Delete(':id/unregister')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Hủy đăng ký tham gia',
    description: 'Hủy đăng ký tham gia một giải chạy'
  })
  @ApiParam({ name: 'id', description: 'ID của giải chạy' })
  @ApiResponse({ 
    status: 200, 
    description: 'Hủy đăng ký thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Không thể hủy đăng ký' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Giải chạy không tồn tại' })
  async unregister(@Param('id') id: string, @Req() req: any) {
    await this.raceService.unregisterParticipant(id, req.user.userId);
    return { message: 'Hủy đăng ký thành công' };
  }

  /**
   * Lấy thống kê giải chạy
   */
  @Get(':id/stats')
  @Public()
  @ApiOperation({ 
    summary: 'Lấy thống kê giải chạy',
    description: 'Lấy thống kê chi tiết của một giải chạy'
  })
  @ApiParam({ name: 'id', description: 'ID của giải chạy' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lấy thống kê thành công',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        status: { type: 'string' },
        totalParticipants: { type: 'number' },
        maxParticipants: { type: 'number' },
        registrationFee: { type: 'number' },
        totalRevenue: { type: 'number' },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        createdAt: { type: 'string', format: 'date-time' },
        stats: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Giải chạy không tồn tại' })
  async getStats(@Param('id') id: string) {
    return this.raceService.getStats(id);
  }

  /**
   * Xóa giải chạy
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Xóa giải chạy',
    description: 'Xóa giải chạy (soft delete)'
  })
  @ApiParam({ name: 'id', description: 'ID của giải chạy' })
  @ApiResponse({ 
    status: 200, 
    description: 'Xóa giải chạy thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa' })
  @ApiResponse({ status: 404, description: 'Giải chạy không tồn tại' })
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.raceService.remove(id, req.user.userId);
    return { message: 'Xóa giải chạy thành công' };
  }

  // ==================== PARTICIPANT ENDPOINTS ====================

  /**
   * Lấy danh sách người tham gia
   */
  @Get(':id/participants')
  @Public()
  @ApiOperation({ 
    summary: 'Lấy danh sách người tham gia',
    description: 'Lấy danh sách người tham gia của một giải chạy'
  })
  @ApiParam({ name: 'id', description: 'ID của giải chạy' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách người tham gia',
    type: [RaceParticipant]
  })
  @ApiResponse({ status: 404, description: 'Giải chạy không tồn tại' })
  async getParticipants(@Param('id') id: string) {
    return this.participantService.findByRace(id);
  }

  /**
   * Lấy thống kê người tham gia
   */
  @Get(':id/participants/stats')
  @Public()
  @ApiOperation({ 
    summary: 'Lấy thống kê người tham gia',
    description: 'Lấy thống kê chi tiết về người tham gia'
  })
  @ApiParam({ name: 'id', description: 'ID của giải chạy' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thống kê người tham gia',
    schema: {
      type: 'object',
      properties: {
        totalParticipants: { type: 'number' },
        confirmedParticipants: { type: 'number' },
        completedParticipants: { type: 'number' },
        withdrawnParticipants: { type: 'number' },
        totalRevenue: { type: 'number' },
        categoryBreakdown: { type: 'object' },
        paymentStatusBreakdown: { type: 'object' }
      }
    }
  })
  async getParticipantStats(@Param('id') id: string) {
    return this.participantService.getStats(id);
  }

  /**
   * Lấy bảng xếp hạng người tham gia
   */
  @Get(':id/participants/leaderboard')
  @Public()
  @ApiOperation({ 
    summary: 'Lấy bảng xếp hạng',
    description: 'Lấy bảng xếp hạng người tham gia theo thời gian hoàn thành'
  })
  @ApiParam({ name: 'id', description: 'ID của giải chạy' })
  @ApiQuery({ name: 'category', required: false, description: 'Danh mục xếp hạng' })
  @ApiResponse({ 
    status: 200, 
    description: 'Bảng xếp hạng',
    type: [RaceParticipant]
  })
  async getParticipantLeaderboard(
    @Param('id') id: string,
    @Query('category') category?: string
  ) {
    return this.participantService.getLeaderboard(id, category);
  }

  /**
   * Xác nhận người tham gia
   */
  @Patch(':id/participants/:participantId/confirm')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Xác nhận người tham gia',
    description: 'Xác nhận người tham gia đã đăng ký'
  })
  @ApiParam({ name: 'id', description: 'ID của giải chạy' })
  @ApiParam({ name: 'participantId', description: 'ID của người tham gia' })
  @ApiResponse({ 
    status: 200, 
    description: 'Xác nhận thành công',
    type: RaceParticipant
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người tham gia' })
  async confirmParticipant(
    @Param('id') id: string,
    @Param('participantId') participantId: string
  ) {
    return this.participantService.confirm(participantId);
  }

  /**
   * Cập nhật trạng thái thanh toán
   */
  @Patch(':id/participants/:participantId/payment')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Cập nhật trạng thái thanh toán',
    description: 'Cập nhật trạng thái thanh toán của người tham gia'
  })
  @ApiParam({ name: 'id', description: 'ID của giải chạy' })
  @ApiParam({ name: 'participantId', description: 'ID của người tham gia' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cập nhật thành công',
    type: RaceParticipant
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người tham gia' })
  async updatePaymentStatus(
    @Param('id') id: string,
    @Param('participantId') participantId: string,
    @Body('paymentStatus') paymentStatus: PaymentStatus,
    @Body('transactionId') transactionId?: string
  ) {
    return this.participantService.updatePaymentStatus(participantId, paymentStatus, transactionId);
  }

  // ==================== RESULT ENDPOINTS ====================

  /**
   * Lấy kết quả của người tham gia
   */
  @Get(':id/participants/:participantId/result')
  @Public()
  @ApiOperation({ 
    summary: 'Lấy kết quả người tham gia',
    description: 'Lấy kết quả của một người tham gia cụ thể'
  })
  @ApiParam({ name: 'id', description: 'ID của giải chạy' })
  @ApiParam({ name: 'participantId', description: 'ID của người tham gia' })
  @ApiResponse({ 
    status: 200, 
    description: 'Kết quả người tham gia',
    type: RaceResult
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy kết quả' })
  async getParticipantResult(
    @Param('id') id: string,
    @Param('participantId') participantId: string
  ) {
    return this.resultService.findByParticipant(id, participantId);
  }

  /**
   * Tạo kết quả mới
   */
  @Post(':id/participants/:participantId/result')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Tạo kết quả mới',
    description: 'Tạo kết quả cho người tham gia'
  })
  @ApiParam({ name: 'id', description: 'ID của giải chạy' })
  @ApiParam({ name: 'participantId', description: 'ID của người tham gia' })
  @ApiResponse({ 
    status: 201, 
    description: 'Tạo kết quả thành công',
    type: RaceResult
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người tham gia' })
  async createResult(
    @Param('id') id: string,
    @Param('participantId') participantId: string,
    @Body() resultData: any
  ) {
    return this.resultService.create(id, participantId, resultData);
  }

  /**
   * Cập nhật kết quả
   */
  @Patch(':id/results/:resultId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Cập nhật kết quả',
    description: 'Cập nhật kết quả của người tham gia'
  })
  @ApiParam({ name: 'id', description: 'ID của giải chạy' })
  @ApiParam({ name: 'resultId', description: 'ID của kết quả' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cập nhật thành công',
    type: RaceResult
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy kết quả' })
  async updateResult(
    @Param('id') id: string,
    @Param('resultId') resultId: string,
    @Body() updateData: any
  ) {
    return this.resultService.update(resultId, updateData);
  }

  /**
   * Xác nhận kết quả
   */
  @Patch(':id/results/:resultId/verify')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Xác nhận kết quả',
    description: 'Xác nhận kết quả của người tham gia'
  })
  @ApiParam({ name: 'id', description: 'ID của giải chạy' })
  @ApiParam({ name: 'resultId', description: 'ID của kết quả' })
  @ApiResponse({ 
    status: 200, 
    description: 'Xác nhận thành công',
    type: RaceResult
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy kết quả' })
  async verifyResult(
    @Param('id') id: string,
    @Param('resultId') resultId: string,
    @Req() req: any
  ) {
    return this.resultService.verify(resultId, req.user.userId);
  }

  /**
   * Lấy bảng xếp hạng kết quả
   */
  @Get(':id/results/leaderboard')
  @Public()
  @ApiOperation({ 
    summary: 'Lấy bảng xếp hạng kết quả',
    description: 'Lấy bảng xếp hạng kết quả của giải chạy'
  })
  @ApiParam({ name: 'id', description: 'ID của giải chạy' })
  @ApiQuery({ name: 'category', required: false, description: 'Danh mục xếp hạng' })
  @ApiResponse({ 
    status: 200, 
    description: 'Bảng xếp hạng kết quả',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          rank: { type: 'number' },
          participantId: { type: 'string' },
          userId: { type: 'string' },
          bibNumber: { type: 'string' },
          finishTime: { type: 'number' },
          distance: { type: 'number' },
          averagePace: { type: 'number' },
          category: { type: 'string' },
          isCompleted: { type: 'boolean' }
        }
      }
    }
  })
  async getResultLeaderboard(
    @Param('id') id: string,
    @Query('category') category?: string
  ) {
    return this.resultService.getLeaderboard(id, category);
  }

  /**
   * Lấy thống kê kết quả
   */
  @Get(':id/results/stats')
  @Public()
  @ApiOperation({ 
    summary: 'Lấy thống kê kết quả',
    description: 'Lấy thống kê chi tiết về kết quả giải chạy'
  })
  @ApiParam({ name: 'id', description: 'ID của giải chạy' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thống kê kết quả',
    schema: {
      type: 'object',
      properties: {
        totalResults: { type: 'number' },
        verifiedResults: { type: 'number' },
        pendingResults: { type: 'number' },
        averageFinishTime: { type: 'number' },
        fastestTime: { type: 'number' },
        slowestTime: { type: 'number' },
        completionRate: { type: 'number' }
      }
    }
  })
  async getResultStats(@Param('id') id: string) {
    return this.resultService.getStats(id);
  }
}
