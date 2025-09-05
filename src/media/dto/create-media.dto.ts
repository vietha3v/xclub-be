import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsUUID, IsArray, IsNumber, Min, Max } from 'class-validator';
import { MediaType, MediaStatus } from '../entities/media.entity';

export class CreateMediaDto {
  @ApiProperty({ description: 'Tên file' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Loại media' })
  @IsEnum(MediaType)
  type: MediaType;

  @ApiProperty({ description: 'Kích thước file (bytes)' })
  @IsNumber()
  @Min(0)
  size: number;

  @ApiProperty({ description: 'MIME type' })
  @IsString()
  mimeType: string;

  @ApiProperty({ description: 'Đường dẫn file' })
  @IsString()
  filePath: string;

  @ApiPropertyOptional({ description: 'URL truy cập' })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ description: 'Mô tả media' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'ID người upload' })
  @IsOptional()
  @IsUUID()
  uploadedBy?: string;

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

  @ApiPropertyOptional({ description: 'Metadata của file' })
  @IsOptional()
  metadata?: any;

  @ApiPropertyOptional({ description: 'Tags của media' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Quyền riêng tư' })
  @IsOptional()
  @IsEnum(['public', 'private', 'club', 'friends'])
  privacy?: string;

  @ApiPropertyOptional({ description: 'Thời gian hết hạn' })
  @IsOptional()
  expiresAt?: Date;
}
