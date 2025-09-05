import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like, Between } from 'typeorm';
import { Payment, PaymentType, PaymentStatus, PaymentMethod, PaymentCurrency } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { ProcessPaymentDto, RefundPaymentDto } from './dto/process-payment.dto';
import { UserService } from '../user/user.service';
import { ClubService } from '../club/club.service';
import { NotificationService } from '../notification/notification.service';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { createPaginatedResult, getPaginationParams } from '../common/utils/pagination.util';
import { generateCode } from '../common/utils/code-generator';

export interface PaymentStats {
  totalPayments: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  refundedPayments: number;
  totalAmount: number;
  totalRevenue: number;
  totalRefunds: number;
  typeBreakdown: Record<string, number>;
  methodBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
  currencyBreakdown: Record<string, number>;
}

export interface ProcessResult {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  message: string;
  error?: string;
}

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly userService: UserService,
    private readonly clubService: ClubService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Tạo thanh toán mới
   */
  async create(createPaymentDto: CreatePaymentDto, userId: string): Promise<Payment> {
    // Kiểm tra mã thanh toán đã tồn tại chưa
    const existingPayment = await this.paymentRepository.findOne({
      where: { paymentCode: createPaymentDto.paymentCode, isDeleted: false }
    });

    if (existingPayment) {
      throw new BadRequestException('Mã thanh toán đã tồn tại');
    }

    // Kiểm tra người thanh toán tồn tại
    await this.userService.findOne(createPaymentDto.payerId);

    // Kiểm tra CLB tồn tại nếu có
    if (createPaymentDto.clubId) {
      await this.clubService.findOne(createPaymentDto.clubId);
    }

    // Tính tổng số tiền
    const amount = createPaymentDto.amount || 0;
    const fee = createPaymentDto.fee || 0;
    const tax = createPaymentDto.tax || 0;
    const totalAmount = amount + fee + tax;

    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      currency: createPaymentDto.currency || PaymentCurrency.VND,
      totalAmount,
      status: PaymentStatus.PENDING,
      startedAt: new Date(),
    });

    return await this.paymentRepository.save(payment);
  }

  /**
   * Lấy danh sách thanh toán với phân trang và tìm kiếm
   */
  async findAll(queryDto: QueryPaymentDto): Promise<PaginatedResult<Payment>> {
    const { 
      search, 
      type, 
      status, 
      method, 
      currency, 
      payerId, 
      payeeId, 
      clubId, 
      relatedObjectId, 
      relatedObjectType, 
      minAmount, 
      maxAmount, 
      createdFrom, 
      createdTo, 
      tags, 
      sortBy, 
      sortOrder 
    } = queryDto;
    const { page, limit, skip } = getPaginationParams(queryDto.page, queryDto.limit);

    const queryBuilder = this.paymentRepository.createQueryBuilder('payment')
      .where('payment.isDeleted = :isDeleted', { isDeleted: false });

    // Tìm kiếm
    if (search) {
      queryBuilder.andWhere(
        '(payment.name ILIKE :search OR payment.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Lọc theo loại
    if (type) {
      queryBuilder.andWhere('payment.type = :type', { type });
    }

    // Lọc theo trạng thái
    if (status) {
      queryBuilder.andWhere('payment.status = :status', { status });
    }

    // Lọc theo phương thức
    if (method) {
      queryBuilder.andWhere('payment.method = :method', { method });
    }

    // Lọc theo tiền tệ
    if (currency) {
      queryBuilder.andWhere('payment.currency = :currency', { currency });
    }

    // Lọc theo người thanh toán
    if (payerId) {
      queryBuilder.andWhere('payment.payerId = :payerId', { payerId });
    }

    // Lọc theo người nhận
    if (payeeId) {
      queryBuilder.andWhere('payment.payeeId = :payeeId', { payeeId });
    }

    // Lọc theo CLB
    if (clubId) {
      queryBuilder.andWhere('payment.clubId = :clubId', { clubId });
    }

    // Lọc theo đối tượng liên quan
    if (relatedObjectId) {
      queryBuilder.andWhere('payment.relatedObjectId = :relatedObjectId', { relatedObjectId });
    }

    if (relatedObjectType) {
      queryBuilder.andWhere('payment.relatedObjectType = :relatedObjectType', { relatedObjectType });
    }

    // Lọc theo số tiền
    if (minAmount !== undefined) {
      queryBuilder.andWhere('payment.amount >= :minAmount', { minAmount });
    }

    if (maxAmount !== undefined) {
      queryBuilder.andWhere('payment.amount <= :maxAmount', { maxAmount });
    }

    // Lọc theo ngày tạo
    if (createdFrom) {
      queryBuilder.andWhere('payment.createdAt >= :createdFrom', { createdFrom });
    }

    if (createdTo) {
      queryBuilder.andWhere('payment.createdAt <= :createdTo', { createdTo });
    }

    // Lọc theo tags
    if (tags) {
      queryBuilder.andWhere('payment.tags @> :tags', { tags: [tags] });
    }

    // Sắp xếp
    const orderBy = sortBy || 'createdAt';
    const order = sortOrder || 'DESC';
    queryBuilder.orderBy(`payment.${orderBy}`, order);

    // Phân trang
    queryBuilder.skip(skip).take(limit);

    const [payments, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResult(payments, total, page, limit);
  }

  /**
   * Lấy thanh toán theo ID
   */
  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!payment) {
      throw new NotFoundException('Không tìm thấy thanh toán');
    }

    return payment;
  }

  /**
   * Lấy thanh toán theo mã
   */
  async findByCode(paymentCode: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { paymentCode, isDeleted: false },
    });

    if (!payment) {
      throw new NotFoundException('Không tìm thấy thanh toán');
    }

    return payment;
  }

  /**
   * Cập nhật thanh toán
   */
  async update(id: string, updatePaymentDto: UpdatePaymentDto, userId: string): Promise<Payment> {
    const payment = await this.findOne(id);

    // Kiểm tra quyền sửa (chỉ người thanh toán hoặc admin)
    if (payment.payerId !== userId) {
      const user = await this.userService.findOne(userId);
      if (!user.roles || !user.roles.includes('admin')) {
        throw new ForbiddenException('Không có quyền cập nhật thanh toán này');
      }
    }

    // Kiểm tra mã thanh toán trùng lặp nếu có thay đổi
    if (updatePaymentDto.paymentCode && updatePaymentDto.paymentCode !== payment.paymentCode) {
      const existingPayment = await this.paymentRepository.findOne({
        where: { paymentCode: updatePaymentDto.paymentCode, isDeleted: false }
      });

      if (existingPayment) {
        throw new BadRequestException('Mã thanh toán đã tồn tại');
      }
    }

    // Tính lại tổng số tiền nếu có thay đổi
    if (updatePaymentDto.amount || updatePaymentDto.fee || updatePaymentDto.tax) {
      const amount = updatePaymentDto.amount || payment.amount;
      const fee = updatePaymentDto.fee || payment.fee;
      const tax = updatePaymentDto.tax || payment.tax;
      (updatePaymentDto as any).totalAmount = amount + fee + tax;
    }

    Object.assign(payment, updatePaymentDto);
    return await this.paymentRepository.save(payment);
  }

  /**
   * Xóa thanh toán (soft delete)
   */
  async remove(id: string, userId: string): Promise<void> {
    const payment = await this.findOne(id);

    // Kiểm tra quyền xóa (chỉ người thanh toán hoặc admin)
    if (payment.payerId !== userId) {
      const user = await this.userService.findOne(userId);
      if (!user.roles || !user.roles.includes('admin')) {
        throw new ForbiddenException('Không có quyền xóa thanh toán này');
      }
    }

    payment.isDeleted = true;
    payment.deletedAt = new Date();
    payment.deletedBy = userId;

    await this.paymentRepository.save(payment);
  }

  /**
   * Xử lý thanh toán
   */
  async processPayment(processDto: ProcessPaymentDto, userId: string): Promise<ProcessResult> {
    const payment = await this.findOne(processDto.paymentId);

    // Kiểm tra quyền thanh toán
    if (payment.payerId !== userId) {
      throw new ForbiddenException('Không có quyền thanh toán giao dịch này');
    }

    // Kiểm tra trạng thái thanh toán
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Thanh toán không ở trạng thái chờ xử lý');
    }

    // Kiểm tra hết hạn
    if (payment.expiresAt && payment.expiresAt < new Date()) {
      payment.status = PaymentStatus.CANCELLED;
      payment.cancelledAt = new Date();
      payment.reason = 'Hết hạn thanh toán';
      await this.paymentRepository.save(payment);
      throw new BadRequestException('Thanh toán đã hết hạn');
    }

    try {
      // Cập nhật trạng thái đang xử lý
      payment.status = PaymentStatus.PROCESSING;
      payment.method = processDto.method;
      await this.paymentRepository.save(payment);

      // Xử lý thanh toán theo phương thức
      const result = await this.processPaymentByMethod(payment, processDto);

      if (result.success) {
        // Cập nhật trạng thái thành công
        payment.status = PaymentStatus.COMPLETED;
        payment.completedAt = new Date();
        payment.externalTransactionId = result.transactionId;
        payment.externalData = processDto.paymentData;
        await this.paymentRepository.save(payment);

        // Gửi thông báo thành công
        await this.sendPaymentNotification(payment, 'success');
      } else {
        // Cập nhật trạng thái thất bại
        payment.status = PaymentStatus.FAILED;
        payment.reason = result.error;
        await this.paymentRepository.save(payment);

        // Gửi thông báo thất bại
        await this.sendPaymentNotification(payment, 'failed');
      }

      return result;
    } catch (error) {
      // Cập nhật trạng thái thất bại
      payment.status = PaymentStatus.FAILED;
      payment.reason = error.message;
      await this.paymentRepository.save(payment);

      return {
        success: false,
        message: 'Xử lý thanh toán thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Xử lý thanh toán theo phương thức
   */
  private async processPaymentByMethod(payment: Payment, processDto: ProcessPaymentDto): Promise<ProcessResult> {
    switch (processDto.method) {
      case PaymentMethod.VNPAY:
        return await this.processVnPayPayment(payment, processDto);
      case PaymentMethod.MOMO:
        return await this.processMomoPayment(payment, processDto);
      case PaymentMethod.ZALOPAY:
        return await this.processZaloPayPayment(payment, processDto);
      case PaymentMethod.BANK_TRANSFER:
        return await this.processBankTransferPayment(payment, processDto);
      case PaymentMethod.CREDIT_CARD:
      case PaymentMethod.DEBIT_CARD:
        return await this.processCardPayment(payment, processDto);
      default:
        return {
          success: false,
          message: 'Phương thức thanh toán không được hỗ trợ',
          error: 'Unsupported payment method',
        };
    }
  }

  /**
   * Xử lý thanh toán VNPay
   */
  private async processVnPayPayment(payment: Payment, processDto: ProcessPaymentDto): Promise<ProcessResult> {
    // TODO: Implement VNPay integration
    // 1. Tạo URL thanh toán VNPay
    // 2. Trả về URL để redirect
    // 3. Xử lý callback từ VNPay
    
    return {
      success: true,
      transactionId: `VNPAY_${Date.now()}`,
      paymentUrl: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=${payment.totalAmount}&vnp_Command=pay&vnp_CreateDate=${Date.now()}&vnp_CurrCode=VND&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=${payment.name}&vnp_OrderType=other&vnp_ReturnUrl=https://example.com/return&vnp_TmnCode=YOUR_TMN_CODE&vnp_TxnRef=${payment.paymentCode}&vnp_Version=2.1.0&vnp_SecureHash=YOUR_SECURE_HASH`,
      message: 'Tạo URL thanh toán VNPay thành công',
    };
  }

  /**
   * Xử lý thanh toán Momo
   */
  private async processMomoPayment(payment: Payment, processDto: ProcessPaymentDto): Promise<ProcessResult> {
    // TODO: Implement Momo integration
    return {
      success: true,
      transactionId: `MOMO_${Date.now()}`,
      paymentUrl: `https://test-payment.momo.vn/v2/gateway/pay?partnerCode=YOUR_PARTNER_CODE&accessKey=YOUR_ACCESS_KEY&requestId=${payment.paymentCode}&amount=${payment.totalAmount}&orderId=${payment.paymentCode}&orderInfo=${payment.name}&returnUrl=https://example.com/return&notifyUrl=https://example.com/notify&extraData=&requestType=captureMoMoWallet&signature=YOUR_SIGNATURE`,
      message: 'Tạo URL thanh toán Momo thành công',
    };
  }

  /**
   * Xử lý thanh toán ZaloPay
   */
  private async processZaloPayPayment(payment: Payment, processDto: ProcessPaymentDto): Promise<ProcessResult> {
    // TODO: Implement ZaloPay integration
    return {
      success: true,
      transactionId: `ZALOPAY_${Date.now()}`,
      paymentUrl: `https://sb-openapi.zalopay.vn/v2/create?app_id=YOUR_APP_ID&app_trans_id=${payment.paymentCode}&app_user=user_${payment.payerId}&app_time=${Date.now()}&amount=${payment.totalAmount}&item=[]&description=${payment.name}&bank_code=zalopayapp&callback_url=https://example.com/callback&embed_data={}&mac=YOUR_MAC}`,
      message: 'Tạo URL thanh toán ZaloPay thành công',
    };
  }

  /**
   * Xử lý chuyển khoản ngân hàng
   */
  private async processBankTransferPayment(payment: Payment, processDto: ProcessPaymentDto): Promise<ProcessResult> {
    // TODO: Implement bank transfer processing
    return {
      success: true,
      transactionId: `BANK_${Date.now()}`,
      message: 'Thông tin chuyển khoản đã được gửi',
    };
  }

  /**
   * Xử lý thanh toán thẻ
   */
  private async processCardPayment(payment: Payment, processDto: ProcessPaymentDto): Promise<ProcessResult> {
    // TODO: Implement card payment processing
    return {
      success: true,
      transactionId: `CARD_${Date.now()}`,
      message: 'Thanh toán thẻ thành công',
    };
  }

  /**
   * Hoàn tiền
   */
  async refundPayment(refundDto: RefundPaymentDto, userId: string): Promise<Payment> {
    const payment = await this.findOne(refundDto.paymentId);

    // Kiểm tra quyền hoàn tiền (chỉ admin hoặc người nhận)
    if (payment.payeeId !== userId) {
      const user = await this.userService.findOne(userId);
      if (!user.roles || !user.roles.includes('admin')) {
        throw new ForbiddenException('Không có quyền hoàn tiền giao dịch này');
      }
    }

    // Kiểm tra trạng thái thanh toán
    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Chỉ có thể hoàn tiền giao dịch đã hoàn thành');
    }

    const refundAmount = refundDto.refundAmount || payment.amount;

    // Kiểm tra số tiền hoàn
    if (refundAmount > payment.amount) {
      throw new BadRequestException('Số tiền hoàn không được vượt quá số tiền gốc');
    }

    try {
      // Thực hiện hoàn tiền
      const refundResult = await this.processRefund(payment, refundAmount);

      if (refundResult.success) {
        // Cập nhật trạng thái
        if (refundAmount === payment.amount) {
          payment.status = PaymentStatus.REFUNDED;
        } else {
          payment.status = PaymentStatus.PARTIALLY_REFUNDED;
        }
        payment.refundedAt = new Date();
        payment.reason = refundDto.reason;
        payment.notes = refundDto.notes;
        payment.externalData = {
          ...payment.externalData,
          refundTransactionId: refundResult.transactionId,
          refundAmount,
        };

        await this.paymentRepository.save(payment);

        // Gửi thông báo hoàn tiền
        await this.sendPaymentNotification(payment, 'refunded');

        return payment;
      } else {
        throw new Error(refundResult.error || 'Hoàn tiền thất bại');
      }
    } catch (error) {
      throw new BadRequestException(`Hoàn tiền thất bại: ${error.message}`);
    }
  }

  /**
   * Xử lý hoàn tiền
   */
  private async processRefund(payment: Payment, refundAmount: number): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    // TODO: Implement refund processing based on payment method
    switch (payment.method) {
      case PaymentMethod.VNPAY:
        return await this.processVnPayRefund(payment, refundAmount);
      case PaymentMethod.MOMO:
        return await this.processMomoRefund(payment, refundAmount);
      case PaymentMethod.ZALOPAY:
        return await this.processZaloPayRefund(payment, refundAmount);
      default:
        return {
          success: true,
          transactionId: `REFUND_${Date.now()}`,
        };
    }
  }

  /**
   * Hoàn tiền VNPay
   */
  private async processVnPayRefund(payment: Payment, refundAmount: number): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    // TODO: Implement VNPay refund
    return {
      success: true,
      transactionId: `VNPAY_REFUND_${Date.now()}`,
    };
  }

  /**
   * Hoàn tiền Momo
   */
  private async processMomoRefund(payment: Payment, refundAmount: number): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    // TODO: Implement Momo refund
    return {
      success: true,
      transactionId: `MOMO_REFUND_${Date.now()}`,
    };
  }

  /**
   * Hoàn tiền ZaloPay
   */
  private async processZaloPayRefund(payment: Payment, refundAmount: number): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    // TODO: Implement ZaloPay refund
    return {
      success: true,
      transactionId: `ZALOPAY_REFUND_${Date.now()}`,
    };
  }

  /**
   * Gửi thông báo thanh toán
   */
  private async sendPaymentNotification(payment: Payment, type: 'success' | 'failed' | 'refunded'): Promise<void> {
    try {
      let title: string;
      let content: string;

      switch (type) {
        case 'success':
          title = 'Thanh toán thành công';
          content = `Thanh toán "${payment.name}" đã được xử lý thành công với số tiền ${payment.totalAmount} ${payment.currency}`;
          break;
        case 'failed':
          title = 'Thanh toán thất bại';
          content = `Thanh toán "${payment.name}" đã thất bại. Lý do: ${payment.reason}`;
          break;
        case 'refunded':
          title = 'Hoàn tiền thành công';
          content = `Giao dịch "${payment.name}" đã được hoàn tiền thành công`;
          break;
      }

      await this.notificationService.sendNotification({
        title,
        content,
        type: 'payment' as any,
        recipientIds: [payment.payerId],
        relatedObjectId: payment.id,
        relatedObjectType: 'payment',
        data: {
          paymentId: payment.id,
          paymentCode: payment.paymentCode,
          amount: payment.totalAmount,
          currency: payment.currency,
          type,
        },
      }, 'system');
    } catch (error) {
      console.error('Error sending payment notification:', error);
    }
  }

  /**
   * Lấy thống kê thanh toán
   */
  async getStats(): Promise<PaymentStats> {
    const payments = await this.paymentRepository.find({
      where: { isDeleted: false },
    });

    const stats: PaymentStats = {
      totalPayments: payments.length,
      completedPayments: 0,
      pendingPayments: 0,
      failedPayments: 0,
      refundedPayments: 0,
      totalAmount: 0,
      totalRevenue: 0,
      totalRefunds: 0,
      typeBreakdown: {},
      methodBreakdown: {},
      statusBreakdown: {},
      currencyBreakdown: {},
    };

    payments.forEach(payment => {
      // Đếm theo trạng thái
      switch (payment.status) {
        case PaymentStatus.COMPLETED:
          stats.completedPayments++;
          stats.totalRevenue += payment.amount;
          break;
        case PaymentStatus.PENDING:
          stats.pendingPayments++;
          break;
        case PaymentStatus.FAILED:
          stats.failedPayments++;
          break;
        case PaymentStatus.REFUNDED:
        case PaymentStatus.PARTIALLY_REFUNDED:
          stats.refundedPayments++;
          stats.totalRefunds += payment.amount;
          break;
      }

      // Tính tổng số tiền
      stats.totalAmount += payment.amount;

      // Đếm theo loại
      const type = payment.type;
      stats.typeBreakdown[type] = (stats.typeBreakdown[type] || 0) + 1;

      // Đếm theo phương thức
      const method = payment.method;
      stats.methodBreakdown[method] = (stats.methodBreakdown[method] || 0) + 1;

      // Đếm theo trạng thái
      const status = payment.status;
      stats.statusBreakdown[status] = (stats.statusBreakdown[status] || 0) + 1;

      // Đếm theo tiền tệ
      const currency = payment.currency;
      stats.currencyBreakdown[currency] = (stats.currencyBreakdown[currency] || 0) + 1;
    });

    return stats;
  }

  /**
   * Lấy thanh toán theo người thanh toán
   */
  async findByPayer(payerId: string): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: { payerId, isDeleted: false },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Lấy thanh toán theo người nhận
   */
  async findByPayee(payeeId: string): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: { payeeId, isDeleted: false },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Lấy thanh toán theo CLB
   */
  async findByClub(clubId: string): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: { clubId, isDeleted: false },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Lấy thanh toán theo đối tượng liên quan
   */
  async findByRelatedObject(relatedObjectId: string, relatedObjectType: string): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: { relatedObjectId, relatedObjectType, isDeleted: false },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Tìm kiếm thanh toán
   */
  async search(query: string, limit: number = 10): Promise<Payment[]> {
    return await this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere(
        '(payment.name ILIKE :query OR payment.description ILIKE :query OR payment.paymentCode ILIKE :query)',
        { query: `%${query}%` }
      )
      .orderBy('payment.createdAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  /**
   * Lấy thanh toán theo tags
   */
  async findByTags(tags: string[]): Promise<Payment[]> {
    return await this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('payment.tags && :tags', { tags })
      .orderBy('payment.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Lấy thanh toán hết hạn
   */
  async getExpiredPayments(): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: {
        status: PaymentStatus.PENDING,
        expiresAt: Between(new Date(0), new Date()),
        isDeleted: false,
      },
      order: { expiresAt: 'ASC' },
    });
  }

  /**
   * Hủy thanh toán hết hạn
   */
  async cancelExpiredPayments(): Promise<{ count: number }> {
    const expiredPayments = await this.getExpiredPayments();

    for (const payment of expiredPayments) {
      payment.status = PaymentStatus.CANCELLED;
      payment.cancelledAt = new Date();
      payment.reason = 'Hết hạn thanh toán';
      await this.paymentRepository.save(payment);
    }

    return { count: expiredPayments.length };
  }
}
