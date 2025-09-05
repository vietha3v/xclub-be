import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { UserModule } from '../user/user.module';
import { ClubModule } from '../club/club.module';
import { ActivityModule } from '../activity/activity.module';
import { EventModule } from '../event/event.module';
import { ChallengeModule } from '../challenge/challenge.module';
import { RaceModule } from '../race/race.module';
import { AchievementModule } from '../achievement/achievement.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    UserModule,
    ClubModule,
    ActivityModule,
    EventModule,
    ChallengeModule,
    RaceModule,
    AchievementModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
