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
import { ChallengeCategoryService } from './challenge-category.service';
import { CreateChallengeCategoryDto } from './dto/create-challenge-category.dto';
import { UpdateChallengeCategoryDto } from './dto/update-challenge-category.dto';
import { QueryChallengeCategoryDto } from './dto/query-challenge-category.dto';
import { ChallengeCategory } from './entities/challenge-category.entity';

@ApiTags('🏷️ Quản lý danh mục thử thách')
@Controller('challenges/:challengeId/categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ChallengeCategoryController {
  constructor(private readonly challengeCategoryService: ChallengeCategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo danh mục thử thách mới' })
  @ApiParam({ name: 'challengeId', description: 'ID thử thách' })
  @ApiResponse({ 
    status: 201, 
    description: 'Tạo danh mục thử thách thành công',
    type: ChallengeCategory
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thử thách' })
  async create(
    @Param('challengeId') challengeId: string,
    @Body() createChallengeCategoryDto: CreateChallengeCategoryDto
  ) {
    return this.challengeCategoryService.create(challengeId, createChallengeCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách danh mục thử thách' })
  @ApiParam({ name: 'challengeId', description: 'ID thử thách' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Trang hiện tại' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng mỗi trang' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Tìm kiếm theo tên' })
  @ApiQuery({ name: 'type', required: false, enum: ['distance', 'time', 'repetition', 'custom'], description: 'Loại danh mục' })
  @ApiQuery({ name: 'isRequired', required: false, type: Boolean, description: 'Chỉ danh mục bắt buộc' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Chỉ danh mục hoạt động' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách danh mục thử thách',
    schema: {
      type: 'object',
      properties: {
        categories: { type: 'array', items: { $ref: '#/components/schemas/ChallengeCategory' } },
        total: { type: 'number', description: 'Tổng số danh mục' },
        page: { type: 'number', description: 'Trang hiện tại' },
        limit: { type: 'number', description: 'Số lượng mỗi trang' },
        totalPages: { type: 'number', description: 'Tổng số trang' }
      }
    }
  })
  async findAll(
    @Param('challengeId') challengeId: string,
    @Query() queryDto: QueryChallengeCategoryDto
  ) {
    return this.challengeCategoryService.findAll(challengeId, queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin danh mục thử thách theo ID' })
  @ApiParam({ name: 'challengeId', description: 'ID thử thách' })
  @ApiParam({ name: 'id', description: 'ID danh mục' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thông tin danh mục thử thách',
    type: ChallengeCategory
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục thử thách' })
  async findOne(
    @Param('challengeId') challengeId: string,
    @Param('id') id: string
  ) {
    return this.challengeCategoryService.findOne(challengeId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật danh mục thử thách' })
  @ApiParam({ name: 'challengeId', description: 'ID thử thách' })
  @ApiParam({ name: 'id', description: 'ID danh mục' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cập nhật danh mục thử thách thành công',
    type: ChallengeCategory
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục thử thách' })
  async update(
    @Param('challengeId') challengeId: string,
    @Param('id') id: string,
    @Body() updateChallengeCategoryDto: UpdateChallengeCategoryDto
  ) {
    return this.challengeCategoryService.update(challengeId, id, updateChallengeCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa danh mục thử thách' })
  @ApiParam({ name: 'challengeId', description: 'ID thử thách' })
  @ApiParam({ name: 'id', description: 'ID danh mục' })
  @ApiResponse({ status: 200, description: 'Xóa danh mục thử thách thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục thử thách' })
  async remove(
    @Param('challengeId') challengeId: string,
    @Param('id') id: string
  ) {
    return this.challengeCategoryService.remove(challengeId, id);
  }
}
