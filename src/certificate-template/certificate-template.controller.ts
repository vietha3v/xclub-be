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
import { CertificateTemplateService } from './certificate-template.service';
import { CreateCertificateTemplateDto } from './dto/create-certificate-template.dto';
import { UpdateCertificateTemplateDto } from './dto/update-certificate-template.dto';
import { QueryCertificateTemplateDto } from './dto/query-certificate-template.dto';
import { CertificateTemplate } from './entities/certificate-template.entity';

@ApiTags('📜 Quản lý mẫu giấy chứng nhận')
@Controller('certificate-templates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CertificateTemplateController {
  constructor(private readonly certificateTemplateService: CertificateTemplateService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo mẫu giấy chứng nhận mới' })
  @ApiResponse({ 
    status: 201, 
    description: 'Tạo mẫu giấy chứng nhận thành công',
    type: CertificateTemplate
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async create(@Req() req, @Body() createCertificateTemplateDto: CreateCertificateTemplateDto) {
    return this.certificateTemplateService.create(req.user.userId, createCertificateTemplateDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách mẫu giấy chứng nhận với phân trang và filter' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Trang hiện tại' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng mỗi trang' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Tìm kiếm theo tên' })
  @ApiQuery({ name: 'type', required: false, enum: ['completion', 'achievement', 'participation', 'winner'], description: 'Loại giấy chứng nhận' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'ID người tạo' })
  @ApiQuery({ name: 'isPublic', required: false, type: Boolean, description: 'Chỉ mẫu công khai' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Chỉ mẫu hoạt động' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách mẫu giấy chứng nhận',
    schema: {
      type: 'object',
      properties: {
        templates: { type: 'array', items: { $ref: '#/components/schemas/CertificateTemplate' } },
        total: { type: 'number', description: 'Tổng số mẫu' },
        page: { type: 'number', description: 'Trang hiện tại' },
        limit: { type: 'number', description: 'Số lượng mỗi trang' },
        totalPages: { type: 'number', description: 'Tổng số trang' }
      }
    }
  })
  async findAll(@Req() req, @Query() queryDto: QueryCertificateTemplateDto) {
    // Tự động set userId từ JWT token để chỉ lấy giấy chứng nhận của user đang đăng nhập
    queryDto.userId = req.user.userId;
    return this.certificateTemplateService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin mẫu giấy chứng nhận theo ID' })
  @ApiParam({ name: 'id', description: 'ID mẫu giấy chứng nhận' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thông tin mẫu giấy chứng nhận',
    type: CertificateTemplate
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy mẫu giấy chứng nhận' })
  async findOne(@Param('id') id: string) {
    return this.certificateTemplateService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật mẫu giấy chứng nhận' })
  @ApiParam({ name: 'id', description: 'ID mẫu giấy chứng nhận' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cập nhật mẫu giấy chứng nhận thành công',
    type: CertificateTemplate
  })
  @ApiResponse({ status: 403, description: 'Không có quyền chỉnh sửa mẫu này' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy mẫu giấy chứng nhận' })
  async update(
    @Req() req, 
    @Param('id') id: string, 
    @Body() updateCertificateTemplateDto: UpdateCertificateTemplateDto
  ) {
    return this.certificateTemplateService.update(req.user.userId, id, updateCertificateTemplateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa mẫu giấy chứng nhận' })
  @ApiParam({ name: 'id', description: 'ID mẫu giấy chứng nhận' })
  @ApiResponse({ status: 200, description: 'Xóa mẫu giấy chứng nhận thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa mẫu này' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy mẫu giấy chứng nhận' })
  async remove(@Req() req, @Param('id') id: string) {
    return this.certificateTemplateService.remove(req.user.userId, id);
  }

}
