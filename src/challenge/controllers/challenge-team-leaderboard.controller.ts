import { 
  Controller, 
  Get, 
  Param, 
  Query, 
  UseGuards,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ChallengeTeamLeaderboardService } from '../services/challenge-team-leaderboard.service';
import { ChallengeTeamLeaderboard } from '../entities/challenge-team-leaderboard.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('🏅 Bảng xếp hạng team thử thách')
@Controller('challenges')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ChallengeTeamLeaderboardController {
  constructor(private readonly challengeTeamLeaderboardService: ChallengeTeamLeaderboardService) {}

  @Get(':challengeId/leaderboard/teams')
  @ApiOperation({ summary: 'Lấy bảng xếp hạng team của thử thách' })
  @ApiParam({ name: 'challengeId', description: 'ID của thử thách' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng team tối đa (mặc định: 50)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Bảng xếp hạng team',
    type: [ChallengeTeamLeaderboard]
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Thử thách không tồn tại' })
  async getTeamLeaderboard(
    @Param('challengeId') challengeId: string,
    @Query('limit') limit?: number
  ): Promise<ChallengeTeamLeaderboard[]> {
    return this.challengeTeamLeaderboardService.getTeamLeaderboard(challengeId, limit);
  }

  @Get(':challengeId/leaderboard/teams/top')
  @ApiOperation({ summary: 'Lấy top teams có điểm cao nhất' })
  @ApiParam({ name: 'challengeId', description: 'ID của thử thách' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng team tối đa (mặc định: 10)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Top teams',
    type: [ChallengeTeamLeaderboard]
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Thử thách không tồn tại' })
  async getTopTeams(
    @Param('challengeId') challengeId: string,
    @Query('limit') limit?: number
  ): Promise<ChallengeTeamLeaderboard[]> {
    return this.challengeTeamLeaderboardService.getTopTeams(challengeId, limit);
  }

  @Get(':challengeId/leaderboard/teams/:teamId/rank')
  @ApiOperation({ summary: 'Lấy xếp hạng của một team' })
  @ApiParam({ name: 'challengeId', description: 'ID của thử thách' })
  @ApiParam({ name: 'teamId', description: 'ID của team' })
  @ApiResponse({ 
    status: 200, 
    description: 'Xếp hạng của team',
    type: ChallengeTeamLeaderboard
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Team không tồn tại trong thử thách này' })
  async getTeamRank(
    @Param('challengeId') challengeId: string,
    @Param('teamId') teamId: string
  ): Promise<ChallengeTeamLeaderboard | null> {
    return this.challengeTeamLeaderboardService.getTeamRank(challengeId, teamId);
  }

  @Get(':challengeId/leaderboard/teams/stats')
  @ApiOperation({ summary: 'Lấy thống kê bảng xếp hạng team' })
  @ApiParam({ name: 'challengeId', description: 'ID của thử thách' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thống kê bảng xếp hạng team',
    schema: {
      type: 'object',
      properties: {
        totalTeams: { type: 'number' },
        averageDistance: { type: 'number' },
        highestDistance: { type: 'number' },
        lowestDistance: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Thử thách không tồn tại' })
  async getTeamLeaderboardStats(@Param('challengeId') challengeId: string) {
    return this.challengeTeamLeaderboardService.getTeamLeaderboardStats(challengeId);
  }
}
