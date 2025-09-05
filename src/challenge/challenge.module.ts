import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChallengeController } from './challenge.controller';
import { ChallengeService } from './challenge.service';
import { Challenge } from './entities/challenge.entity';
import { ChallengeParticipant } from './entities/challenge-participant.entity';
import { ChallengeLeaderboard } from './entities/challenge-leaderboard.entity';
import { ChallengeParticipantService } from './services/challenge-participant.service';
import { ChallengeLeaderboardService } from './services/challenge-leaderboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Challenge, ChallengeParticipant, ChallengeLeaderboard]),
  ],
  controllers: [ChallengeController],
  providers: [
    ChallengeService,
    ChallengeParticipantService,
    ChallengeLeaderboardService,
  ],
  exports: [
    ChallengeService,
    ChallengeParticipantService,
    ChallengeLeaderboardService,
  ],
})
export class ChallengeModule {}
