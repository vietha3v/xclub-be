import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChallengeController } from './challenge.controller';
import { ChallengeTeamController } from './controllers/challenge-team.controller';
import { ChallengeInvitationController } from './controllers/challenge-invitation.controller';
import { ChallengeTeamLeaderboardController } from './controllers/challenge-team-leaderboard.controller';
import { ChallengeService } from './challenge.service';
import { Challenge } from './entities/challenge.entity';
import { ChallengeParticipant } from './entities/challenge-participant.entity';
import { ChallengeLeaderboard } from './entities/challenge-leaderboard.entity';
import { ChallengeTeam } from './entities/challenge-team.entity';
import { ChallengeTeamMember } from './entities/challenge-team-member.entity';
import { ChallengeInvitation } from './entities/challenge-invitation.entity';
import { ChallengeTeamLeaderboard } from './entities/challenge-team-leaderboard.entity';
import { ChallengeParticipantService } from './services/challenge-participant.service';
import { ChallengeLeaderboardService } from './services/challenge-leaderboard.service';
import { ChallengeTeamService } from './services/challenge-team.service';
import { ChallengeInvitationService } from './services/challenge-invitation.service';
import { ChallengeTeamLeaderboardService } from './services/challenge-team-leaderboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Challenge, 
      ChallengeParticipant, 
      ChallengeLeaderboard,
      ChallengeTeam,
      ChallengeTeamMember,
      ChallengeInvitation,
      ChallengeTeamLeaderboard
    ]),
  ],
  controllers: [
    ChallengeController,
    ChallengeTeamController,
    ChallengeInvitationController,
    ChallengeTeamLeaderboardController,
  ],
  providers: [
    ChallengeService,
    ChallengeParticipantService,
    ChallengeLeaderboardService,
    ChallengeTeamService,
    ChallengeInvitationService,
    ChallengeTeamLeaderboardService,
  ],
  exports: [
    ChallengeService,
    ChallengeParticipantService,
    ChallengeLeaderboardService,
    ChallengeTeamService,
    ChallengeInvitationService,
    ChallengeTeamLeaderboardService,
  ],
})
export class ChallengeModule {}
