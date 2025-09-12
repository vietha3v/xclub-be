import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { MedalTemplate } from './entities/medal-template.entity';
import { CreateMedalTemplateDto } from './dto/create-medal-template.dto';
import { UpdateMedalTemplateDto } from './dto/update-medal-template.dto';
import { QueryMedalTemplateDto } from './dto/query-medal-template.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { createPaginatedResult, getPaginationParams } from '../common/utils/pagination.util';

@Injectable()
export class MedalTemplateService {
  constructor(
    @InjectRepository(MedalTemplate)
    private readonly medalTemplateRepository: Repository<MedalTemplate>,
  ) {}

  async create(userId: string, createMedalTemplateDto: CreateMedalTemplateDto): Promise<MedalTemplate> {
    try {
      const medalTemplate = this.medalTemplateRepository.create({
        ...createMedalTemplateDto,
        userId,
      });

      return await this.medalTemplateRepository.save(medalTemplate);
    } catch (error) {
      throw new BadRequestException('Không thể tạo mẫu huy chương: ' + error.message);
    }
  }

  async findAll(queryDto: QueryMedalTemplateDto): Promise<PaginatedResult<MedalTemplate>> {
    const {
      search,
      type,
      userId,
      isPublic,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryDto;

    const { page, limit, skip } = getPaginationParams(queryDto.page, queryDto.limit);

    const queryBuilder = this.medalTemplateRepository.createQueryBuilder('template');

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(template.name ILIKE :search OR template.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (type) {
      queryBuilder.andWhere('template.type = :type', { type });
    }

    if (userId) {
      queryBuilder.andWhere('template.userId = :userId', { userId });
    }

    if (isPublic !== undefined) {
      queryBuilder.andWhere('template.isPublic = :isPublic', { isPublic });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('template.isActive = :isActive', { isActive });
    }

    // Apply sorting
    queryBuilder.orderBy(`template.${sortBy}`, sortOrder);

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    const [templates, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResult(templates, total, page, limit);
  }

  async findOne(id: string): Promise<MedalTemplate> {
    const template = await this.medalTemplateRepository.findOne({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Không tìm thấy mẫu huy chương');
    }

    return template;
  }

  async update(userId: string, id: string, updateMedalTemplateDto: UpdateMedalTemplateDto): Promise<MedalTemplate> {
    const template = await this.findOne(id);

    // Check ownership
    if (template.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa mẫu huy chương này');
    }

    try {
      Object.assign(template, updateMedalTemplateDto);
      return await this.medalTemplateRepository.save(template);
    } catch (error) {
      throw new BadRequestException('Không thể cập nhật mẫu huy chương: ' + error.message);
    }
  }

  async remove(userId: string, id: string): Promise<void> {
    const template = await this.findOne(id);

    // Check ownership
    if (template.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa mẫu huy chương này');
    }

    try {
      await this.medalTemplateRepository.remove(template);
    } catch (error) {
      throw new BadRequestException('Không thể xóa mẫu huy chương: ' + error.message);
    }
  }

}
