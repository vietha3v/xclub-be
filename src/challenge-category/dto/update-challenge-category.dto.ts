import { PartialType } from '@nestjs/swagger';
import { CreateChallengeCategoryDto } from './create-challenge-category.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateChallengeCategoryDto extends PartialType(CreateChallengeCategoryDto) {
  @ApiProperty({ description: 'Danh mục hoạt động', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
