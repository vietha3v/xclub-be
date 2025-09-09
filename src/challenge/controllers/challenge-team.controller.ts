import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  UseGuards,
  Req,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ChallengeTeamService } from '../services/challenge-team.service';
import { CreateTeamDto } from '../dto/create-team.dto';
import { AddMemberDto } from '../dto/add-member.dto';
import { ChallengeTeam } from '../entities/challenge-team.entity';
import { ChallengeTeamMember } from '../entities/challenge-team-member.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('🏆 Quản lý team thử thách')
@Controller('challenges/:challengeId/teams')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ChallengeTeamController {
  constructor(private readonly challengeTeamService: ChallengeTeamService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo team tham gia thử thách' })
  @ApiParam({ name: 'challengeId', description: 'ID của thử thách' })
  @ApiResponse({ 
    status: 201, 
    description: 'Tạo team thành công',
    type: ChallengeTeam
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 409, description: 'Club đã có team trong thử thách này' })
  async createTeam(
    @Param('challengeId') challengeId: string,
    @Body() createTeamDto: CreateTeamDto,
    @Req() req: any
  ): Promise<ChallengeTeam> {
    return this.challengeTeamService.createTeam(challengeId, req.user.clubId, createTeamDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách teams tham gia thử thách' })
  @ApiParam({ name: 'challengeId', description: 'ID của thử thách' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách teams',
    type: [ChallengeTeam]
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async getTeams(@Param('challengeId') challengeId: string): Promise<ChallengeTeam[]> {
    return this.challengeTeamService.getTeamsByChallenge(challengeId);
  }

  @Post(':teamId/members')
  @ApiOperation({ summary: 'Thêm thành viên vào team' })
  @ApiParam({ name: 'challengeId', description: 'ID của thử thách' })
  @ApiParam({ name: 'teamId', description: 'ID của team' })
  @ApiResponse({ 
    status: 201, 
    description: 'Thêm thành viên thành công',
    type: ChallengeTeamMember
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Team không tồn tại' })
  @ApiResponse({ status: 409, description: 'Thành viên đã có trong team này' })
  async addMember(
    @Param('challengeId') challengeId: string,
    @Param('teamId') teamId: string,
    @Body() addMemberDto: AddMemberDto
  ): Promise<ChallengeTeamMember> {
    return this.challengeTeamService.addMember(teamId, addMemberDto);
  }

  @Delete(':teamId/members/:userId')
  @ApiOperation({ summary: 'Xóa thành viên khỏi team' })
  @ApiParam({ name: 'challengeId', description: 'ID của thử thách' })
  @ApiParam({ name: 'teamId', description: 'ID của team' })
  @ApiParam({ name: 'userId', description: 'ID của người dùng' })
  @ApiResponse({ 
    status: 200, 
    description: 'Xóa thành viên thành công'
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Thành viên không tồn tại trong team này' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @Param('challengeId') challengeId: string,
    @Param('teamId') teamId: string,
    @Param('userId') userId: string
  ): Promise<void> {
    return this.challengeTeamService.removeMember(teamId, userId);
  }

  @Get(':teamId/members')
  @ApiOperation({ summary: 'Lấy danh sách thành viên của team' })
  @ApiParam({ name: 'challengeId', description: 'ID của thử thách' })
  @ApiParam({ name: 'teamId', description: 'ID của team' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách thành viên',
    type: [ChallengeTeamMember]
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Team không tồn tại' })
  async getTeamMembers(
    @Param('challengeId') challengeId: string,
    @Param('teamId') teamId: string
  ): Promise<ChallengeTeamMember[]> {
    return this.challengeTeamService.getTeamMembers(teamId);
  }
}
