import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { CertificateTemplate } from './entities/certificate-template.entity';
import { CreateCertificateTemplateDto } from './dto/create-certificate-template.dto';
import { UpdateCertificateTemplateDto } from './dto/update-certificate-template.dto';
import { QueryCertificateTemplateDto } from './dto/query-certificate-template.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { createPaginatedResult, getPaginationParams } from '../common/utils/pagination.util';

@Injectable()
export class CertificateTemplateService {
  constructor(
    @InjectRepository(CertificateTemplate)
    private readonly certificateTemplateRepository: Repository<CertificateTemplate>,
  ) {}

  async create(userId: string, createCertificateTemplateDto: CreateCertificateTemplateDto): Promise<CertificateTemplate> {
    try {
      const certificateTemplate = this.certificateTemplateRepository.create({
        ...createCertificateTemplateDto,
        userId,
      });

      return await this.certificateTemplateRepository.save(certificateTemplate);
    } catch (error) {
      throw new BadRequestException('Không thể tạo mẫu giấy chứng nhận: ' + error.message);
    }
  }

  async findAll(queryDto: QueryCertificateTemplateDto): Promise<PaginatedResult<CertificateTemplate>> {
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

    const queryBuilder = this.certificateTemplateRepository.createQueryBuilder('template');

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

  async findOne(id: string): Promise<CertificateTemplate> {
    const template = await this.certificateTemplateRepository.findOne({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Không tìm thấy mẫu giấy chứng nhận');
    }

    return template;
  }

  async update(userId: string, id: string, updateCertificateTemplateDto: UpdateCertificateTemplateDto): Promise<CertificateTemplate> {
    const template = await this.findOne(id);

    // Check ownership
    if (template.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa mẫu giấy chứng nhận này');
    }

    try {
      Object.assign(template, updateCertificateTemplateDto);
      return await this.certificateTemplateRepository.save(template);
    } catch (error) {
      throw new BadRequestException('Không thể cập nhật mẫu giấy chứng nhận: ' + error.message);
    }
  }

  async remove(userId: string, id: string): Promise<void> {
    const template = await this.findOne(id);

    // Check ownership
    if (template.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa mẫu giấy chứng nhận này');
    }

    try {
      await this.certificateTemplateRepository.remove(template);
    } catch (error) {
      throw new BadRequestException('Không thể xóa mẫu giấy chứng nhận: ' + error.message);
    }
  }

}
