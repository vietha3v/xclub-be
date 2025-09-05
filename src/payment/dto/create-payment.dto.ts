import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNumber, IsUUID, IsArray, IsDateString, Min } from 'class-validator';
import { PaymentType, PaymentMethod, PaymentCurrency } from '../entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({ description: 'Mã thanh toán (duy nhất)' })
  @IsString()
  paymentCode: string;

  @ApiProperty({ description: 'Tên thanh toán' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Mô tả thanh toán' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Loại thanh toán' })
  @IsEnum(PaymentType)
  type: PaymentType;

  @ApiProperty({ description: 'Phương thức thanh toán' })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiPropertyOptional({ description: 'Tiền tệ' })
  @IsOptional()
  @IsEnum(PaymentCurrency)
  currency?: PaymentCurrency;

  @ApiProperty({ description: 'Số tiền thanh toán' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ description: 'Phí giao dịch' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fee?: number;

  @ApiPropertyOptional({ description: 'Thuế' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;

  @ApiProperty({ description: 'ID người thanh toán' })
  @IsUUID()
  payerId: string;

  @ApiPropertyOptional({ description: 'ID người nhận thanh toán' })
  @IsOptional()
  @IsUUID()
  payeeId?: string;

  @ApiPropertyOptional({ description: 'ID câu lạc bộ liên quan' })
  @IsOptional()
  @IsUUID()
  clubId?: string;

  @ApiPropertyOptional({ description: 'ID đối tượng liên quan' })
  @IsOptional()
  @IsUUID()
  relatedObjectId?: string;

  @ApiPropertyOptional({ description: 'Loại đối tượng liên quan' })
  @IsOptional()
  @IsString()
  relatedObjectType?: string;

  @ApiPropertyOptional({ description: 'Thời gian hết hạn thanh toán' })
  @IsOptional()
  @IsDateString()
  expiresAt?: Date;

  @ApiPropertyOptional({ description: 'Ghi chú thanh toán' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Metadata thanh toán' })
  @IsOptional()
  metadata?: any;

  @ApiPropertyOptional({ description: 'Tags thanh toán' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
