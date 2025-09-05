import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from './entities/media.entity';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { UserModule } from '../user/user.module';
import { ClubModule } from '../club/club.module';
import { EventModule } from '../event/event.module';
import { ChallengeModule } from '../challenge/challenge.module';
import { RaceModule } from '../race/race.module';
import { AchievementModule } from '../achievement/achievement.module';
import { SocialModule } from '../social/social.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Media]),
    UserModule,
    ClubModule,
    EventModule,
    ChallengeModule,
    RaceModule,
    AchievementModule,
    SocialModule,
  ],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
