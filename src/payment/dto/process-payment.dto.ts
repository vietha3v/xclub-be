import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsUUID, IsNumber, Min } from 'class-validator';
import { PaymentMethod } from '../entities/payment.entity';

export class ProcessPaymentDto {
  @ApiProperty({ description: 'ID của thanh toán' })
  @IsUUID()
  paymentId: string;

  @ApiProperty({ description: 'Phương thức thanh toán' })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiPropertyOptional({ description: 'Thông tin bổ sung cho phương thức thanh toán' })
  @IsOptional()
  paymentData?: any;

  @ApiPropertyOptional({ description: 'Ghi chú thanh toán' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RefundPaymentDto {
  @ApiProperty({ description: 'ID của thanh toán' })
  @IsUUID()
  paymentId: string;

  @ApiProperty({ description: 'Số tiền hoàn (nếu không có thì hoàn toàn bộ)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  refundAmount?: number;

  @ApiProperty({ description: 'Lý do hoàn tiền' })
  @IsString()
  reason: string;

  @ApiPropertyOptional({ description: 'Ghi chú hoàn tiền' })
  @IsOptional()
  @IsString()
  notes?: string;
}
