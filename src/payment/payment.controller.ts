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
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { ProcessPaymentDto, RefundPaymentDto } from './dto/process-payment.dto';
import { Payment, PaymentType, PaymentStatus, PaymentMethod, PaymentCurrency } from './entities/payment.entity';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@ApiTags('💳 Quản lý thanh toán')
@Controller('payments')
@ApiBearerAuth('JWT-auth')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Tạo thanh toán mới
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Tạo thanh toán mới',
    description: 'Tạo thanh toán mới trong hệ thống (chỉ admin/moderator)'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Tạo thanh toán thành công',
    type: Payment
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền tạo thanh toán' })
  async create(@Body() createPaymentDto: CreatePaymentDto, @Req() req: any) {
    return this.paymentService.create(createPaymentDto, req.user.userId);
  }

  /**
   * Lấy danh sách thanh toán
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy danh sách thanh toán',
    description: 'Lấy danh sách thanh toán với phân trang và tìm kiếm'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách thanh toán',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Payment' }
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
        hasNextPage: { type: 'boolean' },
        hasPreviousPage: { type: 'boolean' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async findAll(@Query() queryDto: QueryPaymentDto, @Req() req: any) {
    // Nếu không phải admin, chỉ lấy thanh toán của user hiện tại
    if (!req.user.roles || !req.user.roles.includes('admin')) {
      queryDto.payerId = req.user.userId;
    }
    return this.paymentService.findAll(queryDto);
  }

  /**
   * Lấy thanh toán theo ID
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy thanh toán theo ID',
    description: 'Lấy thông tin chi tiết của một thanh toán'
  })
  @ApiParam({ name: 'id', description: 'ID của thanh toán' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thông tin thanh toán',
    type: Payment
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thanh toán' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const payment = await this.paymentService.findOne(id);
    
    // Kiểm tra quyền xem (chỉ người thanh toán, người nhận hoặc admin)
    if (payment.payerId !== req.user.userId && payment.payeeId !== req.user.userId && !req.user.roles || !req.user.roles.includes('admin')) {
      throw new ForbiddenException('Không có quyền xem thanh toán này');
    }
    
    return payment;
  }

  /**
   * Lấy thanh toán theo mã
   */
  @Get('code/:paymentCode')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy thanh toán theo mã',
    description: 'Lấy thông tin thanh toán theo mã thanh toán'
  })
  @ApiParam({ name: 'paymentCode', description: 'Mã thanh toán' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thông tin thanh toán',
    type: Payment
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thanh toán' })
  async findByCode(@Param('paymentCode') paymentCode: string, @Req() req: any) {
    const payment = await this.paymentService.findByCode(paymentCode);
    
    // Kiểm tra quyền xem (chỉ người thanh toán, người nhận hoặc admin)
    if (payment.payerId !== req.user.userId && payment.payeeId !== req.user.userId && !req.user.roles || !req.user.roles.includes('admin')) {
      throw new ForbiddenException('Không có quyền xem thanh toán này');
    }
    
    return payment;
  }

  /**
   * Cập nhật thanh toán
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Cập nhật thanh toán',
    description: 'Cập nhật thông tin thanh toán (chỉ người thanh toán hoặc admin)'
  })
  @ApiParam({ name: 'id', description: 'ID của thanh toán' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cập nhật thành công',
    type: Payment
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thanh toán' })
  async update(
    @Param('id') id: string, 
    @Body() updatePaymentDto: UpdatePaymentDto,
    @Req() req: any
  ) {
    return this.paymentService.update(id, updatePaymentDto, req.user.userId);
  }

  /**
   * Xóa thanh toán
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Xóa thanh toán',
    description: 'Xóa thanh toán (chỉ người thanh toán hoặc admin)'
  })
  @ApiParam({ name: 'id', description: 'ID của thanh toán' })
  @ApiResponse({ 
    status: 200, 
    description: 'Xóa thành công',
    schema: { type: 'object', properties: { message: { type: 'string' } } }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thanh toán' })
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.paymentService.remove(id, req.user.userId);
    return { message: 'Xóa thanh toán thành công' };
  }

  /**
   * Xử lý thanh toán
   */
  @Post('process')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Xử lý thanh toán',
    description: 'Xử lý thanh toán với phương thức được chọn'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Xử lý thanh toán thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        transactionId: { type: 'string' },
        paymentUrl: { type: 'string' },
        message: { type: 'string' },
        error: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền thanh toán' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thanh toán' })
  async processPayment(@Body() processDto: ProcessPaymentDto, @Req() req: any) {
    return this.paymentService.processPayment(processDto, req.user.userId);
  }

  /**
   * Hoàn tiền
   */
  @Post('refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Hoàn tiền',
    description: 'Hoàn tiền cho giao dịch (chỉ admin/moderator)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Hoàn tiền thành công',
    type: Payment
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền hoàn tiền' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thanh toán' })
  async refundPayment(@Body() refundDto: RefundPaymentDto, @Req() req: any) {
    return this.paymentService.refundPayment(refundDto, req.user.userId);
  }

  /**
   * Lấy thống kê thanh toán
   */
  @Get('stats/overview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  @ApiOperation({ 
    summary: 'Lấy thống kê tổng quan',
    description: 'Lấy thống kê tổng quan về thanh toán (chỉ admin/moderator)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Thống kê tổng quan',
    schema: {
      type: 'object',
      properties: {
        totalPayments: { type: 'number' },
        completedPayments: { type: 'number' },
        pendingPayments: { type: 'number' },
        failedPayments: { type: 'number' },
        refundedPayments: { type: 'number' },
        totalAmount: { type: 'number' },
        totalRevenue: { type: 'number' },
        totalRefunds: { type: 'number' },
        typeBreakdown: { type: 'object' },
        methodBreakdown: { type: 'object' },
        statusBreakdown: { type: 'object' },
        currencyBreakdown: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem thống kê' })
  async getStats() {
    return this.paymentService.getStats();
  }

  /**
   * Lấy thanh toán theo người thanh toán
   */
  @Get('payer/:payerId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy thanh toán theo người thanh toán',
    description: 'Lấy danh sách thanh toán của một người thanh toán'
  })
  @ApiParam({ name: 'payerId', description: 'ID của người thanh toán' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách thanh toán theo người thanh toán',
    type: [Payment]
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem thanh toán của người khác' })
  async findByPayer(@Param('payerId') payerId: string, @Req() req: any) {
    // Kiểm tra quyền xem (chỉ xem thanh toán của mình hoặc admin)
    if (payerId !== req.user.userId && !req.user.roles || !req.user.roles.includes('admin')) {
      throw new ForbiddenException('Không có quyền xem thanh toán của người khác');
    }
    
    return this.paymentService.findByPayer(payerId);
  }

  /**
   * Lấy thanh toán theo người nhận
   */
  @Get('payee/:payeeId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy thanh toán theo người nhận',
    description: 'Lấy danh sách thanh toán của một người nhận'
  })
  @ApiParam({ name: 'payeeId', description: 'ID của người nhận' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách thanh toán theo người nhận',
    type: [Payment]
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem thanh toán của người khác' })
  async findByPayee(@Param('payeeId') payeeId: string, @Req() req: any) {
    // Kiểm tra quyền xem (chỉ xem thanh toán của mình hoặc admin)
    if (payeeId !== req.user.userId && !req.user.roles || !req.user.roles.includes('admin')) {
      throw new ForbiddenException('Không có quyền xem thanh toán của người khác');
    }
    
    return this.paymentService.findByPayee(payeeId);
  }

  /**
   * Lấy thanh toán theo CLB
   */
  @Get('club/:clubId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy thanh toán theo CLB',
    description: 'Lấy danh sách thanh toán của một CLB'
  })
  @ApiParam({ name: 'clubId', description: 'ID của CLB' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách thanh toán theo CLB',
    type: [Payment]
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async findByClub(@Param('clubId') clubId: string) {
    return this.paymentService.findByClub(clubId);
  }

  /**
   * Lấy thanh toán theo đối tượng liên quan
   */
  @Get('related/:relatedObjectType/:relatedObjectId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy thanh toán theo đối tượng liên quan',
    description: 'Lấy danh sách thanh toán của một đối tượng liên quan'
  })
  @ApiParam({ name: 'relatedObjectType', description: 'Loại đối tượng liên quan' })
  @ApiParam({ name: 'relatedObjectId', description: 'ID của đối tượng liên quan' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách thanh toán theo đối tượng liên quan',
    type: [Payment]
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async findByRelatedObject(
    @Param('relatedObjectType') relatedObjectType: string,
    @Param('relatedObjectId') relatedObjectId: string
  ) {
    return this.paymentService.findByRelatedObject(relatedObjectId, relatedObjectType);
  }

  /**
   * Tìm kiếm thanh toán
   */
  @Get('search')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Tìm kiếm thanh toán',
    description: 'Tìm kiếm thanh toán theo từ khóa'
  })
  @ApiQuery({ name: 'q', description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng kết quả (mặc định 10)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Kết quả tìm kiếm',
    type: [Payment]
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async search(
    @Query('q') query: string,
    @Req() req: any,
    @Query('limit') limit?: number
  ) {
    const payments = await this.paymentService.search(query, limit);
    
    // Nếu không phải admin, chỉ lấy thanh toán của user hiện tại
    if (!req.user.roles || !req.user.roles.includes('admin')) {
      return payments.filter(p => p.payerId === req.user.userId || p.payeeId === req.user.userId);
    }
    
    return payments;
  }

  /**
   * Lấy thanh toán theo tags
   */
  @Get('tags')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy thanh toán theo tags',
    description: 'Lấy danh sách thanh toán theo tags'
  })
  @ApiQuery({ name: 'tags', description: 'Danh sách tags (phân cách bằng dấu phẩy)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách thanh toán theo tags',
    type: [Payment]
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async findByTags(@Query('tags') tags: string, @Req() req: any) {
    const tagArray = tags.split(',').map(tag => tag.trim());
    const payments = await this.paymentService.findByTags(tagArray);
    
    // Nếu không phải admin, chỉ lấy thanh toán của user hiện tại
    if (!req.user.roles || !req.user.roles.includes('admin')) {
      return payments.filter(p => p.payerId === req.user.userId || p.payeeId === req.user.userId);
    }
    
    return payments;
  }

  /**
   * Lấy thanh toán hết hạn
   */
  @Get('expired')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  @ApiOperation({ 
    summary: 'Lấy thanh toán hết hạn',
    description: 'Lấy danh sách thanh toán đã hết hạn (chỉ admin/moderator)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách thanh toán hết hạn',
    type: [Payment]
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem thanh toán hết hạn' })
  async getExpiredPayments() {
    return this.paymentService.getExpiredPayments();
  }

  /**
   * Hủy thanh toán hết hạn
   */
  @Post('cancel-expired')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Hủy thanh toán hết hạn',
    description: 'Hủy tất cả thanh toán đã hết hạn (chỉ admin/moderator)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Hủy thanh toán hết hạn thành công',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền hủy thanh toán hết hạn' })
  async cancelExpiredPayments() {
    return this.paymentService.cancelExpiredPayments();
  }
}
