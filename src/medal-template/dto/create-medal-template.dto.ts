import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsBoolean, IsArray, ValidateNested, IsHexColor, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { MedalType, VariableType } from '../entities/medal-template.entity';

export class TemplateVariableDto {
  @ApiProperty({ description: 'Tên biến' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: 'Nhãn hiển thị' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  label: string;

  @ApiProperty({ description: 'Loại biến', enum: VariableType })
  @IsEnum(VariableType)
  type: VariableType;

  @ApiProperty({ description: 'Biến bắt buộc' })
  @IsBoolean()
  required: boolean;

  @ApiProperty({ description: 'Giá trị mặc định', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  defaultValue?: string;

  @ApiProperty({ description: 'Mô tả biến', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class CreateMedalTemplateDto {
  @ApiProperty({ description: 'Tên template' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Mô tả template', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ description: 'Loại huy chương', enum: MedalType })
  @IsEnum(MedalType)
  type: MedalType;

  @ApiProperty({ description: 'HTML template' })
  @IsString()
  @MinLength(1)
  htmlTemplate: string;

  @ApiProperty({ description: 'URL hình ảnh icon', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  iconImage?: string;

  @ApiProperty({ description: 'Màu chủ đạo', default: '#FFD700' })
  @IsString()
  @IsHexColor()
  color: string;

  @ApiProperty({ description: 'Các biến template', type: [TemplateVariableDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateVariableDto)
  variables: TemplateVariableDto[];

  @ApiProperty({ description: 'Template công khai', default: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
