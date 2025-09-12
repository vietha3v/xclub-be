import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChallengeCategory } from './entities/challenge-category.entity';
import { CreateChallengeCategoryDto } from './dto/create-challenge-category.dto';
import { UpdateChallengeCategoryDto } from './dto/update-challenge-category.dto';
import { QueryChallengeCategoryDto } from './dto/query-challenge-category.dto';
import { Challenge } from '../challenge/entities/challenge.entity';

@Injectable()
export class ChallengeCategoryService {
  constructor(
    @InjectRepository(ChallengeCategory)
    private readonly challengeCategoryRepository: Repository<ChallengeCategory>,
    @InjectRepository(Challenge)
    private readonly challengeRepository: Repository<Challenge>,
  ) {}

  async create(challengeId: string, createChallengeCategoryDto: CreateChallengeCategoryDto): Promise<ChallengeCategory> {
    // Check if challenge exists
    const challenge = await this.challengeRepository.findOne({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new NotFoundException('Không tìm thấy thử thách');
    }

    try {
      const category = this.challengeCategoryRepository.create({
        ...createChallengeCategoryDto,
        challengeId,
      });

      return await this.challengeCategoryRepository.save(category);
    } catch (error) {
      throw new BadRequestException('Không thể tạo danh mục thử thách: ' + error.message);
    }
  }

  async findAll(challengeId: string, queryDto: QueryChallengeCategoryDto): Promise<{
    categories: ChallengeCategory[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      isRequired,
      isActive,
      sortBy = 'sortOrder',
      sortOrder = 'ASC',
    } = queryDto;

    const queryBuilder = this.challengeCategoryRepository.createQueryBuilder('category')
      .where('category.challengeId = :challengeId', { challengeId });

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(category.name ILIKE :search OR category.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (type) {
      queryBuilder.andWhere('category.type = :type', { type });
    }

    if (isRequired !== undefined) {
      queryBuilder.andWhere('category.isRequired = :isRequired', { isRequired });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('category.isActive = :isActive', { isActive });
    }

    // Apply sorting
    queryBuilder.orderBy(`category.${sortBy}`, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [categories, total] = await queryBuilder.getManyAndCount();

    return {
      categories,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(challengeId: string, id: string): Promise<ChallengeCategory> {
    const category = await this.challengeCategoryRepository.findOne({
      where: { id, challengeId },
    });

    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục thử thách');
    }

    return category;
  }

  async update(
    challengeId: string, 
    id: string, 
    updateChallengeCategoryDto: UpdateChallengeCategoryDto
  ): Promise<ChallengeCategory> {
    const category = await this.findOne(challengeId, id);

    try {
      Object.assign(category, updateChallengeCategoryDto);
      return await this.challengeCategoryRepository.save(category);
    } catch (error) {
      throw new BadRequestException('Không thể cập nhật danh mục thử thách: ' + error.message);
    }
  }

  async remove(challengeId: string, id: string): Promise<void> {
    const category = await this.findOne(challengeId, id);

    try {
      await this.challengeCategoryRepository.remove(category);
    } catch (error) {
      throw new BadRequestException('Không thể xóa danh mục thử thách: ' + error.message);
    }
  }
}
