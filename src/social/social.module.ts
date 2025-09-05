import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialService } from './social.service';
import { SocialController } from './social.controller';
import { UserModule } from '../user/user.module';
import { ClubModule } from '../club/club.module';
import { ActivityModule } from '../activity/activity.module';
import { EventModule } from '../event/event.module';
import { ChallengeModule } from '../challenge/challenge.module';
import { RaceModule } from '../race/race.module';
import { AchievementModule } from '../achievement/achievement.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    UserModule,
    ClubModule,
    ActivityModule,
    EventModule,
    ChallengeModule,
    RaceModule,
    AchievementModule,
    NotificationModule,
  ],
  controllers: [SocialController],
  providers: [SocialService],
  exports: [SocialService],
})
export class SocialModule {}
