import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChallengeTeam } from '../entities/challenge-team.entity';
import { ChallengeTeamMember } from '../entities/challenge-team-member.entity';
import { Challenge, ChallengeCategory } from '../entities/challenge.entity';
import { CreateTeamDto } from '../dto/create-team.dto';
import { AddMemberDto } from '../dto/add-member.dto';

@Injectable()
export class ChallengeTeamService {
  constructor(
    @InjectRepository(ChallengeTeam)
    private teamRepository: Repository<ChallengeTeam>,
    @InjectRepository(ChallengeTeamMember)
    private memberRepository: Repository<ChallengeTeamMember>,
    @InjectRepository(Challenge)
    private challengeRepository: Repository<Challenge>,
  ) {}

  /**
   * Tạo team mới cho thử thách
   */
  async createTeam(challengeId: string, clubId: string, createTeamDto: CreateTeamDto): Promise<ChallengeTeam> {
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

    // Kiểm tra team đã tồn tại chưa
    const existingTeam = await this.teamRepository.findOne({
      where: { challengeId, clubId, isDeleted: false }
    });

    if (existingTeam) {
      throw new ConflictException('Club đã có team trong thử thách này');
    }

    // Kiểm tra số lượng team tối đa
    if (challenge.maxTeams) {
      const currentTeamCount = await this.teamRepository.count({
        where: { challengeId, isDeleted: false }
      });

      if (currentTeamCount >= challenge.maxTeams) {
        throw new BadRequestException('Thử thách đã đạt giới hạn số lượng team');
      }
    }

    // Tạo team mới
    const team = this.teamRepository.create({
      challengeId,
      clubId,
      teamName: createTeamDto.teamName,
      totalDistance: 0,
      memberCount: 0,
    });

    return await this.teamRepository.save(team);
  }

  /**
   * Thêm thành viên vào team
   */
  async addMember(teamId: string, addMemberDto: AddMemberDto): Promise<ChallengeTeamMember> {
    // Kiểm tra team tồn tại
    const team = await this.teamRepository.findOne({
      where: { id: teamId, isDeleted: false },
      relations: ['challenge']
    });

    if (!team) {
      throw new NotFoundException('Team không tồn tại');
    }

    // Kiểm tra thành viên đã tồn tại chưa
    const existingMember = await this.memberRepository.findOne({
      where: { teamId, userId: addMemberDto.userId, isDeleted: false }
    });

    if (existingMember) {
      throw new ConflictException('Thành viên đã có trong team này');
    }

    // Kiểm tra số lượng thành viên tối đa
    if (team.challenge.maxTeamMembers) {
      const currentMemberCount = await this.memberRepository.count({
        where: { teamId, isDeleted: false }
      });

      if (currentMemberCount >= team.challenge.maxTeamMembers) {
        throw new BadRequestException('Team đã đạt giới hạn số lượng thành viên');
      }
    }

    // Tạo thành viên mới
    const member = this.memberRepository.create({
      teamId,
      userId: addMemberDto.userId,
      contributedDistance: 0,
      activityCount: 0,
    });

    const savedMember = await this.memberRepository.save(member);

    // Cập nhật số lượng thành viên trong team
    await this.updateTeamMemberCount(teamId);

    return savedMember;
  }

  /**
   * Xóa thành viên khỏi team
   */
  async removeMember(teamId: string, userId: string): Promise<void> {
    const member = await this.memberRepository.findOne({
      where: { teamId, userId, isDeleted: false }
    });

    if (!member) {
      throw new NotFoundException('Thành viên không tồn tại trong team này');
    }

    // Soft delete
    member.isDeleted = true;
    await this.memberRepository.save(member);

    // Cập nhật số lượng thành viên trong team
    await this.updateTeamMemberCount(teamId);
  }

  /**
   * Lấy danh sách teams của thử thách
   */
  async getTeamsByChallenge(challengeId: string): Promise<ChallengeTeam[]> {
    return await this.teamRepository.find({
      where: { challengeId, isDeleted: false },
      relations: ['members'],
      order: { totalDistance: 'DESC', createdAt: 'ASC' }
    });
  }

  /**
   * Lấy danh sách thành viên của team
   */
  async getTeamMembers(teamId: string): Promise<ChallengeTeamMember[]> {
    return await this.memberRepository.find({
      where: { teamId, isDeleted: false },
      order: { contributedDistance: 'DESC', joinedAt: 'ASC' }
    });
  }

  /**
   * Cập nhật tiến độ team
   */
  async updateTeamProgress(teamId: string): Promise<void> {
    const members = await this.memberRepository.find({
      where: { teamId, isDeleted: false }
    });

    const totalDistance = members.reduce((sum, member) => sum + Number(member.contributedDistance), 0);
    const memberCount = members.length;

    await this.teamRepository.update(teamId, {
      totalDistance,
      memberCount
    });
  }

  /**
   * Cập nhật số lượng thành viên trong team
   */
  private async updateTeamMemberCount(teamId: string): Promise<void> {
    const memberCount = await this.memberRepository.count({
      where: { teamId, isDeleted: false }
    });

    await this.teamRepository.update(teamId, { memberCount });
  }
}
