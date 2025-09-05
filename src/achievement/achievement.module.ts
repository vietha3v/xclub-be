import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achievement } from './entities/achievement.entity';
import { AchievementService } from './achievement.service';
import { AchievementController } from './achievement.controller';
import { UserModule } from '../user/user.module';
import { ClubModule } from '../club/club.module';
import { ActivityModule } from '../activity/activity.module';
import { RaceModule } from '../race/race.module';
import { ChallengeModule } from '../challenge/challenge.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Achievement]),
    UserModule,
    ClubModule,
    ActivityModule,
    RaceModule,
    ChallengeModule,
  ],
  controllers: [AchievementController],
  providers: [AchievementService],
  exports: [AchievementService],
})
export class AchievementModule {}
