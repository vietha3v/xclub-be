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
import { MedalTemplateService } from './medal-template.service';
import { CreateMedalTemplateDto } from './dto/create-medal-template.dto';
import { UpdateMedalTemplateDto } from './dto/update-medal-template.dto';
import { QueryMedalTemplateDto } from './dto/query-medal-template.dto';
import { MedalTemplate } from './entities/medal-template.entity';

@ApiTags('🏅 Quản lý mẫu huy chương')
@Controller('medal-templates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MedalTemplateController {
  constructor(private readonly medalTemplateService: MedalTemplateService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo mẫu huy chương mới' })
  @ApiResponse({ 
    status: 201, 
    description: 'Tạo mẫu huy chương thành công',
    type: MedalTemplate
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async create(@Req() req, @Body() createMedalTemplateDto: CreateMedalTemplateDto) {
    return this.medalTemplateService.create(req.user.userId, createMedalTemplateDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách mẫu huy chương với phân trang và filter' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Trang hiện tại' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng mỗi trang' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Tìm kiếm theo tên' })
  @ApiQuery({ name: 'type', required: false, enum: ['gold', 'silver', 'bronze', 'participation', 'special'], description: 'Loại huy chương' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'ID người tạo' })
  @ApiQuery({ name: 'isPublic', required: false, type: Boolean, description: 'Chỉ mẫu công khai' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Chỉ mẫu hoạt động' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách mẫu huy chương',
    schema: {
      type: 'object',
      properties: {
        templates: { type: 'array', items: { $ref: '#/components/schemas/MedalTemplate' } },
        total: { type: 'number', description: 'Tổng số mẫu' },
        page: { type: 'number', description: 'Trang hiện tại' },
        limit: { type: 'number', description: 'Số lượng mỗi trang' },
        totalPages: { type: 'number', description: 'Tổng số trang' }
      }
    }
  })
  async findAll(@Req() req, @Query() queryDto: QueryMedalTemplateDto) {
    // Tự động set userId từ JWT token để chỉ lấy huy chương của user đang đăng nhập
    queryDto.userId = req.user.userId;
    return this.medalTemplateService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin mẫu huy chương theo ID' })
  @ApiParam({ name: 'id', description: 'ID mẫu huy chương' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thông tin mẫu huy chương',
    type: MedalTemplate
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy mẫu huy chương' })
  async findOne(@Param('id') id: string) {
    return this.medalTemplateService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật mẫu huy chương' })
  @ApiParam({ name: 'id', description: 'ID mẫu huy chương' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cập nhật mẫu huy chương thành công',
    type: MedalTemplate
  })
  @ApiResponse({ status: 403, description: 'Không có quyền chỉnh sửa mẫu này' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy mẫu huy chương' })
  async update(
    @Req() req, 
    @Param('id') id: string, 
    @Body() updateMedalTemplateDto: UpdateMedalTemplateDto
  ) {
    return this.medalTemplateService.update(req.user.userId, id, updateMedalTemplateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa mẫu huy chương' })
  @ApiParam({ name: 'id', description: 'ID mẫu huy chương' })
  @ApiResponse({ status: 200, description: 'Xóa mẫu huy chương thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa mẫu này' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy mẫu huy chương' })
  async remove(@Req() req, @Param('id') id: string) {
    return this.medalTemplateService.remove(req.user.userId, id);
  }

}
