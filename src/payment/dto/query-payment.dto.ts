import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, IsEnum, IsUUID, IsDateString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentType, PaymentStatus, PaymentMethod, PaymentCurrency } from '../entities/payment.entity';

export class QueryPaymentDto {
  @ApiPropertyOptional({ description: 'Trang hiện tại', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Số lượng item mỗi trang', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm (tên, mô tả)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Lọc theo loại thanh toán' })
  @IsOptional()
  @IsEnum(PaymentType)
  type?: PaymentType;

  @ApiPropertyOptional({ description: 'Lọc theo trạng thái thanh toán' })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiPropertyOptional({ description: 'Lọc theo phương thức thanh toán' })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @ApiPropertyOptional({ description: 'Lọc theo tiền tệ' })
  @IsOptional()
  @IsEnum(PaymentCurrency)
  currency?: PaymentCurrency;

  @ApiPropertyOptional({ description: 'Lọc theo ID người thanh toán' })
  @IsOptional()
  @IsUUID()
  payerId?: string;

  @ApiPropertyOptional({ description: 'Lọc theo ID người nhận' })
  @IsOptional()
  @IsUUID()
  payeeId?: string;

  @ApiPropertyOptional({ description: 'Lọc theo ID câu lạc bộ' })
  @IsOptional()
  @IsUUID()
  clubId?: string;

  @ApiPropertyOptional({ description: 'Lọc theo ID đối tượng liên quan' })
  @IsOptional()
  @IsUUID()
  relatedObjectId?: string;

  @ApiPropertyOptional({ description: 'Lọc theo loại đối tượng liên quan' })
  @IsOptional()
  @IsString()
  relatedObjectType?: string;

  @ApiPropertyOptional({ description: 'Lọc theo số tiền tối thiểu' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @ApiPropertyOptional({ description: 'Lọc theo số tiền tối đa' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxAmount?: number;

  @ApiPropertyOptional({ description: 'Lọc theo ngày tạo từ' })
  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @ApiPropertyOptional({ description: 'Lọc theo ngày tạo đến' })
  @IsOptional()
  @IsDateString()
  createdTo?: string;

  @ApiPropertyOptional({ description: 'Lọc theo tags' })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({ description: 'Sắp xếp theo trường nào (e.g., createdAt, amount)' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Thứ tự sắp xếp (ASC, DESC)', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}
