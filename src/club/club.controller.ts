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
import { ClubService } from './club.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { QueryClubDto } from './dto/query-club.dto';
import { Club, ClubStatus } from './entities/club.entity';

@ApiTags('🏢 Quản lý câu lạc bộ')
@Controller('clubs')
@ApiBearerAuth('JWT-auth')
export class ClubController {
  constructor(private readonly clubService: ClubService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo câu lạc bộ mới' })
  @ApiResponse({ 
    status: 201, 
    description: 'Tạo câu lạc bộ thành công',
    type: Club
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async create(@Body() createClubDto: CreateClubDto, @Req() req: any): Promise<Club> {
    return this.clubService.create(createClubDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách câu lạc bộ với phân trang và filter' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách câu lạc bộ',
    schema: {
      type: 'object',
      properties: {
        clubs: { type: 'array', items: { $ref: '#/components/schemas/Club' } },
        total: { type: 'number', description: 'Tổng số câu lạc bộ' },
        page: { type: 'number', description: 'Trang hiện tại' },
        limit: { type: 'number', description: 'Số lượng mỗi trang' }
      }
    }
  })
  async findAll(@Query() queryDto: QueryClubDto) {
    return this.clubService.findAll(queryDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Lấy thống kê câu lạc bộ' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thống kê câu lạc bộ',
    schema: {
      type: 'object',
      properties: {
        totalClubs: { type: 'number', description: 'Tổng số câu lạc bộ' },
        activeClubs: { type: 'number', description: 'Số câu lạc bộ hoạt động' },
        pendingClubs: { type: 'number', description: 'Số câu lạc bộ chờ duyệt' },
        runningClubs: { type: 'number', description: 'Số câu lạc bộ chạy bộ' }
      }
    }
  })
  async getStats() {
    return this.clubService.getStats();
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm câu lạc bộ' })
  @ApiQuery({ name: 'q', required: true, description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng kết quả (mặc định: 10)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Kết quả tìm kiếm',
    type: [Club]
  })
  @ApiResponse({ status: 400, description: 'Thiếu từ khóa tìm kiếm' })
  async search(@Query('q') searchTerm: string, @Query('limit') limit: number = 10) {
    if (!searchTerm) {
      throw new Error('Từ khóa tìm kiếm không được để trống');
    }
    return this.clubService.search(searchTerm, limit);
  }

  @Get('city/:city')
  @ApiOperation({ summary: 'Lấy câu lạc bộ theo thành phố' })
  @ApiParam({ name: 'city', description: 'Tên thành phố' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng kết quả (mặc định: 10)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách câu lạc bộ theo thành phố',
    type: [Club]
  })
  async findByCity(@Param('city') city: string, @Query('limit') limit: number = 10) {
    return this.clubService.findByCity(city, limit);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Lấy câu lạc bộ theo loại' })
  @ApiParam({ name: 'type', description: 'Loại câu lạc bộ' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng kết quả (mặc định: 10)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách câu lạc bộ theo loại',
    type: [Club]
  })
  async findByType(@Param('type') type: string, @Query('limit') limit: number = 10) {
    return this.clubService.findByType(type, limit);
  }

  @Get('code/:clubCode')
  @ApiOperation({ summary: 'Lấy câu lạc bộ theo mã' })
  @ApiParam({ name: 'clubCode', description: 'Mã câu lạc bộ' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thông tin câu lạc bộ',
    type: Club
  })
  @ApiResponse({ status: 404, description: 'Câu lạc bộ không tồn tại' })
  async findByCode(@Param('clubCode') clubCode: string): Promise<Club> {
    return this.clubService.findByCode(clubCode);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy câu lạc bộ theo ID' })
  @ApiParam({ name: 'id', description: 'ID của câu lạc bộ' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thông tin câu lạc bộ',
    type: Club
  })
  @ApiResponse({ status: 404, description: 'Câu lạc bộ không tồn tại' })
  async findOne(@Param('id') id: string): Promise<Club> {
    return this.clubService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cập nhật câu lạc bộ' })
  @ApiParam({ name: 'id', description: 'ID của câu lạc bộ' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cập nhật thành công',
    type: Club
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Câu lạc bộ không tồn tại' })
  async update(
    @Param('id') id: string, 
    @Body() updateClubDto: UpdateClubDto
  ): Promise<Club> {
    return this.clubService.update(id, updateClubDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Thay đổi trạng thái câu lạc bộ' })
  @ApiParam({ name: 'id', description: 'ID của câu lạc bộ' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thay đổi trạng thái thành công',
    type: Club
  })
  @ApiResponse({ status: 400, description: 'Trạng thái không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Câu lạc bộ không tồn tại' })
  async changeStatus(
    @Param('id') id: string, 
    @Body('status') status: ClubStatus
  ): Promise<Club> {
    return this.clubService.changeStatus(id, status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Xóa câu lạc bộ (xóa mềm)' })
  @ApiParam({ name: 'id', description: 'ID của câu lạc bộ' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Câu lạc bộ không tồn tại' })
  async remove(@Req() req, @Param('id') id: string): Promise<void> {
    return this.clubService.remove(id, req.user.userId);
  }
}
