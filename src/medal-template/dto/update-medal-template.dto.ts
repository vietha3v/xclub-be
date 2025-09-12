import { PartialType } from '@nestjs/swagger';
import { CreateMedalTemplateDto } from './create-medal-template.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMedalTemplateDto extends PartialType(CreateMedalTemplateDto) {
  @ApiProperty({ description: 'Template hoạt động', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
