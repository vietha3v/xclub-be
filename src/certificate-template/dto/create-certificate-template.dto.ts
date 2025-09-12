import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsBoolean, IsArray, ValidateNested, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { CertificateType, VariableType } from '../entities/certificate-template.entity';

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

export class CreateCertificateTemplateDto {
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

  @ApiProperty({ description: 'Loại giấy chứng nhận', enum: CertificateType })
  @IsEnum(CertificateType)
  type: CertificateType;

  @ApiProperty({ description: 'HTML template' })
  @IsString()
  @MinLength(1)
  htmlTemplate: string;

  @ApiProperty({ description: 'URL hình nền', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  backgroundImage?: string;

  @ApiProperty({ description: 'URL logo', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoImage?: string;

  @ApiProperty({ description: 'URL chữ ký', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  signatureImage?: string;

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
