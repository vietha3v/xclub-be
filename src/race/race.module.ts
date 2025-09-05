import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RaceController } from './race.controller';
import { RaceService } from './race.service';
import { Race } from './entities/race.entity';
import { RaceParticipant } from './entities/race-participant.entity';
import { RaceResult } from './entities/race-result.entity';
import { RaceParticipantService } from './services/race-participant.service';
import { RaceResultService } from './services/race-result.service';
import { UserModule } from '../user/user.module';
import { ClubModule } from '../club/club.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Race, RaceParticipant, RaceResult]),
    UserModule,
    ClubModule,
    ActivityModule,
  ],
  controllers: [RaceController],
  providers: [RaceService, RaceParticipantService, RaceResultService],
  exports: [RaceService, RaceParticipantService, RaceResultService],
})
export class RaceModule {}
