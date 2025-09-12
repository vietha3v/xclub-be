import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsBoolean, IsNumber, MinLength, MaxLength, Min, Max } from 'class-validator';
import { CategoryType } from '../entities/challenge-category.entity';

export class CreateChallengeCategoryDto {
  @ApiProperty({ description: 'Tên danh mục' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Mô tả danh mục', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ description: 'Loại danh mục', enum: CategoryType })
  @IsEnum(CategoryType)
  type: CategoryType;

  @ApiProperty({ description: 'Đơn vị đo lường' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  unit: string;

  @ApiProperty({ description: 'Giá trị tối thiểu', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minValue?: number;

  @ApiProperty({ description: 'Giá trị tối đa', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxValue?: number;

  @ApiProperty({ description: 'Danh mục bắt buộc', default: false })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiProperty({ description: 'Thứ tự sắp xếp', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}
