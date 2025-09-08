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
  Request,
  HttpStatus,
  HttpCode,
  Req
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventDto } from './dto/query-event.dto';
import { Event } from './entities/event.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Sự kiện')
@Controller('events')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo sự kiện mới' })
  @ApiResponse({
    status: 201,
    description: 'Tạo sự kiện thành công',
    type: Event
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async create(@Body() createEventDto: CreateEventDto, @Req() req: any): Promise<Event> {
    return this.eventService.create(createEventDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Lấy danh sách sự kiện',
    description: 'Lấy danh sách sự kiện với phân trang và lọc'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Trang hiện tại' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng mỗi trang' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'type', required: false, enum: ['race', 'training', 'workshop', 'meetup', 'competition', 'charity', 'other'], description: 'Loại sự kiện' })
  @ApiQuery({ name: 'status', required: false, enum: ['draft', 'published', 'registration_open', 'registration_closed', 'active', 'completed', 'cancelled'], description: 'Trạng thái sự kiện' })
  @ApiQuery({ name: 'visibility', required: false, enum: ['public', 'private', 'club_only', 'invite_only'], description: 'Quyền riêng tư' })
  @ApiQuery({ name: 'clubId', required: false, type: String, description: 'ID câu lạc bộ' })
  @ApiQuery({ name: 'createdBy', required: false, type: String, description: 'ID người tạo' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lấy danh sách sự kiện thành công',
    schema: {
      type: 'object',
      properties: {
        events: {
          type: 'array',
          items: { $ref: '#/components/schemas/Event' }
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Chưa xác thực'
  })
  async findAll(@Query() queryEventDto: QueryEventDto) {
    return this.eventService.findAll(queryEventDto);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Lấy thông tin sự kiện',
    description: 'Lấy thông tin chi tiết của một sự kiện theo ID'
  })
  @ApiParam({ name: 'id', description: 'ID của sự kiện' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lấy thông tin sự kiện thành công',
    type: Event
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Không tìm thấy sự kiện'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Chưa xác thực'
  })
  async findOne(@Param('id') id: string): Promise<Event> {
    return this.eventService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Cập nhật sự kiện',
    description: 'Cập nhật thông tin của một sự kiện'
  })
  @ApiParam({ name: 'id', description: 'ID của sự kiện' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cập nhật sự kiện thành công',
    type: Event
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dữ liệu không hợp lệ'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Không có quyền chỉnh sửa'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Không tìm thấy sự kiện'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Chưa xác thực'
  })
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Request() req: any
  ): Promise<Event> {
    return this.eventService.update(id, updateEventDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Xóa sự kiện',
    description: 'Xóa mềm một sự kiện (cập nhật trạng thái isDeleted)'
  })
  @ApiParam({ name: 'id', description: 'ID của sự kiện' })
  @ApiResponse({ 
    status: 204, 
    description: 'Xóa sự kiện thành công'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Không có quyền xóa'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Không tìm thấy sự kiện'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Chưa xác thực'
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<void> {
    return this.eventService.remove(id, req.user.userId);
  }

  @Get('creator/:userId')
  @ApiOperation({ 
    summary: 'Lấy sự kiện theo người tạo',
    description: 'Lấy danh sách sự kiện được tạo bởi một người dùng cụ thể'
  })
  @ApiParam({ name: 'userId', description: 'ID của người tạo' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lấy danh sách sự kiện thành công',
    schema: {
      type: 'object',
      properties: {
        events: {
          type: 'array',
          items: { $ref: '#/components/schemas/Event' }
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Chưa xác thực'
  })
  async findByCreator(
    @Param('userId') userId: string,
    @Query() queryEventDto: QueryEventDto
  ) {
    const query = { ...queryEventDto, createdBy: userId };
    return this.eventService.findAll(query);
  }
}
