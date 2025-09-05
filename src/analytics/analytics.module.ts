import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { UserModule } from '../user/user.module';
import { ClubModule } from '../club/club.module';
import { ActivityModule } from '../activity/activity.module';
import { EventModule } from '../event/event.module';
import { ChallengeModule } from '../challenge/challenge.module';
import { RaceModule } from '../race/race.module';
import { AchievementModule } from '../achievement/achievement.module';
import { PaymentModule } from '../payment/payment.module';
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
    PaymentModule,
    NotificationModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
