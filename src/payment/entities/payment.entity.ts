import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PaymentType {
  SUBSCRIPTION = 'subscription',
  ONE_TIME = 'one_time',
  REFUND = 'refund',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  OTHER = 'other'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

export enum PaymentMethod {
  VNPAY = 'vnpay',
  MOMO = 'momo',
  ZALOPAY = 'zalopay',
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  WALLET = 'wallet',
  OTHER = 'other'
}

export enum PaymentCurrency {
  VND = 'VND',
  USD = 'USD',
  EUR = 'EUR',
  OTHER = 'OTHER'
}

@Entity('payments')
export class Payment {
  @ApiProperty({ description: 'ID duy nhất của thanh toán' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Mã thanh toán (duy nhất)' })
  @Column({ unique: true, length: 20 })
  @Index()
  paymentCode: string;

  @ApiProperty({ description: 'Tên thanh toán' })
  @Column({ length: 255 })
  name: string;

  @ApiPropertyOptional({ description: 'Mô tả thanh toán' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Loại thanh toán' })
  @Column({
    type: 'enum',
    enum: PaymentType,
    default: PaymentType.ONE_TIME
  })
  type: PaymentType;

  @ApiProperty({ description: 'Trạng thái thanh toán' })
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING
  })
  status: PaymentStatus;

  @ApiProperty({ description: 'Phương thức thanh toán' })
  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.OTHER
  })
  method: PaymentMethod;

  @ApiProperty({ description: 'Tiền tệ' })
  @Column({
    type: 'enum',
    enum: PaymentCurrency,
    default: PaymentCurrency.VND
  })
  currency: PaymentCurrency;

  @ApiProperty({ description: 'Số tiền thanh toán' })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @ApiPropertyOptional({ description: 'Phí giao dịch' })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  fee: number;

  @ApiPropertyOptional({ description: 'Thuế' })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  tax: number;

  @ApiProperty({ description: 'Tổng số tiền' })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalAmount: number;

  @ApiProperty({ description: 'ID người thanh toán' })
  @Column()
  @Index()
  payerId: string;

  @ApiPropertyOptional({ description: 'ID người nhận thanh toán' })
  @Column({ nullable: true })
  @Index()
  payeeId?: string;

  @ApiPropertyOptional({ description: 'ID câu lạc bộ liên quan' })
  @Column({ nullable: true })
  @Index()
  clubId?: string;

  @ApiPropertyOptional({ description: 'ID đối tượng liên quan' })
  @Column({ nullable: true })
  @Index()
  relatedObjectId?: string;

  @ApiPropertyOptional({ description: 'Loại đối tượng liên quan' })
  @Column({ length: 50, nullable: true })
  relatedObjectType?: string;

  @ApiPropertyOptional({ description: 'Mã giao dịch bên thứ 3' })
  @Column({ nullable: true })
  @Index()
  externalTransactionId?: string;

  @ApiPropertyOptional({ description: 'Thông tin giao dịch bên thứ 3' })
  @Column({ type: 'jsonb', nullable: true })
  externalData?: any;

  @ApiPropertyOptional({ description: 'Thời gian bắt đầu thanh toán' })
  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date;

  @ApiPropertyOptional({ description: 'Thời gian hoàn thành thanh toán' })
  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @ApiPropertyOptional({ description: 'Thời gian hết hạn thanh toán' })
  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @ApiPropertyOptional({ description: 'Thời gian hủy thanh toán' })
  @Column({ type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @ApiPropertyOptional({ description: 'Thời gian hoàn tiền' })
  @Column({ type: 'timestamp', nullable: true })
  refundedAt?: Date;

  @ApiPropertyOptional({ description: 'Lý do hủy/hoàn tiền' })
  @Column({ type: 'text', nullable: true })
  reason?: string;

  @ApiPropertyOptional({ description: 'Ghi chú thanh toán' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiPropertyOptional({ description: 'Metadata thanh toán' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @ApiPropertyOptional({ description: 'Tags thanh toán' })
  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @ApiProperty({ description: 'Trạng thái xóa mềm' })
  @Column({ default: false })
  isDeleted: boolean;

  @ApiPropertyOptional({ description: 'Thời gian xóa' })
  @Column({ type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @ApiPropertyOptional({ description: 'Người xóa' })
  @Column({ nullable: true })
  deletedBy?: string;

  @ApiProperty({ description: 'Thời gian tạo' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Thời gian cập nhật' })
  @UpdateDateColumn()
  updatedAt: Date;
}
