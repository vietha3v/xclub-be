import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Patch, 
  Delete, 
  UseGuards,
  Req,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ChallengeInvitationService } from '../services/challenge-invitation.service';
import { SendInvitationDto } from '../dto/send-invitation.dto';
import { RespondInvitationDto } from '../dto/respond-invitation.dto';
import { ChallengeInvitation } from '../entities/challenge-invitation.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('📧 Quản lý lời mời thử thách')
@Controller('challenges')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ChallengeInvitationController {
  constructor(private readonly challengeInvitationService: ChallengeInvitationService) {}

  @Post(':challengeId/invite')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Gửi lời mời tham gia thử thách' })
  @ApiParam({ name: 'challengeId', description: 'ID của thử thách' })
  @ApiResponse({ 
    status: 201, 
    description: 'Gửi lời mời thành công',
    type: ChallengeInvitation
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Thử thách không tồn tại' })
  @ApiResponse({ status: 409, description: 'Đã gửi lời mời cho club này' })
  async sendInvitation(
    @Param('challengeId') challengeId: string,
    @Body() sendInvitationDto: SendInvitationDto,
    @Req() req: any
  ): Promise<ChallengeInvitation> {
    return this.challengeInvitationService.sendInvitation(challengeId, sendInvitationDto, req.user.userId);
  }

  @Get(':challengeId/invitations')
  @ApiOperation({ summary: 'Lấy danh sách lời mời của thử thách' })
  @ApiParam({ name: 'challengeId', description: 'ID của thử thách' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách lời mời',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/ChallengeInvitation' } }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async getInvitationsByChallenge(@Param('challengeId') challengeId: string): Promise<{ data: ChallengeInvitation[] }> {
    return this.challengeInvitationService.getInvitationsByChallenge(challengeId);
  }

  @Get('invitations/club/:clubId')
  @ApiOperation({ summary: 'Lấy danh sách lời mời của club' })
  @ApiParam({ name: 'clubId', description: 'ID của club' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách lời mời',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/ChallengeInvitation' } }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async getInvitationsByClub(@Param('clubId') clubId: string): Promise<{ data: ChallengeInvitation[] }> {
    return this.challengeInvitationService.getInvitationsByClub(clubId);
  }

  @Get('invitations/:invitationId')
  @ApiOperation({ summary: 'Lấy thông tin lời mời' })
  @ApiParam({ name: 'invitationId', description: 'ID của lời mời' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thông tin lời mời',
    type: ChallengeInvitation
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Lời mời không tồn tại' })
  async getInvitation(@Param('invitationId') invitationId: string): Promise<ChallengeInvitation> {
    return this.challengeInvitationService.getInvitationById(invitationId);
  }

  @Patch('invitations/:invitationId/respond')
  @ApiOperation({ summary: 'Phản hồi lời mời' })
  @ApiParam({ name: 'invitationId', description: 'ID của lời mời' })
  @ApiResponse({ 
    status: 200, 
    description: 'Phản hồi lời mời thành công',
    type: ChallengeInvitation
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ hoặc lời mời đã hết hạn' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Lời mời không tồn tại' })
  async respondToInvitation(
    @Param('invitationId') invitationId: string,
    @Body() respondDto: RespondInvitationDto
  ): Promise<ChallengeInvitation> {
    return this.challengeInvitationService.respondToInvitation(invitationId, respondDto);
  }

  @Delete('invitations/:invitationId')
  @ApiOperation({ summary: 'Xóa lời mời' })
  @ApiParam({ name: 'invitationId', description: 'ID của lời mời' })
  @ApiResponse({ 
    status: 200, 
    description: 'Xóa lời mời thành công'
  })
  @ApiResponse({ status: 400, description: 'Không có quyền xóa lời mời này' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Lời mời không tồn tại' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteInvitation(
    @Param('invitationId') invitationId: string,
    @Req() req: any
  ): Promise<void> {
    return this.challengeInvitationService.deleteInvitation(invitationId, req.user.userId);
  }
}
