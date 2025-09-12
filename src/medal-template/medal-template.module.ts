import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedalTemplate } from './entities/medal-template.entity';
import { MedalTemplateController } from './medal-template.controller';
import { MedalTemplateService } from './medal-template.service';

@Module({
  imports: [TypeOrmModule.forFeature([MedalTemplate])],
  controllers: [MedalTemplateController],
  providers: [MedalTemplateService],
  exports: [MedalTemplateService],
})
export class MedalTemplateModule {}
