import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChallengeInvitation, InvitationStatus } from '../entities/challenge-invitation.entity';
import { Challenge, ChallengeCategory } from '../entities/challenge.entity';
import { SendInvitationDto } from '../dto/send-invitation.dto';
import { RespondInvitationDto } from '../dto/respond-invitation.dto';

@Injectable()
export class ChallengeInvitationService {
  constructor(
    @InjectRepository(ChallengeInvitation)
    private invitationRepository: Repository<ChallengeInvitation>,
    @InjectRepository(Challenge)
    private challengeRepository: Repository<Challenge>,
  ) {}

  /**
   * Gửi lời mời tham gia thử thách
   */
  async sendInvitation(challengeId: string, sendInvitationDto: SendInvitationDto, invitedBy: string): Promise<ChallengeInvitation> {
    // Kiểm tra thử thách tồn tại và là team challenge
    const challenge = await this.challengeRepository.findOne({
      where: { id: challengeId, isDeleted: false }
    });

    if (!challenge) {
      throw new NotFoundException('Thử thách không tồn tại');
    }

    if (challenge.category !== ChallengeCategory.TEAM) {
      throw new BadRequestException('Thử thách này không phải là thử thách tập thể');
    }

    // Kiểm tra lời mời đã tồn tại chưa
    const existingInvitation = await this.invitationRepository.findOne({
      where: { challengeId, invitedClubId: sendInvitationDto.clubId, isDeleted: false }
    });

    if (existingInvitation) {
      throw new ConflictException('Đã gửi lời mời cho club này');
    }

    // Tạo lời mời mới
    const invitation = this.invitationRepository.create({
      challengeId,
      invitedClubId: sendInvitationDto.clubId,
      invitedBy,
      status: InvitationStatus.PENDING,
      expiresAt: sendInvitationDto.expiresAt ? new Date(sendInvitationDto.expiresAt) : undefined,
    });

    return await this.invitationRepository.save(invitation);
  }

  /**
   * Phản hồi lời mời
   */
  async respondToInvitation(invitationId: string, respondDto: RespondInvitationDto): Promise<ChallengeInvitation> {
    const invitation = await this.invitationRepository.findOne({
      where: { id: invitationId, isDeleted: false }
    });

    if (!invitation) {
      throw new NotFoundException('Lời mời không tồn tại');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Lời mời đã được phản hồi');
    }

    // Kiểm tra hết hạn
    if (invitation.expiresAt && new Date() > invitation.expiresAt) {
      invitation.status = InvitationStatus.EXPIRED;
      await this.invitationRepository.save(invitation);
      throw new BadRequestException('Lời mời đã hết hạn');
    }

    // Cập nhật trạng thái
    invitation.status = respondDto.status;
    invitation.respondedAt = new Date();

    return await this.invitationRepository.save(invitation);
  }

  /**
   * Lấy lời mời theo thử thách
   */
  async getInvitationsByChallenge(challengeId: string): Promise<ChallengeInvitation[]> {
    return await this.invitationRepository.find({
      where: { challengeId, isDeleted: false },
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Lấy lời mời theo club
   */
  async getInvitationsByClub(clubId: string): Promise<ChallengeInvitation[]> {
    return await this.invitationRepository.find({
      where: { invitedClubId: clubId, isDeleted: false },
      relations: ['challenge'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Lấy lời mời theo ID
   */
  async getInvitationById(invitationId: string): Promise<ChallengeInvitation> {
    const invitation = await this.invitationRepository.findOne({
      where: { id: invitationId, isDeleted: false },
      relations: ['challenge']
    });

    if (!invitation) {
      throw new NotFoundException('Lời mời không tồn tại');
    }

    return invitation;
  }

  /**
   * Xóa lời mời
   */
  async deleteInvitation(invitationId: string, userId: string): Promise<void> {
    const invitation = await this.getInvitationById(invitationId);

    // Chỉ người gửi mới có thể xóa
    if (invitation.invitedBy !== userId) {
      throw new BadRequestException('Bạn không có quyền xóa lời mời này');
    }

    // Soft delete
    invitation.isDeleted = true;
    invitation.deletedAt = new Date();
    invitation.deletedBy = userId;

    await this.invitationRepository.save(invitation);
  }
}
