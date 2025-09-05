import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsUUID, IsArray } from 'class-validator';
import { MediaType } from '../entities/media.entity';

export class UploadMediaDto {
  @ApiProperty({ description: 'Tên file' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Loại media' })
  @IsEnum(MediaType)
  type: MediaType;

  @ApiPropertyOptional({ description: 'Mô tả media' })
  @IsOptional()
  @IsString()
  description?: string;

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

  @ApiPropertyOptional({ description: 'Tags của media' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Quyền riêng tư' })
  @IsOptional()
  @IsEnum(['public', 'private', 'club', 'friends'])
  privacy?: string;
}
