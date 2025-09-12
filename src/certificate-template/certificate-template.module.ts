import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificateTemplate } from './entities/certificate-template.entity';
import { CertificateTemplateController } from './certificate-template.controller';
import { CertificateTemplateService } from './certificate-template.service';

@Module({
  imports: [TypeOrmModule.forFeature([CertificateTemplate])],
  controllers: [CertificateTemplateController],
  providers: [CertificateTemplateService],
  exports: [CertificateTemplateService],
})
export class CertificateTemplateModule {}
