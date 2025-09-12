import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChallengeCategory } from './entities/challenge-category.entity';
import { Challenge } from '../challenge/entities/challenge.entity';
import { ChallengeCategoryController } from './challenge-category.controller';
import { ChallengeCategoryService } from './challenge-category.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChallengeCategory, Challenge])],
  controllers: [ChallengeCategoryController],
  providers: [ChallengeCategoryService],
  exports: [ChallengeCategoryService],
})
export class ChallengeCategoryModule {}
