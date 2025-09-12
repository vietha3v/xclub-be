import { PartialType } from '@nestjs/swagger';
import { CreateCertificateTemplateDto } from './create-certificate-template.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCertificateTemplateDto extends PartialType(CreateCertificateTemplateDto) {
  @ApiProperty({ description: 'Template hoạt động', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
